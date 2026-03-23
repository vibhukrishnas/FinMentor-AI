"""
Model 1: Money Health Score Predictor
Trains a Gradient Boosting Regressor on synthetic Indian financial profiles.
Predicts a financial wellness score (0-100) from 6 input features.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os

np.random.seed(42)
N = 5000  # synthetic samples

# Generate realistic Indian financial profiles
monthly_income = np.random.choice([25000, 40000, 60000, 80000, 100000, 150000, 200000, 300000, 500000], N)
monthly_expenses = monthly_income * np.random.uniform(0.3, 0.9, N)
emergency_fund = np.random.uniform(0, 12, N) * monthly_expenses  # 0-12 months of expenses
term_insurance = np.random.uniform(0, 1.5, N) * monthly_income * 12 * 10  # 0x to 15x annual
total_debt = np.random.uniform(0, 2, N) * monthly_income * 12  # 0-200% of annual income
invested_amount = np.random.uniform(0, 0.5, N) * monthly_income * 12  # 0-50% of annual income

# Calculate ground-truth score (this IS the formula the model will learn)
emergency_months = emergency_fund / np.maximum(monthly_expenses, 1)
emergency_score = np.clip(emergency_months / 6 * 100, 0, 100)

ideal_cover = monthly_income * 12 * 10
insurance_score = np.clip(term_insurance / np.maximum(ideal_cover, 1) * 100, 0, 100)

annual_income = monthly_income * 12
dti_ratio = total_debt / np.maximum(annual_income, 1)
debt_score = np.clip((1 - dti_ratio * 2) * 100, 0, 100)

investment_ratio = invested_amount / np.maximum(annual_income, 1)
invest_score = np.clip(investment_ratio * 200, 0, 100)

# Weighted overall score (the model learns these weights)
overall_score = (
    emergency_score * 0.30 +
    insurance_score * 0.25 +
    debt_score * 0.25 +
    invest_score * 0.20
)

# Add slight noise to make it a real ML problem
overall_score += np.random.normal(0, 2, N)
overall_score = np.clip(overall_score, 0, 100)

# Create DataFrame
df = pd.DataFrame({
    'monthly_income': monthly_income,
    'monthly_expenses': monthly_expenses,
    'emergency_fund': emergency_fund,
    'term_insurance': term_insurance,
    'total_debt': total_debt,
    'invested_amount': invested_amount,
    'health_score': overall_score
})

print(f"Dataset shape: {df.shape}")
print(df.describe().round(2))

# Train/test split
X = df.drop('health_score', axis=1)
y = df['health_score']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train Gradient Boosting Regressor
model = GradientBoostingRegressor(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"\n--- Money Health Score Model ---")
print(f"MAE: {mae:.2f}")
print(f"R² Score: {r2:.4f}")
print(f"Feature Importances: {dict(zip(X.columns, model.feature_importances_.round(3)))}")

# Save model
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/health_score_model.pkl')
print("Saved: models/health_score_model.pkl")
