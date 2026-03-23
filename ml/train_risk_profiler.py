"""
Model 3: Investment Risk Profiler & Asset Allocator
Trains a Multi-Output classifier that predicts:
  - Risk profile (Conservative / Moderate / Aggressive)
  - Recommended equity %, debt %, gold %
Based on age, income, dependents, existing investments, and risk tolerance score.
"""
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.multioutput import MultiOutputClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os

np.random.seed(42)
N = 6000

age = np.random.randint(22, 60, N)
monthly_income = np.random.choice([30000, 50000, 75000, 100000, 150000, 200000, 300000], N)
dependents = np.random.choice([0, 1, 2, 3, 4], N, p=[0.2, 0.3, 0.3, 0.15, 0.05])
existing_investments = np.random.uniform(0, 5000000, N).astype(int)
risk_tolerance = np.random.randint(1, 11, N)  # 1 = very conservative, 10 = very aggressive

# Generate ground-truth risk profiles based on realistic Indian financial planning rules
def assign_profile(row):
    score = 0
    # Age factor: younger = more aggressive
    if row['age'] < 30: score += 3
    elif row['age'] < 40: score += 2
    elif row['age'] < 50: score += 1
    
    # Income factor
    if row['monthly_income'] >= 150000: score += 2
    elif row['monthly_income'] >= 75000: score += 1
    
    # Dependents reduce risk appetite
    score -= min(row['dependents'], 2)
    
    # Self-reported risk tolerance (heaviest weight)
    score += row['risk_tolerance'] * 0.5
    
    if score >= 7: return 2        # Aggressive
    elif score >= 4: return 1      # Moderate
    else: return 0                 # Conservative

df = pd.DataFrame({
    'age': age,
    'monthly_income': monthly_income,
    'dependents': dependents,
    'existing_investments': existing_investments,
    'risk_tolerance': risk_tolerance,
})

df['risk_profile'] = df.apply(assign_profile, axis=1)

# Asset allocation based on risk profile + age (rule: equity = 100 - age, adjusted)
def get_allocation(row):
    if row['risk_profile'] == 2:  # Aggressive
        eq = min(90, 100 - row['age'] + 15)
        gold = 5
    elif row['risk_profile'] == 1:  # Moderate
        eq = min(70, 100 - row['age'])
        gold = 10
    else:  # Conservative
        eq = max(20, 100 - row['age'] - 15)
        gold = 15
    debt = 100 - eq - gold
    return eq, debt, gold

allocations = df.apply(get_allocation, axis=1, result_type='expand')
df['equity_pct'] = allocations[0]
df['debt_pct'] = allocations[1]
df['gold_pct'] = allocations[2]

print(f"Dataset: {df.shape}")
print(f"Risk Profile Distribution:\n{df['risk_profile'].value_counts().sort_index()}")
print(f"  0=Conservative, 1=Moderate, 2=Aggressive")

# Train risk profile classifier
X = df[['age', 'monthly_income', 'dependents', 'existing_investments', 'risk_tolerance']]
y = df['risk_profile']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = GradientBoostingClassifier(n_estimators=150, max_depth=5, learning_rate=0.1, random_state=42)
model.fit(X_train, y_train)

y_pred = model.predict(X_test)
acc = accuracy_score(y_test, y_pred)
print(f"\n--- Risk Profiler ---")
print(f"Accuracy: {acc:.4f}")
print(f"Feature Importances: {dict(zip(X.columns, model.feature_importances_.round(3)))}")

# Save both the classifier and the allocation lookup
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/risk_profiler_model.pkl')

# Save allocation mapping as a simple dict
allocation_map = {
    0: {"label": "Conservative", "equity": 30, "debt": 55, "gold": 15},
    1: {"label": "Moderate", "equity": 55, "debt": 35, "gold": 10},
    2: {"label": "Aggressive", "equity": 80, "debt": 15, "gold": 5},
}
joblib.dump(allocation_map, 'models/allocation_map.pkl')
print("Saved: models/risk_profiler_model.pkl + allocation_map.pkl")
