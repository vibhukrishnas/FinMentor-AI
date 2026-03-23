"""
Model 2: Tax Regime Classifier
Trains a Random Forest Classifier on synthetic salary + deduction profiles.
Predicts: 0 = Old Regime better, 1 = New Regime better
Also outputs predicted tax under both regimes.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

np.random.seed(42)
N = 8000

# Real Indian FY24-25 Tax Slab Functions
def calc_old_tax(taxable):
    if taxable <= 250000: return 0
    tax = 0
    if taxable > 250000: tax += min(taxable - 250000, 250000) * 0.05
    if taxable > 500000: tax += min(taxable - 500000, 500000) * 0.20
    if taxable > 1000000: tax += (taxable - 1000000) * 0.30
    tax *= 1.04  # 4% cess
    if taxable <= 500000: tax = 0  # 87A rebate
    return round(tax)

def calc_new_tax(taxable):
    if taxable <= 300000: return 0
    tax = 0
    if taxable > 300000: tax += min(taxable - 300000, 300000) * 0.05
    if taxable > 600000: tax += min(taxable - 600000, 300000) * 0.10
    if taxable > 900000: tax += min(taxable - 900000, 300000) * 0.15
    if taxable > 1200000: tax += min(taxable - 1200000, 300000) * 0.20
    if taxable > 1500000: tax += (taxable - 1500000) * 0.30
    tax *= 1.04
    if taxable <= 700000: tax = 0
    return round(tax)

# Generate synthetic salary profiles
gross_salary = np.random.choice(
    [400000, 600000, 800000, 1000000, 1200000, 1500000, 1800000, 2000000, 2500000, 3000000, 5000000],
    N
)
sec_80c = np.random.uniform(0, 150000, N).astype(int)
hra = np.random.uniform(0, 200000, N).astype(int)
sec_80d = np.random.uniform(0, 75000, N).astype(int)
home_loan = np.random.uniform(0, 200000, N).astype(int)

# Calculate ground truth
old_deductions = np.minimum(sec_80c, 150000) + hra + np.minimum(sec_80d, 75000) + np.minimum(home_loan, 200000) + 50000
old_taxable = np.maximum(gross_salary - old_deductions, 0)
old_tax = np.array([calc_old_tax(t) for t in old_taxable])

new_taxable = np.maximum(gross_salary - 75000, 0)  # only std deduction in new
new_tax = np.array([calc_new_tax(t) for t in new_taxable])

# Label: 1 = new regime better (lower tax), 0 = old regime better
labels = (new_tax <= old_tax).astype(int)

df = pd.DataFrame({
    'gross_salary': gross_salary,
    'sec_80c': sec_80c,
    'hra': hra,
    'sec_80d': sec_80d,
    'home_loan': home_loan,
    'label': labels
})

print(f"Dataset: {df.shape}")
print(f"Class distribution:\n{df['label'].value_counts()}")

X = df.drop('label', axis=1)
y = df['label']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=150, max_depth=10, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n--- Tax Regime Classifier ---")
print(f"Accuracy: {acc:.4f}")
print(classification_report(y_test, y_pred, target_names=['Old Regime', 'New Regime']))
print(f"Feature Importances: {dict(zip(X.columns, model.feature_importances_.round(3)))}")

os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/tax_regime_model.pkl')
print("Saved: models/tax_regime_model.pkl")
