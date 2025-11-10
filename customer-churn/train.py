"""
Training script for Telco Customer Churn.
- Expects dataset CSV at `data/Telco-Customer-Churn.csv`.
- Produces saved models and plots under `models/` and `artifacts/`.
"""
import os
from pathlib import Path
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier, plot_tree
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, roc_curve, auc
import matplotlib.pyplot as plt
import joblib

# ---------------- PATH SETUP ----------------
ROOT = Path(__file__).resolve().parent
DATA_PATH = ROOT / 'data' / 'Telco-Customer-Churn.csv'
MODELS_DIR = ROOT / 'models'
ARTIFACTS_DIR = ROOT / 'artifacts'

MODELS_DIR.mkdir(exist_ok=True)
ARTIFACTS_DIR.mkdir(exist_ok=True)

# ---------------- LOAD DATA ----------------
print('📂 Loading dataset from', DATA_PATH)
if not DATA_PATH.exists():
    raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Please place the Telco-Customer-Churn.csv file there.")

df = pd.read_csv(DATA_PATH)
print('✅ Dataset loaded successfully. Shape:', df.shape)

# ---------------- CLEANING ----------------
# Drop customerID
if 'customerID' in df.columns:
    df = df.drop(columns=['customerID'])

# Clean TotalCharges: convert blanks to numeric
if 'TotalCharges' in df.columns:
    df['TotalCharges'] = pd.to_numeric(df['TotalCharges'], errors='coerce')
    mask = df['TotalCharges'].isna()
    if mask.any():
        if 'MonthlyCharges' in df.columns and 'tenure' in df.columns:
            df.loc[mask, 'TotalCharges'] = df.loc[mask, 'MonthlyCharges'] * df.loc[mask, 'tenure']
        df['TotalCharges'] = df['TotalCharges'].fillna(df['TotalCharges'].median())

# Target variable
if 'Churn' not in df.columns:
    raise KeyError('Churn column not in dataset')

y = df['Churn'].map({'Yes': 1, 'No': 0})
X = df.drop(columns=['Churn'])

# ---------------- FEATURES ----------------
numeric_cols = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
cat_cols = X.select_dtypes(include=['object']).columns.tolist()

print(f'🔢 Numeric columns: {len(numeric_cols)}')
print(f'🔠 Categorical columns: {len(cat_cols)}')

# Preprocessing pipelines
numeric_transformer = Pipeline(steps=[('scaler', StandardScaler())])
cat_transformer = Pipeline(steps=[('onehot', OneHotEncoder(handle_unknown="ignore"))])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_cols),
        ('cat', cat_transformer, cat_cols),
    ],
    remainder='drop'
)

# ---------------- DATA SPLIT ----------------
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.3, random_state=42, stratify=y
)
print(f"📊 Data split complete: Training samples = {len(X_train)}, Testing samples = {len(X_test)}")

# ---------------- MODEL TRAINING ----------------
log_pipe = Pipeline(steps=[('pre', preprocessor), ('clf', LogisticRegression(max_iter=1000))])
tree_pipe = Pipeline(steps=[('pre', preprocessor), ('clf', DecisionTreeClassifier(random_state=42, max_depth=6))])

print("\n🚀 Training models...")
log_pipe.fit(X_train, y_train)
tree_pipe.fit(X_train, y_train)
print("✅ Training complete!")

# Save models
joblib.dump(log_pipe, MODELS_DIR / 'logistic_pipeline.joblib')
joblib.dump(tree_pipe, MODELS_DIR / 'tree_pipeline.joblib')
print('💾 Models saved to', MODELS_DIR)

# ---------------- EVALUATION ----------------
models = {'LogisticRegression': log_pipe, 'DecisionTree': tree_pipe}
results = {}

print("\n📈 Model Evaluation Results:")
for name, pipe in models.items():
    y_pred = pipe.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    results[name] = {'accuracy': acc, 'f1': f1, 'confusion_matrix': cm}
    print(f" - {name}: Accuracy = {acc:.4f}, F1 = {f1:.4f}")

# ---------------- ROC CURVES ----------------
plt.figure(figsize=(8, 6))
for name, pipe in models.items():
    if hasattr(pipe, 'predict_proba'):
        y_score = pipe.predict_proba(X_test)[:, 1]
    else:
        y_score = pipe.decision_function(X_test)
    fpr, tpr, _ = roc_curve(y_test, y_score)
    roc_auc = auc(fpr, tpr)
    plt.plot(fpr, tpr, label=f'{name} (AUC = {roc_auc:.3f})')

plt.plot([0, 1], [0, 1], 'k--')
plt.xlabel('False Positive Rate')
plt.ylabel('True Positive Rate')
plt.title('ROC Curves')
plt.legend(loc='lower right')
plt.grid(True)
plt.tight_layout()
plt.savefig(ARTIFACTS_DIR / 'roc_curves.png')
print('📊 ROC curves saved.')

# ---------------- FEATURE IMPORTANCE ----------------
feature_names = []
try:
    pre = preprocessor
    pre.fit(X)
    num_names = numeric_cols
    cat_names = pre.named_transformers_['cat']['onehot'].get_feature_names_out(cat_cols).tolist()
    feature_names = num_names + cat_names
except Exception:
    feature_names = [f'f_{i}' for i in range(len(feature_names))]

tree_clf = tree_pipe.named_steps['clf']
importances = tree_clf.feature_importances_

if importances.sum() > 0:
    idx = np.argsort(importances)[::-1]
    top_idx = idx[:10]
    top_features = [(feature_names[i], importances[i]) for i in top_idx]
    print("\n🌳 Top 5 Important Features:")
    for f, imp in top_features[:5]:
        print(f"   {f}: {imp:.4f}")

    with open(ARTIFACTS_DIR / 'top_features.txt', 'w') as fh:
        for f, imp in top_features:
            fh.write(f"{f}\t{imp}\n")
else:
    print("⚠️ Tree importances are all zero?")

# ---------------- SAVE VISUALS & META ----------------
plt.figure(figsize=(20, 10))
plot_tree(tree_clf, feature_names=feature_names, class_names=['No', 'Yes'], filled=True, max_depth=3)
plt.tight_layout()
plt.savefig(ARTIFACTS_DIR / 'decision_tree.png')
print('🌲 Decision tree visualization saved.')

joblib.dump({'feature_names': feature_names, 'numeric_cols': numeric_cols, 'cat_cols': cat_cols},
            MODELS_DIR / 'preprocessor_meta.joblib')
print('💾 Preprocessor metadata saved.')

# ---------------- SAVE SUMMARY ----------------
summary_df = pd.DataFrame(
    [{'model': k, 'accuracy': v['accuracy'], 'f1': v['f1']} for k, v in results.items()]
)
summary_df.to_csv(ARTIFACTS_DIR / 'model_summary.csv', index=False)
print('\n📝 Model summary saved to', ARTIFACTS_DIR / 'model_summary.csv')

print("\n✅ Training script finished successfully!")
