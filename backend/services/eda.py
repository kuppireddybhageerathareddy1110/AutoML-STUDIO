import numpy as np

def basic_eda(df):

    return {
        "shape": df.shape,
        "columns": list(df.columns),
        "missing": df.isnull().sum().to_dict(),
        "describe": df.describe().to_dict()
    }

def correlation(df):

    numeric = df.select_dtypes(include=['int64','float64'])
    return numeric.corr().fillna(0).to_dict()

def histograms(df):

    numeric = df.select_dtypes(include=['int64','float64'])
    data = {}

    for col in numeric.columns:
        counts, bins = np.histogram(numeric[col], bins=10)
        data[col] = {
            "bins": bins.tolist(),
            "counts": counts.tolist()
        }

    return data