/**
 * Anti-Cheat & Score Verification Module
 * Ensures submitted game scores are physically possible within game rules.
 */

const MAX_SPEED_PPS = 750; // pixels per second
const MAX_DISTANCE_PER_SECOND = 120; // in game distance units
const MAX_REGULAR_MODAKS_PER_SEC = 3.5;
const MAX_JUMBO_MODAKS_PER_SEC = 1.0;
const MAX_THEORETICAL_MULTIPLIER = 3;

function validateScoreSubmission(data) {
  const { name, score, distance, regularModaks, jumboModaks, maxCombo, duration } = data;

  // 1. Basic Type and Null Checks
  if (!name || typeof name !== 'string') {
    return { valid: false, reason: 'Invalid player name' };
  }

  const cleanName = name.trim().replace(/<[^>]*>?/gm, ''); // strip html tags
  if (cleanName.length < 2 || cleanName.length > 20) {
    return { valid: false, reason: 'Player name must be between 2 and 20 characters' };
  }

  if (typeof score !== 'number' || score < 0 || !Number.isFinite(score)) {
    return { valid: false, reason: 'Invalid score value' };
  }

  if (typeof distance !== 'number' || distance < 0) {
    return { valid: false, reason: 'Invalid distance value' };
  }

  if (typeof duration !== 'number' || duration <= 0) {
    return { valid: false, reason: 'Invalid duration value' };
  }

  // 2. Physics & Speed Sanity Checks
  const maxPossibleDistance = Math.ceil(duration * MAX_DISTANCE_PER_SECOND) + 50;
  if (distance > maxPossibleDistance) {
    return { valid: false, reason: 'Distance exceeds maximum possible rate' };
  }

  // 3. Collectibles Sanity Checks
  const maxRegularModaks = Math.ceil(duration * MAX_REGULAR_MODAKS_PER_SEC) + 5;
  if (regularModaks > maxRegularModaks) {
    return { valid: false, reason: 'Modak count exceeds maximum spawn frequency' };
  }

  const maxJumboModaks = Math.ceil(duration * MAX_JUMBO_MODAKS_PER_SEC) + 3;
  if (jumboModaks > maxJumboModaks) {
    return { valid: false, reason: 'Jumbo modak count exceeds maximum spawn frequency' };
  }

  if (maxCombo < 1 || maxCombo > MAX_THEORETICAL_MULTIPLIER) {
    return { valid: false, reason: 'Invalid combo multiplier' };
  }

  // 4. Maximum Theoretical Score Check
  // Score formula: Distance * 1 + RegularModaks * 10 * Multiplier + JumboModaks * 50 * Multiplier
  const maxTheoreticalScore =
    distance * 1 +
    regularModaks * 10 * MAX_THEORETICAL_MULTIPLIER +
    jumboModaks * 50 * MAX_THEORETICAL_MULTIPLIER +
    20; // small buffer for rounding

  if (score > maxTheoreticalScore) {
    return { valid: false, reason: 'Score exceeds mathematical maximum for game statistics' };
  }

  return { valid: true, cleanName };
}

module.exports = { validateScoreSubmission };
