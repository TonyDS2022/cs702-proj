"""Statistical tests pipeline definition."""

from kedro.pipeline import Pipeline, node, pipeline

from .nodes import (
    rq1_condition_effects,
    rq2_frequency_interaction,
    rq3_pareto_frontier,
    rq4_usage_moderation,
)


def create_pipeline(**kwargs) -> Pipeline:
    return pipeline([
        node(
            rq1_condition_effects,
            inputs={
                "participant_features": "participant_features",
                "paper_dprime_benchmark": "params:paper_dprime_benchmark",
                "paper_pct_frustrated_benchmark": "params:paper_pct_frustrated_benchmark",
            },
            outputs="rq1_results",
            name="rq1_condition_effects",
        ),
        node(rq2_frequency_interaction, inputs="participant_features", outputs="rq2_results", name="rq2_frequency_interaction"),
        node(
            rq3_pareto_frontier,
            inputs={
                "participant_features": "participant_features",
                "baseline_dprime": "params:baseline_dprime",
                "baseline_satisfaction": "params:baseline_satisfaction",
                "paper_dprime_benchmark": "params:paper_dprime_benchmark",
                "paper_pct_frustrated_benchmark": "params:paper_pct_frustrated_benchmark",
            },
            outputs="rq3_results",
            name="rq3_pareto_frontier",
        ),
        node(
            rq4_usage_moderation,
            inputs={
                "participant_features": "participant_features",
                "survey_responses": "raw_survey_responses",
                "baseline_dprime": "params:baseline_dprime",
            },
            outputs="rq4_results",
            name="rq4_usage_moderation",
        ),
    ])
