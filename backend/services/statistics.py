from scipy import stats
import pandas as pd
import numpy as np


def is_normal(series):
    """Check normality using Shapiro test (sample if too large)."""
    sample = series.dropna()

    if len(sample) > 5000:
        sample = sample.sample(5000, random_state=42)

    stat, p = stats.shapiro(sample)
    return p > 0.05


def auto_test(df, col1, col2):

    if col1 not in df.columns or col2 not in df.columns:
        raise Exception("Invalid column names")

    data = df[[col1, col2]].dropna()

    x = data[col1]
    y = data[col2]

    # -----------------------------------
    # Case 1: Numeric vs Numeric
    # -----------------------------------
    if pd.api.types.is_numeric_dtype(x) and pd.api.types.is_numeric_dtype(y):

        normal_x = is_normal(x)
        normal_y = is_normal(y)

        if normal_x and normal_y:
            stat, p = stats.pearsonr(x, y)
            return {
                "test": "Pearson Correlation",
                "stat": float(stat),
                "p": float(p)
            }
        else:
            stat, p = stats.spearmanr(x, y)
            return {
                "test": "Spearman Correlation",
                "stat": float(stat),
                "p": float(p)
            }

    # -----------------------------------
    # Case 2: Categorical vs Categorical
    # -----------------------------------
    if x.dtype == "object" and y.dtype == "object":

        table = pd.crosstab(x, y)

        if table.size == 0:
            raise Exception("Not enough data for Chi-Square")

        stat, p, dof, _ = stats.chi2_contingency(table)

        return {
            "test": "Chi-Square Test",
            "stat": float(stat),
            "p": float(p),
            "dof": int(dof)
        }

    # -----------------------------------
    # Case 3: Numeric vs Categorical
    # -----------------------------------
    # Ensure numeric is x
    if not pd.api.types.is_numeric_dtype(x):
        x, y = y, x

    groups = [group.dropna() for _, group in pd.DataFrame({
        "num": x,
        "cat": y
    }).groupby("cat")["num"]]

    if len(groups) < 2:
        raise Exception("Not enough groups for comparison")

    # Binary group → t-test or Mann-Whitney
    if len(groups) == 2:

        normal = all(is_normal(g) for g in groups)

        if normal:
            stat, p = stats.ttest_ind(groups[0], groups[1])
            return {
                "test": "Independent T-Test",
                "stat": float(stat),
                "p": float(p)
            }
        else:
            stat, p = stats.mannwhitneyu(groups[0], groups[1])
            return {
                "test": "Mann-Whitney U",
                "stat": float(stat),
                "p": float(p)
            }

    # More than 2 groups → ANOVA or Kruskal
    normal = all(is_normal(g) for g in groups)

    if normal:
        stat, p = stats.f_oneway(*groups)
        return {
            "test": "ANOVA",
            "stat": float(stat),
            "p": float(p)
        }
    else:
        stat, p = stats.kruskal(*groups)
        return {
            "test": "Kruskal-Wallis",
            "stat": float(stat),
            "p": float(p)
        }