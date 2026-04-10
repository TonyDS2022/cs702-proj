"""
Reporting nodes: generate plots and summary statistics.
"""

import json
import os

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import seaborn as sns

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "output")

# Presentation color palette — includes all possible conditions
COLORS = {
    "control": "#9CA3AF",
    "control_baseline": "#9CA3AF",
    "reaction": "#115E59",
    "button": "#059669",
    "feedback": "#7C3AED",
    "slowdown": "#06B6D4",
    "minigame": "#EAB308",
    "pause": "#DC2626",
}

CONDITION_LABELS = {
    "control": "Control",
    "control_baseline": "Control\n(estimated)",
    "reaction": "Reaction",
    "button": "Button\nToggle",
    "feedback": "Content\nFeedback",
    "slowdown": "Adaptive\nSlowdown",
    "minigame": "Mini-Game",
    "pause": "Pause\nScreen",
}


def _ensure_output_dir():
    os.makedirs(OUTPUT_DIR, exist_ok=True)


def _get_label(cond):
    return CONDITION_LABELS.get(cond, cond.title())


def _get_color(cond):
    return COLORS.get(cond, "#6B7280")


def plot_rq1(rq1_results: dict) -> None:
    """RQ1: Three-panel bar chart — d', % frustrated, scroll bandwidth."""
    _ensure_output_dir()
    cstats = rq1_results.get("condition_stats", {})
    if not cstats:
        return

    paper_dp = rq1_results.get("paper_dprime_benchmark", 2.89)
    paper_pf = rq1_results.get("paper_pct_frustrated_benchmark", 0.53)

    conditions = sorted(cstats.keys())
    x = np.arange(len(conditions))
    colors = [_get_color(c) for c in conditions]
    labels = [_get_label(c) for c in conditions]

    fig, (ax1, ax2, ax3) = plt.subplots(1, 3, figsize=(16, 5))

    # --- Panel 1: d' ---
    dprime_means = [cstats[c].get("dprime_mean") or 0 for c in conditions]
    dprime_ses = [cstats[c].get("dprime_se") or 0 for c in conditions]

    ax1.bar(x, dprime_means, yerr=dprime_ses, capsize=4,
            color=colors, edgecolor="white", linewidth=0.5)
    ax1.axhline(y=paper_dp, color="red", linestyle="--", linewidth=1, alpha=0.8)
    ax1.text(len(conditions) - 0.5, paper_dp + 0.05, f"Paper max d\u2032={paper_dp}",
             fontsize=8, color="red", ha="right")
    ax1.set_xticks(x)
    ax1.set_xticklabels(labels, fontsize=9)
    ax1.set_ylabel("d\u2032", fontsize=12)
    ax1.set_title("d\u2032 by Condition", fontsize=14, fontweight="bold")
    ax1.set_ylim(0, max(max(dprime_means) * 1.3, paper_dp * 1.15) if dprime_means else 3.5)

    for i, cond in enumerate(conditions):
        n = cstats[cond].get("n", 0)
        pairwise = rq1_results.get("pairwise", {})
        sig = any(cond in key and pw.get("significant", False)
                  for key, pw in pairwise.items())
        label = f"*\nn={n}" if sig else f"n={n}"
        ax1.text(i, dprime_means[i] + dprime_ses[i] + 0.05,
                 label, ha="center", va="bottom", fontsize=8)

    # --- Panel 2: % Frustrated (i2 >= 4) ---
    pct_frust = [(cstats[c].get("pct_frustrated") or 0) * 100 for c in conditions]

    ax2.bar(x, pct_frust, color=colors, edgecolor="white", linewidth=0.5)
    ax2.axhline(y=paper_pf * 100, color="red", linestyle="--", linewidth=1, alpha=0.8)
    ax2.text(len(conditions) - 0.5, paper_pf * 100 + 1.5,
             f"Paper reaction: {paper_pf:.0%}",
             fontsize=8, color="red", ha="right")
    ax2.set_xticks(x)
    ax2.set_xticklabels(labels, fontsize=9)
    ax2.set_ylabel("% Frustrated (i2 \u2265 4)", fontsize=10)
    ax2.set_title("% Frustrated by Condition", fontsize=14, fontweight="bold")
    ax2.set_ylim(0, 110)

    for i, cond in enumerate(conditions):
        n = cstats[cond].get("n", 0)
        ax2.text(i, pct_frust[i] + 2, f"n={n}",
                 ha="center", va="bottom", fontsize=8)

    # --- Panel 3: Scroll Bandwidth (mean scroll depth) ---
    sb_means = [cstats[c].get("scroll_bandwidth_mean") or 0 for c in conditions]
    sb_ses = [cstats[c].get("scroll_bandwidth_se") or 0 for c in conditions]

    ax3.bar(x, sb_means, yerr=sb_ses, capsize=4,
            color=colors, edgecolor="white", linewidth=0.5)
    ax3.set_xticks(x)
    ax3.set_xticklabels(labels, fontsize=9)
    ax3.set_ylabel("Mean Scroll Depth", fontsize=10)
    ax3.set_title("Scroll Bandwidth", fontsize=14, fontweight="bold")
    ax3.set_ylim(0, max(sb_means) * 1.3 if any(sb_means) else 1.0)

    for i, cond in enumerate(conditions):
        n = cstats[cond].get("n", 0)
        ax3.text(i, sb_means[i] + sb_ses[i] + 0.01, f"n={n}",
                 ha="center", va="bottom", fontsize=8)

    fig.suptitle("RQ1: Memory Recall (d\u2032) and Frustration by Condition",
                 fontsize=10, color="gray", y=0.02)
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "rq1_dprime_frustration.png")
    fig.savefig(path, dpi=300, bbox_inches="tight")
    fig.savefig(path.replace(".png", ".svg"), bbox_inches="tight")
    plt.close(fig)


