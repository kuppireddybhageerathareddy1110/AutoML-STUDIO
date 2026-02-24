import joblib
import shap
import numpy as np
import os
from fastapi import HTTPException


def shap_values(df):

    if not os.path.exists("best_model.pkl"):
        raise HTTPException(
            status_code=400,
            detail="No trained model found. Train model first."
        )

    pipeline = joblib.load("best_model.pkl")

    # Separate X (drop last trained target assumption unsafe)
    # Instead use pipeline feature names
    try:
        feature_names = pipeline.named_steps["preprocessor"].get_feature_names_out()
    except:
        feature_names = None

    # Extract original X correctly
    X = df.copy()

    # Remove target if stored in pipeline metadata
    if hasattr(pipeline, "feature_names_in_"):
        X = X[pipeline.feature_names_in_]

    # Transform data
    X_transformed = pipeline.named_steps["preprocessor"].transform(X)

    model = pipeline.named_steps["model"]

    # Use TreeExplainer for tree models (more stable)
    try:
        explainer = shap.TreeExplainer(model)
    except:
        explainer = shap.Explainer(model)

    shap_vals = explainer(X_transformed)

    values = shap_vals.values

    # Handle multiclass case
    if len(values.shape) == 3:
        values = values[:, :, 0]

    importance = np.abs(values).mean(axis=0)

    if feature_names is None:
        feature_names = [f"feature_{i}" for i in range(len(importance))]

    return {
        "features": list(feature_names),
        "importance": importance.tolist()
    }