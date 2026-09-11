import { ScoreBreakdown } from './ScoreSystem';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  distance: number;
  modaks: number;
  date: string;
}

export class LeaderboardSystem {
  private static readonly LOCAL_STORAGE_KEY = 'mushak_leaderboard_data';
  private static readonly PLAYER_NAME_KEY = 'mushak_player_name';

  public static getSavedPlayerName(): string {
    return localStorage.getItem(this.PLAYER_NAME_KEY) || '';
  }

  public static setSavedPlayerName(name: string): void {
    localStorage.setItem(this.PLAYER_NAME_KEY, name.trim());
  }

  public static async submitScore(name: string, stats: ScoreBreakdown): Promise<{ success: boolean; message: string; rank?: number }> {
    this.setSavedPlayerName(name);

    const payload = {
      name: name.trim() || 'Festive Runner',
      score: stats.score,
      distance: stats.distance,
      regularModaks: stats.regularModaks,
      jumboModaks: stats.jumboModaks,
      durvaCollected: stats.durvaCollected,
      maxCombo: stats.maxCombo,
      duration: stats.playTimeSeconds,
      timestamp: Date.now()
    };

    try {
      const response = await fetch('/api/leaderboard/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, message: data.message, rank: data.rank };
      } else {
        const err = await response.json();
        console.warn('Leaderboard server response:', err);
        return this.saveLocalScore(payload);
      }
    } catch (e) {
      console.warn('Leaderboard server offline, falling back to local leaderboard:', e);
      return this.saveLocalScore(payload);
    }
  }

  public static async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const response = await fetch('/api/leaderboard');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          return data;
        }
      }
    } catch (e) {
      console.warn('Leaderboard fetch failed, using local store:', e);
    }
    return this.getLocalLeaderboard();
  }

  private static saveLocalScore(payload: {
    name: string;
    score: number;
    distance: number;
    regularModaks: number;
    jumboModaks: number;
  }): { success: boolean; message: string; rank: number } {
    const list = this.getLocalLeaderboard();
    const existingIndex = list.findIndex((e) => e.name.toLowerCase() === payload.name.toLowerCase());

    if (existingIndex >= 0) {
      if (payload.score > list[existingIndex].score) {
        list[existingIndex].score = payload.score;
        list[existingIndex].distance = payload.distance;
        list[existingIndex].modaks = payload.regularModaks + payload.jumboModaks;
        list[existingIndex].date = new Date().toLocaleDateString();
      }
    } else {
      list.push({
        rank: 0,
        name: payload.name,
        score: payload.score,
        distance: payload.distance,
        modaks: payload.regularModaks + payload.jumboModaks,
        date: new Date().toLocaleDateString()
      });
    }

    // Sort descending by score
    list.sort((a, b) => b.score - a.score);
    // Assign ranks
    list.forEach((item, idx) => (item.rank = idx + 1));
    const trimmed = list.slice(0, 20);

    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(trimmed));
    const userRank = trimmed.findIndex((e) => e.name.toLowerCase() === payload.name.toLowerCase()) + 1;

    return {
      success: true,
      message: 'Score saved to high scores!',
      rank: userRank > 0 ? userRank : trimmed.length
    };
  }

  private static getLocalLeaderboard(): LeaderboardEntry[] {
    const raw = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }

    // Default curated starter festive scores
    const defaultScores: LeaderboardEntry[] = [
      { rank: 1, name: 'BappaBhakt_99', score: 3840, distance: 1420, modaks: 78, date: '2026-09-10' },
      { rank: 2, name: 'GaneshPrasad', score: 2950, distance: 1100, modaks: 54, date: '2026-09-10' },
      { rank: 3, name: 'ModakMaster', score: 2340, distance: 980, modaks: 42, date: '2026-09-09' },
      { rank: 4, name: 'MushakRacer', score: 1820, distance: 750, modaks: 35, date: '2026-09-09' },
      { rank: 5, name: 'PuneDholStar', score: 1250, distance: 540, modaks: 24, date: '2026-09-08' }
    ];
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(defaultScores));
    return defaultScores;
  }
}