def plot_rq2(rq2_results: dict) -> None:
    """RQ2: Line chart of d' and frustration vs frequency. Skips if no data."""
    _ensure_output_dir()
    fstats = rq2_results.get("freq_stats", {})

    if not fstats:
        # Nothing to plot — single frequency level or no data
        return

    fig, ax = plt.subplots(figsize=(10, 6))

    # Discover frequencies from data
    all_freqs = set()
    for cond_data in fstats.values():
        all_freqs.update(int(f) for f in cond_data.keys())
    freqs = sorted(all_freqs)
    freq_labels = [f"freq = {f}\n(every {f} posts)" for f in freqs]

    for cond in sorted(fstats.keys()):
        color = _get_color(cond)
        label_name = _get_label(cond).replace("\n", " ")
        dprime_vals = [fstats[cond].get(str(f), {}).get("dprime_mean") for f in freqs]
        frust_vals = [fstats[cond].get(str(f), {}).get("frustration_mean") for f in freqs]

        ax.plot(range(len(freqs)), dprime_vals, "-o", color=color,
                label=f"{label_name} \u2014 d'", linewidth=2, markersize=6)
        ax.plot(range(len(freqs)), frust_vals, "--s", color=color,
                label=f"{label_name} \u2014 Frustration", linewidth=2, markersize=6, alpha=0.7)

    ax.set_xticks(range(len(freqs)))
    ax.set_xticklabels(freq_labels, fontsize=10)
    ax.set_ylabel("Score", fontsize=12)
    ax.set_title("d' (solid) and Frustration (dashed) by Friction\nFrequency",
                 fontsize=14, fontweight="bold")
    ax.legend(loc="upper right", fontsize=9)
    ax.set_ylim(0, 5)
    ax.grid(axis="y", alpha=0.3)

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "rq2_frequency_tradeoff.png")
    fig.savefig(path, dpi=300, bbox_inches="tight")
    fig.savefig(path.replace(".png", ".svg"), bbox_inches="tight")
    plt.close(fig)


