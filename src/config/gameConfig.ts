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
  getGroundY: (screenHeight: number) => {
    return screenHeight - 90;
  },

  getLaneXPositions: (screenWidth: number) => {
    const isMobile = screenWidth < 600;
    if (isMobile) {
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
