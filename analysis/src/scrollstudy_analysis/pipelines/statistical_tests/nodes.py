"""
Statistical test nodes for RQ1-RQ4.
"""

import numpy as np
import pandas as pd
from scipy import stats


def rq1_condition_effects(
    participant_features: pd.DataFrame,
    paper_dprime_benchmark: float,
    paper_pct_frustrated_benchmark: float,
) -> dict:
    """
    RQ1: Does friction type affect d' compared to control?
    Dynamically detects conditions. Uses Mann-Whitney U for 2 groups,
    Kruskal-Wallis + pairwise Wilcoxon for 3+.
    """
    df = participant_features.copy()

    conditions = sorted(df["condition"].unique().tolist())
    groups = {c: df[df["condition"] == c]["dprime"].dropna().values for c in conditions}

    valid_groups = {c: g for c, g in groups.items() if len(g) >= 2}
    if len(valid_groups) < 2:
        return {"error": "Not enough data for statistical test", "condition_stats": {}}

    # Auto-select test based on number of conditions
    if len(valid_groups) == 2:
        cond_names = list(valid_groups.keys())
        g1, g2 = valid_groups[cond_names[0]], valid_groups[cond_names[1]]
        u_stat, p_val = stats.mannwhitneyu(g1, g2, alternative="two-sided")
        cohens_d = _cohens_d(g1, g2)
        omnibus = {
            "test": "mann_whitney_u",
            "u_statistic": float(u_stat),
            "p_value": float(p_val),
            "cohens_d": float(cohens_d),
            "comparison": f"{cond_names[0]} vs {cond_names[1]}",
        }
        pairwise = {
            f"{cond_names[0]}_vs_{cond_names[1]}": {
                "u_statistic": float(u_stat),
                "p_value": float(p_val),
                "significant": bool(p_val < 0.05),
                "cohens_d": float(cohens_d),
            }
        }
    else:
        h_stat, kw_p = stats.kruskal(*valid_groups.values())
        omnibus = {
            "test": "kruskal_wallis",
            "h_statistic": float(h_stat),
            "p_value": float(kw_p),
        }

        # Pairwise Wilcoxon with Bonferroni correction
        cond_list = list(valid_groups.keys())
        n_comparisons = len(cond_list) * (len(cond_list) - 1) // 2
        alpha_corrected = 0.05 / n_comparisons if n_comparisons > 0 else 0.05

        pairwise = {}
        for i, c1 in enumerate(cond_list):
            for c2 in cond_list[i + 1:]:
                u_stat, p_val = stats.mannwhitneyu(
                    valid_groups[c1], valid_groups[c2], alternative="two-sided"
                )
                cohens_d = _cohens_d(valid_groups[c1], valid_groups[c2])
                pairwise[f"{c1}_vs_{c2}"] = {
                    "u_statistic": float(u_stat),
                    "p_value": float(p_val),
                    "p_bonferroni": float(p_val * n_comparisons),
                    "significant": bool(p_val < alpha_corrected),
                    "cohens_d": float(cohens_d),
                }

    # Condition stats for plots
    condition_stats = {}
    for cond in conditions:
        vals = groups.get(cond, np.array([]))
        frust = df[df["condition"] == cond]["frustration"].dropna().values
        sat = df[df["condition"] == cond]["satisfaction"].dropna().values
        sb = df[df["condition"] == cond]["scroll_bandwidth"].dropna().values

        # % frustrated: proportion of participants with frustration >= 4
        pct_frustrated = None
        if len(frust) > 0:
            pct_frustrated = float(np.mean(frust >= 4))

        condition_stats[cond] = {
            "dprime_mean": float(np.mean(vals)) if len(vals) > 0 else None,
            "dprime_se": float(stats.sem(vals)) if len(vals) > 1 else None,
            "frustration_mean": float(np.mean(frust)) if len(frust) > 0 else None,
            "frustration_se": float(stats.sem(frust)) if len(frust) > 1 else None,
            "pct_frustrated": pct_frustrated,
            "satisfaction_mean": float(np.mean(sat)) if len(sat) > 0 else None,
            "satisfaction_se": float(stats.sem(sat)) if len(sat) > 1 else None,
            "scroll_bandwidth_mean": float(np.mean(sb)) if len(sb) > 0 else None,
            "scroll_bandwidth_se": float(stats.sem(sb)) if len(sb) > 1 else None,
            "n": int(len(vals)),
        }

    return {
        "omnibus": omnibus,
        "pairwise": pairwise,
        "condition_stats": condition_stats,
        "paper_dprime_benchmark": paper_dprime_benchmark,
        "paper_pct_frustrated_benchmark": paper_pct_frustrated_benchmark,
    }