def plot_rq3(rq3_results: dict) -> None:
    """RQ3: Pareto scatter — d' vs % frustrated. Lower % frustrated is better."""
    _ensure_output_dir()
    points = rq3_results.get("points", {})
    pareto = rq3_results.get("pareto_optimal", [])

    if not points:
        return

    paper_dp = rq3_results.get("paper_dprime_benchmark", 2.89)
    paper_pf = rq3_results.get("paper_pct_frustrated_benchmark", 0.53)

    fig, ax = plt.subplots(figsize=(8, 6))

    # Benchmark crosshairs
    ax.axvline(x=paper_dp, color="red", linestyle="--", linewidth=1, alpha=0.6, zorder=1)
    ax.axhline(y=paper_pf * 100, color="red", linestyle="--", linewidth=1, alpha=0.6, zorder=1)
    ax.text(paper_dp + 0.03, 2, f"Paper d\u2032={paper_dp}",
            fontsize=8, color="red", rotation=90, va="bottom")
    ax.text(0.3, paper_pf * 100 + 1.5, f"Paper reaction: {paper_pf:.0%}",
            fontsize=8, color="red")

    for cond, p in sorted(points.items()):
        if p.get("dprime_mean") is None:
            continue

        pct_frust_pct = (p.get("pct_frustrated") or 0) * 100
        is_baseline = p.get("is_baseline", False)

        if is_baseline:
            ax.scatter(p["dprime_mean"], pct_frust_pct,
                       c="#9CA3AF", s=150, marker="D",
                       label="Control (estimated)",
                       edgecolors="white", linewidth=1.5, zorder=4, alpha=0.7)
            ax.annotate("Control (estimated)",
                        (p["dprime_mean"], pct_frust_pct),
                        textcoords="offset points", xytext=(10, -10),
                        fontsize=8, color="gray", fontstyle="italic")
        else:
            is_pareto = cond in pareto
            marker = "*" if is_pareto else "o"
            size = 200 if is_pareto else 100
            ax.scatter(p["dprime_mean"], pct_frust_pct,
                       c=_get_color(cond), s=size, marker=marker,
                       label=_get_label(cond).replace("\n", " "),
                       edgecolors="white", linewidth=1.5, zorder=5)
            n = p.get("n", 0)
            ax.annotate(f"{_get_label(cond).replace(chr(10), ' ')} (n={n})",
                        (p["dprime_mean"], pct_frust_pct),
                        textcoords="offset points", xytext=(10, 5), fontsize=9)

    n_real = sum(1 for p in points.values() if not p.get("is_baseline", False))
    ax.set_xlabel("d\u2032 (Memory Recall)", fontsize=12)
    ax.set_ylabel("% Frustrated", fontsize=12)
    ax.set_title(f"d\u2032 vs. % Frustrated \u2014 {n_real} conditions",
                 fontsize=14, fontweight="bold")
    ax.grid(alpha=0.3)
    ax.legend(fontsize=9)

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "rq3_pareto_scatter.png")
    fig.savefig(path, dpi=300, bbox_inches="tight")
    fig.savefig(path.replace(".png", ".svg"), bbox_inches="tight")
    plt.close(fig)


