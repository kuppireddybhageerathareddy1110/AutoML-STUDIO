


# 🚀 AutoML Studio

A modern, full-stack, production-ready AutoML platform for:

- 📊 Exploratory Data Analysis (EDA)
- 📈 Statistical Testing
- 🤖 Automated Machine Learning
- 🔍 Explainable AI (SHAP)
- 📉 Interactive Visualizations

Built with **FastAPI (Python)** + **Next.js (React/TypeScript)** and deployed on:

🌐 Frontend: https://automl-studio.netlify.app/  
⚙️ Backend API: https://automl-studio-022z.onrender.com/

---

## ✨ Features

### 📂 Dataset Upload
- CSV / XLSX support
- Automatic data cleaning
- Duplicate removal
- Missing value imputation

---

### 📊 Exploratory Data Analysis (EDA)
- Dataset shape
- Missing values
- Summary statistics
- Correlation matrix
- Histograms
- Feature analysis

---

### 📈 Statistical Testing
Automatically selects appropriate test:

- Pearson Correlation
- Spearman Correlation
- Chi-Square
- T-Test
- ANOVA
- Mann-Whitney
- Kruskal-Wallis

---

### 🤖 AutoML Engine
- Automatic problem detection (Classification / Regression)
- Automatic preprocessing:
  - Numeric scaling
  - Categorical encoding
  - Missing value handling
- Model comparison:
  - Logistic Regression
  - Random Forest
  - XGBoost
  - LightGBM
- Cross-validation
- Best model selection
- Automatic evaluation

---

### 📏 Metrics

**Classification:**
- Accuracy
- Precision
- Recall
- F1 Score
- Confusion Matrix
- ROC Curve
- AUC

**Regression:**
- R² Score
- RMSE

---

### 🔍 Explainable AI
- SHAP feature importance
- Top feature visualization
- Model interpretation

---

### 🎨 Modern UI
- Cyberpunk-inspired theme
- Glassmorphism
- Animated components
- Tab-based workflow
- Responsive design

---

## 🏗️ Architecture

Frontend (Next.js) ↓ FastAPI Backend (Render) ↓ ML Pipeline (Scikit-Learn + XGBoost + SHAP)

---

## 🛠 Tech Stack

### Backend
- FastAPI
- Pandas
- NumPy
- Scikit-learn
- XGBoost
- LightGBM
- SHAP
- Matplotlib
- Optuna
- SciPy
- Joblib

### Frontend
- Next.js (App Router)
- React
- TypeScript
- TailwindCSS
- Recharts
- Axios

---

## ⚙️ Local Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/kuppireddybhageerathareddy1110/AutoML-STUDIO.git
cd AutoML-STUDIO
```


2️⃣ Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at:

http://localhost:8000





3️⃣ Frontend Setup
```
cd frontend
npm install
npm run dev
```
Frontend runs at:

http://localhost:3000




🌍 Deployment

Backend → Render

Runtime: Python

Start Command:
```
uvicorn main:app --host 0.0.0.0 --port 10000
```

Frontend → Netlify

Base directory: frontend

Build command: npm run build





📡 API Endpoints

Method	Endpoint	Description
```
POST	/upload	Upload dataset
GET	/eda	Basic EDA
GET	/eda_full	Advanced EDA
GET	/feature_analysis	Feature statistics
GET	/stat_test?col1=A&col2=B	Statistical test
GET	/plot/distribution?col=...	Distribution plot
GET	/plot/box?col=...	Boxplot
GET	/plot/scatter?col1=A&col2=B	Scatter plot
POST	/train?target=...	Train AutoML model
GET	/shap	SHAP feature importance
```

Swagger Docs:

https://automl-studio-022z.onrender.com/docs



📸 Screenshots

Add screenshots of:

Dashboard

EDA tab

Model performance

SHAP feature importance







---

👨‍💻 Author

K Bhageeratha Reddy

GitHub: https://github.com/kuppireddybhageerathareddy1110


---

⭐ Why This Project?

This project demonstrates:

Full-stack engineering

Machine learning pipeline design

Explainable AI integration

Production deployment

API design

Modern UI/UX implementation


---

# 📄 Root `.gitignore` (Full Stack)

Create this in the project root:

```gitignore
# --------------------
# Python
# --------------------
__pycache__/
*.pyc
*.pyo
*.pyd
*.pkl
*.log
.env
venv/
backend/venv/
*.sqlite3

# --------------------
# Node
# --------------------
node_modules/
.next/
out/
dist/
build/
frontend/node_modules/

# --------------------
# Environment
# --------------------
.env
.env.local
.env.production

# --------------------
# IDE
# --------------------
.vscode/
.idea/
.DS_Store

# --------------------
# OS
# --------------------
Thumbs.db

# --------------------
# Netlify / Render
# --------------------
.netlify
.render

```
---

🚀 Your Project Is Now Production-Ready

Live URLs:

Frontend:

https://automl-studio.netlify.app/

Backend:

https://automl-studio-022z.onrender.com/