def rq2_frequency_interaction(participant_features: pd.DataFrame) -> dict:
    """
    RQ2: How does friction frequency moderate recall-satisfaction trade-off?
    Returns warning if only 1 frequency level present.
    """
    df = participant_features.copy()

    distinct_freqs = df["friction_frequency"].dropna().unique()
    if len(distinct_freqs) <= 1:
        return {
            "warning": f"Only {len(distinct_freqs)} frequency level present ({distinct_freqs.tolist()}); skipping frequency interaction analysis",
            "freq_stats": {},
        }

    # Dynamic: use whatever conditions and frequencies exist
    freq_conditions = df[df["friction_frequency"].notna()]["condition"].unique().tolist()
    freqs = sorted(distinct_freqs.tolist())

    freq_stats = {}
    for cond in freq_conditions:
        cond_data = df[df["condition"] == cond]
        freq_stats[cond] = {}
        for freq in freqs:
            freq_data = cond_data[cond_data["friction_frequency"] == freq]
            dprime_vals = freq_data["dprime"].dropna().values
            frust_vals = freq_data["frustration"].dropna().values
            freq_stats[cond][str(int(freq))] = {
                "dprime_mean": float(np.mean(dprime_vals)) if len(dprime_vals) > 0 else None,
                "dprime_se": float(stats.sem(dprime_vals)) if len(dprime_vals) > 1 else None,
                "frustration_mean": float(np.mean(frust_vals)) if len(frust_vals) > 0 else None,
                "frustration_se": float(stats.sem(frust_vals)) if len(frust_vals) > 1 else None,
                "n": int(len(dprime_vals)),
            }

    return {"freq_stats": freq_stats}


def rq3_pareto_frontier(
    participant_features: pd.DataFrame,
    baseline_dprime: float,
    baseline_satisfaction: float,
    paper_dprime_benchmark: float,
    paper_pct_frustrated_benchmark: float,
) -> dict:
    """
    RQ3: Which modality achieves best balance between d' and % frustrated?
    Uses % frustrated (proportion with i2 >= 4) instead of satisfaction.
    Pareto-optimal = higher d' AND lower % frustrated.
    """
    df = participant_features.copy()

    conditions = sorted(df["condition"].unique().tolist())
    points = {}

    for cond in conditions:
        cond_data = df[df["condition"] == cond]
        dprime_vals = cond_data["dprime"].dropna().values
        frust_vals = cond_data["frustration"].dropna().values

        pct_frustrated = None
        if len(frust_vals) > 0:
            pct_frustrated = float(np.mean(frust_vals >= 4))

        points[cond] = {
            "dprime_mean": float(np.mean(dprime_vals)) if len(dprime_vals) > 0 else None,
            "pct_frustrated": pct_frustrated,
            "n": int(len(dprime_vals)),
            "is_baseline": False,
        }

    # Add baseline reference if no control condition in data
    if "control" not in conditions:
        points["control_baseline"] = {
            "dprime_mean": baseline_dprime,
            "pct_frustrated": 0.0,
            "n": 0,
            "is_baseline": True,
        }

    # Pareto-optimal: higher d' AND lower % frustrated
    pareto_optimal = []
    valid_points = {c: p for c, p in points.items()
                    if p["dprime_mean"] is not None and p["pct_frustrated"] is not None}

    for cond, p in valid_points.items():
        dominated = False
        for other_cond, other_p in valid_points.items():
            if other_cond == cond:
                continue
            if (other_p["dprime_mean"] >= p["dprime_mean"] and
                    other_p["pct_frustrated"] <= p["pct_frustrated"] and
                    (other_p["dprime_mean"] > p["dprime_mean"] or
                     other_p["pct_frustrated"] < p["pct_frustrated"])):
                dominated = True
                break
        if not dominated:
            pareto_optimal.append(cond)

    return {
        "points": points,
        "pareto_optimal": pareto_optimal,
        "paper_dprime_benchmark": paper_dprime_benchmark,
        "paper_pct_frustrated_benchmark": paper_pct_frustrated_benchmark,
    }


