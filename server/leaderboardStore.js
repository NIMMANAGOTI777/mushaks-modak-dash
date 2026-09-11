/**
 * In-memory / persistent JSON leaderboard store.
 * Retains highest verified score per player.
 */

class LeaderboardStore {
  constructor() {
    this.entries = [
      { rank: 1, name: 'BappaBhakt_99', score: 3840, distance: 1420, modaks: 78, date: '2026-09-10' },
      { rank: 2, name: 'GaneshPrasad', score: 2950, distance: 1100, modaks: 54, date: '2026-09-10' },
      { rank: 3, name: 'ModakMaster', score: 2340, distance: 980, modaks: 42, date: '2026-09-09' },
      { rank: 4, name: 'MushakRacer', score: 1820, distance: 750, modaks: 35, date: '2026-09-09' },
      { rank: 5, name: 'PuneDholStar', score: 1250, distance: 540, modaks: 24, date: '2026-09-08' }
    ];
  }

  getTopScores(limit = 25) {
    return this.entries.slice(0, limit);
  }

  submitScore({ name, score, distance, regularModaks, jumboModaks }) {
    const existingIndex = this.entries.findIndex(
      (e) => e.name.toLowerCase() === name.toLowerCase()
    );

    const totalModaks = regularModaks + jumboModaks;
    const nowStr = new Date().toISOString().split('T')[0];

    if (existingIndex >= 0) {
      if (score > this.entries[existingIndex].score) {
        this.entries[existingIndex].score = score;
        this.entries[existingIndex].distance = distance;
        this.entries[existingIndex].modaks = totalModaks;
        this.entries[existingIndex].date = nowStr;
      }
    } else {
      this.entries.push({
        rank: 0,
        name,
        score,
        distance,
        modaks: totalModaks,
        date: nowStr
      });
    }

    // Sort descending by score
    this.entries.sort((a, b) => b.score - a.score);

    // Reassign ranks
    this.entries.forEach((e, idx) => {
      e.rank = idx + 1;
    });

    // Keep top 100
    this.entries = this.entries.slice(0, 100);

    const rank = this.entries.findIndex((e) => e.name.toLowerCase() === name.toLowerCase()) + 1;
    return { rank };
  }
}

module.exports = new LeaderboardStore();
