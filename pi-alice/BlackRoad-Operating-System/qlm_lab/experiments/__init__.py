"""
QLM Experiments - Validate QLM's value through experiments

Each experiment tests a specific hypothesis about QLM.
"""

from qlm_lab.experiments.alignment_detection import AlignmentDetectionExperiment
from qlm_lab.experiments.emergence_detection import EmergenceDetectionExperiment

__all__ = ["AlignmentDetectionExperiment", "EmergenceDetectionExperiment"]
