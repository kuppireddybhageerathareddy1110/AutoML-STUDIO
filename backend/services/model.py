import numpy as np
import joblib

from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer

from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import (
    accuracy_score, f1_score, precision_score, recall_score,
    confusion_matrix, roc_curve, auc,
    mean_squared_error, r2_score
)

from xgboost import XGBClassifier, XGBRegressor
from lightgbm import LGBMClassifier, LGBMRegressor


# -----------------------------------
# Detect Problem Type (Improved)
# -----------------------------------
def detect_problem_type(y):

    unique_values = y.nunique()

    # Numeric with many unique values → regression
    if y.dtype in ["int64", "float64"] and unique_values > 20:
        return "regression"

    # Exactly 2 classes → binary
    if unique_values == 2:
        return "binary"

    # More than 2 but small unique → multiclass
    return "multiclass"


# -----------------------------------
# Build Preprocessor
# -----------------------------------
def build_preprocessor(X):

    numeric_features = X.select_dtypes(include=["int64", "float64"]).columns
    categorical_features = X.select_dtypes(include=["object"]).columns

    numeric_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="median")),
        ("scaler", StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ("imputer", SimpleImputer(strategy="most_frequent")),
        ("onehot", OneHotEncoder(handle_unknown="ignore"))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features)
        ]
    )

    return preprocessor


# -----------------------------------
# Get Models
# -----------------------------------
def get_models(problem_type):

    if problem_type == "regression":
        return {
            "RandomForest": RandomForestRegressor(random_state=42),
            "XGBoost": XGBRegressor(random_state=42, verbosity=0),
            "LightGBM": LGBMRegressor(random_state=42)
        }

    return {
        "LogisticRegression": LogisticRegression(max_iter=1000),
        "RandomForest": RandomForestClassifier(random_state=42),
        "XGBoost": XGBClassifier(eval_metric="logloss", random_state=42, verbosity=0),
        "LightGBM": LGBMClassifier(random_state=42)
    }


# -----------------------------------
# Compare Models
# -----------------------------------
def compare_models(models, preprocessor, X_train, y_train, problem_type):

    scores = {}

    for name, model in models.items():

        pipeline = Pipeline([
            ("preprocessor", preprocessor),
            ("model", model)
        ])

        try:

            if problem_type == "regression":
                score = cross_val_score(
                    pipeline,
                    X_train,
                    y_train,
                    cv=5,
                    scoring="r2",
                    n_jobs=-1
                ).mean()

            else:
                cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

                score = cross_val_score(
                    pipeline,
                    X_train,
                    y_train,
                    cv=cv,
                    scoring="accuracy",
                    n_jobs=-1
                ).mean()

            scores[name] = score

        except Exception:
            scores[name] = -999  # prevent crash

    return scores


# -----------------------------------
# Train Best Model
# -----------------------------------
def train_model(df, target):

    if target not in df.columns:
        raise Exception("Invalid target column")

    X = df.drop(columns=[target])
    y = df[target]

    problem_type = detect_problem_type(y)

    if problem_type == "regression":
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42
        )
    else:
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, stratify=y, random_state=42
        )

    preprocessor = build_preprocessor(X)
    models = get_models(problem_type)

    scores = compare_models(models, preprocessor, X_train, y_train, problem_type)

    best_model_name = max(scores, key=scores.get)
    best_model = models[best_model_name]

    pipeline = Pipeline([
        ("preprocessor", preprocessor),
        ("model", best_model)
    ])

    pipeline.fit(X_train, y_train)

    # Save feature metadata for SHAP
    pipeline.feature_names_ = X.columns.tolist()
    pipeline.target_name_ = target

    joblib.dump(pipeline, "best_model.pkl")

    y_pred = pipeline.predict(X_test)

    # -----------------------------------
    # Regression Metrics
    # -----------------------------------
    if problem_type == "regression":

        rmse = np.sqrt(mean_squared_error(y_test, y_pred))
        r2 = r2_score(y_test, y_pred)

        return {
            "problem_type": problem_type,
            "best_model": best_model_name,
            "scores": scores,
            "metrics": {
                "rmse": float(rmse),
                "r2": float(r2)
            }
        }

    # -----------------------------------
    # Classification Metrics
    # -----------------------------------
    acc = accuracy_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred, average="weighted")
    precision = precision_score(y_test, y_pred, average="weighted")
    recall = recall_score(y_test, y_pred, average="weighted")
    cm = confusion_matrix(y_test, y_pred).tolist()

    result = {
        "problem_type": problem_type,
        "best_model": best_model_name,
        "scores": scores,
        "metrics": {
            "accuracy": float(acc),
            "f1_score": float(f1),
            "precision": float(precision),
            "recall": float(recall),
            "confusion_matrix": cm
        }
    }

    # ROC for binary only
    if problem_type == "binary":
        try:
            y_proba = pipeline.predict_proba(X_test)[:, 1]
            fpr, tpr, _ = roc_curve(y_test, y_proba)
            roc_auc = auc(fpr, tpr)

            result["metrics"]["roc_curve"] = {
                "fpr": fpr.tolist(),
                "tpr": tpr.tolist(),
                "auc": float(roc_auc)
            }
        except Exception:
            pass

    return result