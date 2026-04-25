// BlackRoad OS — Launch Score
// Calculate overall launch readiness from check results

export const SCORE_CATEGORIES = {
  100: 'launch ready',
  85: 'ship with warnings',
  70: 'internal beta only',
  50: 'demo only',
  0: 'blocked'
};

export function getCategory(score) {
  if (score >= 100) return 'launch ready';
  if (score >= 85) return 'ship with warnings';
  if (score >= 70) return 'internal beta only';
  if (score >= 50) return 'demo only';
  return 'blocked';
}

// Weight by priority
const WEIGHTS = { p0: 15, high: 8, medium: 4, low: 2 };

export function calculateScore(checkResults, blockers = []) {
  // P0 blockers cap score at 49
  if (blockers.length > 0) {
    const baseScore = calculateRawScore(checkResults);
    return Math.min(baseScore, 49);
  }
  return calculateRawScore(checkResults);
}

function calculateRawScore(checkResults) {
  if (!checkResults.length) return 0;

  let totalWeight = 0;
  let earnedWeight = 0;

  for (const r of checkResults) {
    const w = WEIGHTS[r.priority] || WEIGHTS.medium;
    totalWeight += w;

    switch (r.status) {
      case 'pass': earnedWeight += w; break;
      case 'warning': earnedWeight += w * 0.7; break;
      case 'missing': earnedWeight += w * 0.3; break;
      case 'skipped': earnedWeight += w * 0.5; break;
      case 'fail': break;
      case 'blocked': break;
      case 'needs-approval': earnedWeight += w * 0.5; break;
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((earnedWeight / totalWeight) * 100);
}

export function scoreSummary(score) {
  return `${score} / 100 — ${getCategory(score)}`;
}
