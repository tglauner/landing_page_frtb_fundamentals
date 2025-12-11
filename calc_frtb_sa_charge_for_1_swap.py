#!/usr/bin/env python3
"""
Compute Basel III FRTB - GIRR (General Interest-Rate Risk) delta
capital charge for a single-currency swap book.

This is the standalone, hard-coded version of the calculation shown
in the Excel workbook One USD SOFR Swap Reconciliation.

Input
=====
Eight USD-SOFR delta sensitivities (already scaled by the bank's
internal model) are coded directly in the `DATA` list.

Output
======
The program prints the consolidated capital charge that you would see
in Excel cell Consolidated View!C4.

Usage
-----
$ python frtb_delta_charge.py            # prints charge in USD
$ python frtb_delta_charge.py --csv out  # writes step-by-step CSV

Author : Tim Glauner with the assistance of ChatGPT (o3) - 2025-07-03
"""

import argparse
import math
import numpy as np
import pandas as pd
from pathlib import Path

# ------------------------------------------------------------------
# 1.   Hard-coded trading-system sensitivities (USD)
# ------------------------------------------------------------------
DATA = [
    (0.25 ,   -1_095_000.0),
    (0.50 ,      -18_100.0),
    (1.00 ,     3_872_400.0),
    (2.00 ,     6_525_000.0),
    (3.00 ,    16_488_900.0),
    (5.00 ,   436_645_200.0),
    (10.00,       247_500.0),
    (15.00,        -4_500.0),
]

# ------------------------------------------------------------------
# 2.   Basel parameters (January 2019 text, Table 2-1)
#      Risk weights are divided by √2 for the “low” correlation
#      scenario embedded in the spreadsheet.
# ------------------------------------------------------------------
BIS_RW = {0.25:0.024, 0.5:0.024, 1:0.0225, 2:0.0188,
          3:0.0173, 5:0.015, 10:0.015, 15:0.015}
SQRT2  = math.sqrt(2.0)

# Cross-tenor correlation:  exp(−λ |T_i − T_j| / min(T_i, T_j))  ∨ ρ_floor
LAMBDA = 0.03    # λ  (sheet “BIS Data” cell H4)
FLOOR  = 0.40    # ρ_floor

# ------------------------------------------------------------------
def build_dataframe() -> pd.DataFrame:
    """Return a DataFrame with weighted sensitivities."""
    df = pd.DataFrame(DATA, columns=["Tenor","Scaled"])
    df["RW"]  = df["Tenor"].map(BIS_RW) / SQRT2
    df["WSk"] = df["Scaled"] * df["RW"]
    return df

def correlation_matrix(tenors: np.ndarray) -> np.ndarray:
    """Full cross-tenor correlation matrix Σ."""
    n = len(tenors)
    Σ = np.identity(n)
    for i,t1 in enumerate(tenors):
        for j,t2 in enumerate(tenors):
            if i == j:       # diagonal already 1.0
                continue
            ρ = math.exp(-LAMBDA * abs(t1 - t2) / min(t1, t2))
            Σ[i,j] = max(ρ, FLOOR)
    return Σ

def girr_delta_charge(df: pd.DataFrame) -> float:
    """Return FRTB delta capital charge (USD)."""
    Σ  = correlation_matrix(df["Tenor"].to_numpy())
    W  = df["WSk"].to_numpy()
    var = W @ Σ @ W      # Wᵀ Σ W
    return math.sqrt(abs(var))

# ------------------------------------------------------------------
def main(argv=None):
    parser = argparse.ArgumentParser(
        description="Basel III FRTB-GIRR delta charge calculator")
    parser.add_argument("--csv", metavar="PATH",
                        help="dump intermediate DataFrame to CSV")
    args = parser.parse_args(argv)

    df     = build_dataframe()
    charge = girr_delta_charge(df)

    print(f"Consolidated charge : {charge:,.6f} USD")
    if args.csv:
        path = Path(args.csv).with_suffix(".csv")
        df.to_csv(path, index=False)
        print(f"Detailed breakdown written to {path}")

if __name__ == "__main__":
    main()