def plot_rq4_radar(rq4_results: dict) -> None:
    """RQ4: Radar chart of 7-item interface survey."""
    _ensure_output_dir()
    radar_data = rq4_results.get("radar_data", {})
    labels = rq4_results.get("radar_labels", [])

    if not labels or not radar_data:
        return

    # Filter to conditions that have at least some data
    valid_conds = [c for c in sorted(radar_data.keys())
                   if any(v is not None for v in radar_data[c].values())]
    if not valid_conds:
        return

    n_vars = len(labels)
    angles = np.linspace(0, 2 * np.pi, n_vars, endpoint=False).tolist()
    angles += angles[:1]

    fig, ax = plt.subplots(figsize=(7, 7), subplot_kw=dict(polar=True))

    for cond in valid_conds:
        values = [radar_data[cond].get(l, 0) or 0 for l in labels]
        values += values[:1]
        ax.plot(angles, values, "o-", color=_get_color(cond), linewidth=2,
                label=_get_label(cond).replace("\n", " "), markersize=5)
        ax.fill(angles, values, color=_get_color(cond), alpha=0.1)

    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(labels, fontsize=9)
    ax.set_ylim(0, 5)
    ax.set_title(f"7-item Interface Survey \u2014 {len(valid_conds)} Conditions",
                 fontsize=14, fontweight="bold", pad=20)
    ax.legend(loc="lower right", bbox_to_anchor=(1.2, 0), fontsize=9)

    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "rq4_radar_survey.png")
    fig.savefig(path, dpi=300, bbox_inches="tight")
    fig.savefig(path.replace(".png", ".svg"), bbox_inches="tight")
    plt.close(fig)


def plot_rq4_usage(rq4_results: dict) -> None:
    """RQ4: Horizontal bar chart of d' improvement by usage group."""
    _ensure_output_dir()
    usage = rq4_results.get("usage_improvement", {})
    baseline = rq4_results.get("baseline_dprime", 0.80)

    if not usage:
        return

    fig, ax = plt.subplots(figsize=(8, 4))

    usage_order = ["less-1h", "1-2h", "2-4h", "more-4h"]
    usage_labels = ["< 1 h / day", "1\u20132 h / day", "2\u20134 h / day", "> 4 h / day"]
    bar_colors = ["#059669", "#059669", "#EAB308", "#DC2626"]

    y_pos = range(len(usage_order))
    improvements = []
    ns = []
    for u in usage_order:
        entry = usage.get(u, {})
        improvements.append(entry.get("dprime_improvement", 0))
        ns.append(entry.get("n", 0))

    ax.barh(y_pos, improvements, color=bar_colors, height=0.6, edgecolor="white")
    ax.set_yticks(y_pos)
    ax.set_yticklabels(usage_labels, fontsize=10)
    ax.set_xlabel(f"d' Improvement over Baseline ({baseline:.2f})", fontsize=11)
    ax.set_title("d' Improvement vs. Daily Usage", fontsize=14, fontweight="bold",
                 color="#059669")
    ax.invert_yaxis()

    for i, (val, n) in enumerate(zip(improvements, ns)):
        sign = "+" if val >= 0 else ""
        ax.text(val + 0.02, i, f"{sign}{val:.2f} (n={n})", va="center", fontsize=10,
                fontweight="bold", color="#059669")

    ax.grid(axis="x", alpha=0.3)
    plt.tight_layout()
    path = os.path.join(OUTPUT_DIR, "rq4_usage_dprime.png")
    fig.savefig(path, dpi=300, bbox_inches="tight")
    fig.savefig(path.replace(".png", ".svg"), bbox_inches="tight")
    plt.close(fig)


def generate_summary_stats(
    rq1_results: dict, rq2_results: dict, rq3_results: dict, rq4_results: dict
) -> dict:
    """Combine all results into a single summary JSON with sample size warnings."""
    warnings = []

    # Check sample sizes
    cstats = rq1_results.get("condition_stats", {})
    for cond, s in cstats.items():
        n = s.get("n", 0)
        if 0 < n < 15:
            warnings.append(f"{cond} condition has n={n}; results are exploratory")

    # Check RQ2 skip
    if rq2_results.get("warning"):
        warnings.append(f"RQ2 skipped: {rq2_results['warning']}")

    return {
        "rq1": rq1_results,
        "rq2": rq2_results,
        "rq3": rq3_results,
        "rq4": rq4_results,
        "warnings": warnings,
    }
