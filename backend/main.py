from fastapi import FastAPI, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import os
import matplotlib.pyplot as plt
import base64
from io import BytesIO

from services.cleaning import clean_data
from services.eda import basic_eda, correlation, histograms
from services.statistics import auto_test
from services.model import train_model
from services.explain import shap_values

app = FastAPI(title="AutoML API")

# ----------------------------
# CORS
# ----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

global_df = None


# ----------------------------
# Utility
# ----------------------------
def check_dataset():
    if global_df is None:
        raise HTTPException(status_code=400, detail="No dataset uploaded yet")


def fig_to_base64(fig):
    buffer = BytesIO()
    fig.savefig(buffer, format="png", bbox_inches="tight")
    buffer.seek(0)
    img_str = base64.b64encode(buffer.read()).decode()
    plt.close(fig)
    return img_str


# ----------------------------
# Upload
# ----------------------------
@app.post("/upload")
async def upload(file: UploadFile):
    global global_df

    if file.filename.endswith(".csv"):
        global_df = pd.read_csv(file.file)
    elif file.filename.endswith(".xlsx"):
        global_df = pd.read_excel(file.file)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type")

    global_df = clean_data(global_df)

    return {
        "dataset_info": {
            "rows": len(global_df),
            "columns": len(global_df.columns),
            "column_names": list(global_df.columns),
        }
    }


# ----------------------------
# EDA
# ----------------------------
@app.get("/eda")
def get_eda():
    check_dataset()
    return basic_eda(global_df)


@app.get("/eda_full")
def get_eda_full():
    check_dataset()
    return {
        "correlation": correlation(global_df),
        "histograms": histograms(global_df),
    }


@app.get("/feature_analysis")
def get_feature_analysis():
    check_dataset()
    numeric_df = global_df.select_dtypes(include=["int64", "float64"])
    return {
        "missing": global_df.isnull().sum().to_dict(),
        "unique": global_df.nunique().to_dict(),
        "describe": numeric_df.describe().to_dict(),
    }


@app.get("/correlation")
def get_corr():
    check_dataset()
    return correlation(global_df)


@app.get("/histograms")
def get_hist():
    check_dataset()
    return histograms(global_df)


# ----------------------------
# Statistical Test
# ----------------------------
@app.get("/stat_test")
def stat_test(col1: str, col2: str):
    check_dataset()

    if col1 not in global_df.columns or col2 not in global_df.columns:
        raise HTTPException(status_code=400, detail="Invalid columns")

    return auto_test(global_df, col1, col2)


# ----------------------------
# Distribution Plot
# ----------------------------
@app.get("/plot/distribution")
def distribution_plot(col: str = None, column: str = None):
    check_dataset()
    column = col or column
    if not column or column not in global_df.columns:
        raise HTTPException(status_code=400, detail="Invalid column")

    fig, ax = plt.subplots(figsize=(8, 4))
    ax.hist(global_df[column].dropna(), bins=30, color='#7c3aed', edgecolor='white', alpha=0.85)
    ax.set_title(f"Distribution of {column}", fontsize=14, fontweight='bold')
    ax.set_xlabel(column)
    ax.set_ylabel("Frequency")
    ax.set_facecolor('#0f0f2a')
    fig.patch.set_facecolor('#0a0a1a')
    ax.tick_params(colors='#a0a0c0')
    ax.spines[['bottom','left','top','right']].set_color('#2d2d4e')

    return {"image": fig_to_base64(fig)}


# ----------------------------
# Box Plot
# ----------------------------
@app.get("/plot/box")
def box_plot(col: str = None, column: str = None):
    check_dataset()
    column = col or column
    if not column or column not in global_df.columns:
        raise HTTPException(status_code=400, detail="Invalid column")

    fig, ax = plt.subplots(figsize=(6, 6))
    bp = ax.boxplot(global_df[column].dropna(), patch_artist=True)
    for patch in bp['boxes']:
        patch.set_facecolor('#7c3aed')
        patch.set_alpha(0.7)
    ax.set_title(f"Boxplot of {column}", fontsize=14, fontweight='bold')
    ax.set_facecolor('#0f0f2a')
    fig.patch.set_facecolor('#0a0a1a')
    ax.tick_params(colors='#a0a0c0')
    ax.spines[['bottom','left','top','right']].set_color('#2d2d4e')

    return {"image": fig_to_base64(fig)}


# ----------------------------
# Scatter Plot
# ----------------------------
@app.get("/plot/scatter")
def scatter_plot(col1: str, col2: str):
    check_dataset()

    if col1 not in global_df.columns or col2 not in global_df.columns:
        raise HTTPException(status_code=400, detail="Invalid columns")

    fig, ax = plt.subplots(figsize=(8, 5))
    ax.scatter(global_df[col1], global_df[col2], color='#06b6d4', alpha=0.6, edgecolors='#7c3aed', linewidths=0.5, s=30)
    ax.set_xlabel(col1, color='#a0a0c0')
    ax.set_ylabel(col2, color='#a0a0c0')
    ax.set_title(f"{col1} vs {col2}", fontsize=14, fontweight='bold', color='white')
    ax.set_facecolor('#0f0f2a')
    fig.patch.set_facecolor('#0a0a1a')
    ax.tick_params(colors='#a0a0c0')
    ax.spines[['bottom','left','top','right']].set_color('#2d2d4e')

    return {"image": fig_to_base64(fig)}


# ----------------------------
# Train Model
# ----------------------------
@app.post("/train")
def train(target: str):

    check_dataset()

    if target not in global_df.columns:
        raise HTTPException(status_code=400, detail="Invalid target column")

    try:
        result = train_model(global_df, target)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ----------------------------
# SHAP
# ----------------------------
@app.get("/shap")
def shap_api():

    check_dataset()

    if not os.path.exists("best_model.pkl"):
        raise HTTPException(
            status_code=400,
            detail="No trained model found. Train model first."
        )

    try:
        return shap_values(global_df)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ----------------------------
# Preview & Download
# ----------------------------
@app.get("/preview")
def get_preview():
    check_dataset()
    # Return top 10 rows and column names for preview
    return {
        "columns": list(global_df.columns),
        "rows": global_df.head(10).values.tolist()
    }

@app.get("/download_model")
def download_model():
    if not os.path.exists("best_model.pkl"):
        raise HTTPException(status_code=404, detail="Model file not found")
    
    from fastapi.responses import FileResponse
    return FileResponse(
        path="best_model.pkl",
        filename="best_model.pkl",
        media_type="application/octet-stream"
    )