def rq4_usage_moderation(
    participant_features: pd.DataFrame,
    survey_responses: pd.DataFrame,
    baseline_dprime: float,
) -> dict:
    """
    RQ4: Does daily social media usage moderate friction effectiveness?
    Uses configurable baseline for d' improvement. Builds radar from raw survey data.
    """
    df = participant_features.copy()

    # Spearman rho per condition (dynamic)
    conditions = sorted(df["condition"].unique().tolist())
    spearman = {}
    for cond in conditions:
        cond_data = df[df["condition"] == cond].dropna(subset=["usage_ordinal", "dprime"])
        if len(cond_data) < 3:
            spearman[cond] = {"error": "insufficient data", "n": int(len(cond_data))}
            continue
        rho, p_val = stats.spearmanr(cond_data["usage_ordinal"], cond_data["dprime"])
        spearman[cond] = {
            "rho": float(rho),
            "p_value": float(p_val),
            "n": int(len(cond_data)),
        }

    # d' improvement over baseline by usage group
    usage_labels = {1: "less-1h", 2: "1-2h", 3: "2-4h", 4: "more-4h"}
    usage_improvement = {}
    for ordinal, label in usage_labels.items():
        group_data = df[df["usage_ordinal"] == ordinal]["dprime"]
        if len(group_data) > 0:
            improvement = float(group_data.mean() - baseline_dprime)
            usage_improvement[label] = {
                "dprime_improvement": improvement,
                "n": int(len(group_data)),
            }

    # Radar chart data from raw survey responses
    survey_items = ["i1", "i2", "i3", "i4", "i5", "i6", "i7"]
    radar_labels = [
        "Motivated", "Not Frustrated", "Not Demotivated",
        "Attentive", "Would Use", "Easy", "Well-Organised",
    ]
    # i2 and i3 are reverse-scored (higher = better)
    reverse_items = {"i2", "i3"}

    survey_responses = survey_responses.copy()
    survey_responses["session_id"] = survey_responses["session_id"].astype(str)
    survey_responses["value"] = pd.to_numeric(survey_responses["value"], errors="coerce")

    # Map sessions to conditions
    session_conditions = df[["session_id", "condition"]].drop_duplicates()
    survey_with_cond = survey_responses.merge(session_conditions, on="session_id", how="inner")

    radar_data = {}
    for cond in conditions:
        cond_survey = survey_with_cond[survey_with_cond["condition"] == cond]
        cond_radar = {}
        for item, label in zip(survey_items, radar_labels):
            item_vals = cond_survey[cond_survey["question_id"] == item]["value"].dropna()
            if len(item_vals) > 0:
                mean_val = float(item_vals.mean())
                if item in reverse_items:
                    mean_val = 6 - mean_val
                cond_radar[label] = mean_val
            else:
                cond_radar[label] = None
        radar_data[cond] = cond_radar

    return {
        "spearman": spearman,
        "usage_improvement": usage_improvement,
        "baseline_dprime": baseline_dprime,
        "radar_data": radar_data,
        "radar_labels": radar_labels,
    }


def _cohens_d(group1, group2):
    """Compute Cohen's d effect size."""
    n1, n2 = len(group1), len(group2)
    if n1 < 2 or n2 < 2:
        return 0.0
    var1 = np.var(group1, ddof=1)
    var2 = np.var(group2, ddof=1)
    pooled_std = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
    if pooled_std == 0:
        return 0.0
    return (np.mean(group1) - np.mean(group2)) / pooled_std
