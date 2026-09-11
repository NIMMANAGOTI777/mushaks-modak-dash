export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

export const GAME_CONFIG = {
  // Movement & Physics
  GRAVITY: 1400,
  JUMP_FORCE: -620,
  SLIDE_DURATION: 450, // ms matching UI spec (380ms bbox + 70ms ease)
  LANE_X_POSITIONS: [280, 480, 680], // 3 Lanes: Left, Center, Right
  BASE_RUN_SPEED: 380, // pixels per second
  MAX_RUN_SPEED: 720,
  ACCELERATION_RATE: 3.5, // speed increment per second

  // Ground positioning
  GROUND_Y: 450,
  PLAYER_START_X: 180,

  // Collectible Scoring
  MODAK_SCORE: 10,
  JUMBO_MODAK_SCORE: 50,
  DISTANCE_SCORE_RATE: 1,

  // Combos & Power-ups (matching UI Matrix Specs)
  COMBO_WINDOW_MS: 2000,
  COMBO_TIER_1_COUNT: 3, // x2 multiplier
  COMBO_TIER_2_COUNT: 6, // x3 multiplier
  SHIELD_DURATION_MS: 5000, // 5000ms duration with blink

  // Difficulty intervals (in seconds)
  DIFFICULTY_TIERS: {
    EASY_END: 30,
    MEDIUM_END: 60
  },

  // Obstacle Spawning
  OBSTACLE_MIN_GAP: 320,
  OBSTACLE_MAX_GAP: 580,

  // Official Master Theme Colors from UI and UX / DESIGN.md
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
    BTN_BEVEL_SECONDARY: '#5D3A1A',
    BTN_BEVEL_TERTIARY: '#1B4D20'
  }
};

export type GameDifficulty = 'EASY' | 'MEDIUM' | 'HARD';
