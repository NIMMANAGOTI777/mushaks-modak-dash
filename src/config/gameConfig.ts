export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const GAME_CONFIG = {
  // Movement & Physics
  GRAVITY: 1400,
  JUMP_FORCE: -640,
  SLIDE_DURATION: 450, // ms
  BASE_RUN_SPEED: 400, // pixels per second
  MAX_RUN_SPEED: 750,
  ACCELERATION_RATE: 3.5,

  // Collectible Scoring
  MODAK_SCORE: 10,
  JUMBO_MODAK_SCORE: 50,
  DISTANCE_SCORE_RATE: 1,

  // Combos & Power-ups
  COMBO_WINDOW_MS: 2000,
  COMBO_TIER_1_COUNT: 3, // x2
  COMBO_TIER_2_COUNT: 6, // x3
  SHIELD_DURATION_MS: 5000,

  // Difficulty intervals
  DIFFICULTY_TIERS: {
    EASY_END: 30,
    MEDIUM_END: 60
  },

  // Dynamic Responsive Helpers
  isMobilePortrait: (width: number, height: number) => {
    return width < 768 || height > width;
  },

  getGroundY: (screenHeight: number, screenWidth?: number) => {
    const isMobile = (screenWidth && screenWidth < 768) || window.innerWidth < 768 || screenHeight > (screenWidth || window.innerWidth);
    return isMobile ? screenHeight - 128 : screenHeight - 90;
  },

  getLaneXPositions: (screenWidth: number, screenHeight?: number) => {
    const isMobile = screenWidth < 768 || (screenHeight !== undefined && screenHeight > screenWidth);
    if (isMobile) {
      // Well-spaced 3 lanes for mobile portrait
      return [screenWidth * 0.22, screenWidth * 0.50, screenWidth * 0.78];
    }
    // Desktop / widescreen
    const center = screenWidth / 2;
    const laneOffset = Math.min(220, screenWidth * 0.18);
    return [center - laneOffset, center, center + laneOffset];
  },

  // Official Master Theme Colors from UI and UX DESIGN.md
  COLORS: {
    SURFACE: '#200F08',
    SURFACE_CONTAINER_LOWEST: '#1A0A05',
    SURFACE_CONTAINER_LOW: '#291710',
    SURFACE_CONTAINER: '#2E1B14',
    SURFACE_CONTAINER_HIGH: '#39251D',
    SURFACE_CONTAINER_HIGHEST: '#453028',
    ON_SURFACE: '#FEDBCF',
    ON_SURFACE_VARIANT: '#E0C0AF',
    PRIMARY: '#FFB68B',
    PRIMARY_CONTAINER: '#FF7A00',
    ON_PRIMARY: '#522300',
    ON_PRIMARY_CONTAINER: '#5C2800',
    SECONDARY: '#FFC72C',
    SECONDARY_CONTAINER: '#E0AC00',
    TERTIARY: '#88D982',
    TERTIARY_CONTAINER: '#62B260',
    TEXT_IVORY: '#FFF8E7',
    GOLD_GLOW: '#FFE082',
    BTN_BEVEL_PRIMARY: '#8B2500',
    BTN_BEVEL_SECONDARY: '#120907',
    BTN_BEVEL_TERTIARY: '#1B4D20'
  }
};

export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface PerformanceGrade {
  rank: 'S' | 'A' | 'B' | 'C' | 'D';
  title: string;
  minScore: number;
  message: string;
  badgeBgColor: number;
  badgeBorderColor: number;
  textColor: string;
  badgeStroke: number;
}

export const PERFORMANCE_GRADES: PerformanceGrade[] = [
  {
    rank: 'S',
    title: 'Festival Legend',
    minScore: 5000,
    message: 'An incredible festival run!',
    badgeBgColor: 0x39251d,
    badgeBorderColor: 0xffc72c,
    textColor: '#FFC72C',
    badgeStroke: 0xffe082
  },
  {
    rank: 'A',
    title: 'Modak Master',
    minScore: 3000,
    message: 'Brilliant modak collecting!',
    badgeBgColor: 0x39251d,
    badgeBorderColor: 0xf97316,
    textColor: '#F97316',
    badgeStroke: 0xffb68b
  },
  {
    rank: 'B',
    title: 'Pandal Runner',
    minScore: 1500,
    message: 'Great run! Keep dashing!',
    badgeBgColor: 0x223620,
    badgeBorderColor: 0x22c55e,
    textColor: '#88D982',
    badgeStroke: 0xa3f69c
  },
  {
    rank: 'C',
    title: 'Modak Collector',
    minScore: 500,
    message: 'Nice start. Keep practicing!',
    badgeBgColor: 0x2e1b14,
    badgeBorderColor: 0xe0c0af,
    textColor: '#FFF8E7',
    badgeStroke: 0xfedbcf
  },
  {
    rank: 'D',
    title: 'First Dash',
    minScore: 0,
    message: 'Every great run starts here!',
    badgeBgColor: 0x1f140f,
    badgeBorderColor: 0x8b5e3c,
    textColor: '#A78B7C',
    badgeStroke: 0x584235
  }
];

export function getPerformanceGrade(score: number): PerformanceGrade {
  for (const grade of PERFORMANCE_GRADES) {
    if (score >= grade.minScore) {
      return grade;
    }
  }
  return PERFORMANCE_GRADES[PERFORMANCE_GRADES.length - 1];
}
