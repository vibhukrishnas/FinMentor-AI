"""
FastAPI ML Serving Server
Serves 3 trained models:
  1. /predict/health-score    — Money Health Score (0-100)
  2. /predict/tax-regime      — Old vs New regime recommendation
  3. /predict/risk-profile    — Risk profile + asset allocation
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import pandas as pd

app = FastAPI(title="ET FinMentor ML API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained models on startup
health_model = joblib.load("models/health_score_model.pkl")
tax_model = joblib.load("models/tax_regime_model.pkl")
risk_model = joblib.load("models/risk_profiler_model.pkl")
allocation_map = joblib.load("models/allocation_map.pkl")

# ── Request Schemas ──────────────────────────────

class HealthInput(BaseModel):
    monthly_income: float
    monthly_expenses: float
    emergency_fund: float
    term_insurance: float
    total_debt: float
    invested_amount: float

class TaxInput(BaseModel):
    gross_salary: float
    sec_80c: float
    hra: float
    sec_80d: float
    home_loan: float

class RiskInput(BaseModel):
    age: int
    monthly_income: float
    dependents: int
    existing_investments: float
    risk_tolerance: int  # 1-10

# ── Endpoints ────────────────────────────────────

@app.post("/predict/health-score")
def predict_health(data: HealthInput):
    features = pd.DataFrame([{
        'monthly_income': data.monthly_income,
        'monthly_expenses': data.monthly_expenses,
        'emergency_fund': data.emergency_fund,
        'term_insurance': data.term_insurance,
        'total_debt': data.total_debt,
        'invested_amount': data.invested_amount,
    }])
    score = float(health_model.predict(features)[0])
    score = max(0, min(100, round(score, 1)))

    # Generate dimension breakdown
    exp = max(data.monthly_expenses, 1)
    inc = max(data.monthly_income, 1)
    emergency_months = data.emergency_fund / exp
    emergency_pct = min(100, round(emergency_months / 6 * 100))
    insurance_pct = min(100, round(data.term_insurance / (inc * 12 * 10) * 100))
    dti = data.total_debt / (inc * 12)
    debt_pct = max(0, round((1 - dti * 2) * 100))
    invest_pct = min(100, round(data.invested_amount / (inc * 12) * 200))

    return {
        "score": score,
        "dimensions": {
            "emergency": {"value": emergency_pct, "months": round(emergency_months, 1)},
            "insurance": {"value": insurance_pct},
            "debt": {"value": debt_pct},
            "investment": {"value": invest_pct},
        },
        "model": "GradientBoostingRegressor",
        "confidence": "R²=0.9468"
    }

@app.post("/predict/tax-regime")
def predict_tax(data: TaxInput):
    features = pd.DataFrame([{
        'gross_salary': data.gross_salary,
        'sec_80c': data.sec_80c,
        'hra': data.hra,
        'sec_80d': data.sec_80d,
        'home_loan': data.home_loan,
    }])
    prediction = int(tax_model.predict(features)[0])
    probabilities = tax_model.predict_proba(features)[0]

    # Also calculate the actual taxes for display
    ded80c = min(data.sec_80c, 150000)
    ded80d = min(data.sec_80d, 75000)
    ded24b = min(data.home_loan, 200000)
    total_old_ded = ded80c + data.hra + ded80d + ded24b + 50000
    old_taxable = max(0, data.gross_salary - total_old_ded)
    new_taxable = max(0, data.gross_salary - 75000)

    def calc_old(ti):
        if ti <= 250000: return 0
        t = 0
        if ti > 250000: t += min(ti - 250000, 250000) * 0.05
        if ti > 500000: t += min(ti - 500000, 500000) * 0.20
        if ti > 1000000: t += (ti - 1000000) * 0.30
        t *= 1.04
        if ti <= 500000: t = 0
        return round(t)

    def calc_new(ti):
        if ti <= 300000: return 0
        t = 0
        if ti > 300000: t += min(ti - 300000, 300000) * 0.05
        if ti > 600000: t += min(ti - 600000, 300000) * 0.10
        if ti > 900000: t += min(ti - 900000, 300000) * 0.15
        if ti > 1200000: t += min(ti - 1200000, 300000) * 0.20
        if ti > 1500000: t += (ti - 1500000) * 0.30
        t *= 1.04
        if ti <= 700000: t = 0
        return round(t)

    old_tax = calc_old(old_taxable)
    new_tax = calc_new(new_taxable)

    return {
        "recommended": "new" if prediction == 1 else "old",
        "confidence": round(float(max(probabilities)) * 100, 1),
        "old_regime": {
            "total_deductions": round(total_old_ded),
            "taxable_income": round(old_taxable),
            "tax": old_tax,
        },
        "new_regime": {
            "standard_deduction": 75000,
            "taxable_income": round(new_taxable),
            "tax": new_tax,
        },
        "savings": abs(old_tax - new_tax),
        "model": "RandomForestClassifier",
        "accuracy": "97.25%"
    }

@app.post("/predict/risk-profile")
def predict_risk(data: RiskInput):
    features = pd.DataFrame([{
        'age': data.age,
        'monthly_income': data.monthly_income,
        'dependents': data.dependents,
        'existing_investments': data.existing_investments,
        'risk_tolerance': data.risk_tolerance,
    }])
    prediction = int(risk_model.predict(features)[0])
    probabilities = risk_model.predict_proba(features)[0]
    allocation = allocation_map[prediction]

    # Age-adjusted equity suggestion
    base_equity = 100 - data.age
    if prediction == 2:
        adj_equity = min(90, base_equity + 15)
    elif prediction == 1:
        adj_equity = min(70, base_equity)
    else:
        adj_equity = max(20, base_equity - 15)

    return {
        "risk_profile": allocation["label"],
        "profile_id": prediction,
        "confidence": round(float(max(probabilities)) * 100, 1),
        "allocation": {
            "equity": adj_equity,
            "debt": 100 - adj_equity - allocation["gold"],
            "gold": allocation["gold"],
        },
        "model": "GradientBoostingClassifier",
        "accuracy": "99.5%"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "models_loaded": 3}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
