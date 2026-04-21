
export type GameState = 'START' | 'PLAYING' | 'GAMEOVER';

export interface Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  type: string;
}

export interface Obstacle extends Entity {
  speed: number;
  id: number;
}

export interface Pterodactyl extends Obstacle {
  flightHeight: 'low' | 'mid' | 'high';
  frame: number;
}

export interface PowerUp extends Entity {
  id: number;
  powerType: 'SHIELD' | 'SLOW_MO';
}

export interface Player extends Entity {
  dy: number;
  isJumping: boolean;
  isDucking: boolean;
  isInvincible: boolean;
  invincibilityTime: number;
  slowMoTime: number;
}
