import pandas as pd
import numpy as np
from sklearn.impute import SimpleImputer


def clean_data(df):

    df = df.copy()

    # -----------------------------------
    # 1. Remove duplicates
    # -----------------------------------
    df = df.drop_duplicates()

    # -----------------------------------
    # 2. Strip whitespace from column names
    # -----------------------------------
    df.columns = df.columns.str.strip()

    # -----------------------------------
    # 3. Try to convert date columns
    # -----------------------------------
    for col in df.columns:
        if df[col].dtype == "object":
            try:
                parsed = pd.to_datetime(df[col], errors="raise")
                if parsed.notna().sum() > 0.8 * len(df):
                    df[col] = parsed
            except Exception:
                pass

    # -----------------------------------
    # 4. Remove columns with too many missing values (>50%)
    # -----------------------------------
    missing_ratio = df.isnull().mean()
    df = df.loc[:, missing_ratio < 0.5]

    # -----------------------------------
    # 5. Remove constant columns
    # -----------------------------------
    nunique = df.nunique()
    df = df.loc[:, nunique > 1]

    # -----------------------------------
    # 6. Separate column types
    # -----------------------------------
    num_cols = df.select_dtypes(include=["int64", "float64"]).columns
    cat_cols = df.select_dtypes(include=["object"]).columns

    # -----------------------------------
    # 7. Impute missing values
    # -----------------------------------
    if len(num_cols) > 0:
        df[num_cols] = SimpleImputer(strategy="median").fit_transform(df[num_cols])

    if len(cat_cols) > 0:
        df[cat_cols] = SimpleImputer(strategy="most_frequent").fit_transform(df[cat_cols])

    # -----------------------------------
    # 8. Outlier Handling (IQR clipping)
    # -----------------------------------
    for col in num_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1

        lower = Q1 - 1.5 * IQR
        upper = Q3 + 1.5 * IQR

        df[col] = np.clip(df[col], lower, upper)

    # -----------------------------------
    # 9. Reset index
    # -----------------------------------
    df = df.reset_index(drop=True)

    return df