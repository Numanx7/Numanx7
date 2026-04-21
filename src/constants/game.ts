
export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 200;

export const GRAVITY = 0.6;
export const JUMP_FORCE = -12;
export const DUCK_HEIGHT = 30;
export const PLAYER_WIDTH = 44;
export const PLAYER_HEIGHT = 47;
export const PLAYER_X_START = 50;
export const GROUND_Y = CANVAS_HEIGHT - 30;

export const INITIAL_GAME_SPEED = 5;
export const SPEED_INCREMENT = 0.001;
export const MAX_SPEED = 15;

export const DAY_NIGHT_THRESHOLD = 500; // Switch every 500 points

export const OBSTACLE_TYPES = {
  CACTUS_SMALL: { width: 20, height: 40 },
  CACTUS_LARGE: { width: 40, height: 60 },
  PTERODACTYL: { width: 42, height: 36 },
};

export const POWER_UP_DURATION = 300; // ~5 seconds at 60fps
