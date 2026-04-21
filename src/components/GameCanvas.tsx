
import React, { useEffect, useRef, useState } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  GRAVITY, 
  JUMP_FORCE, 
  DUCK_HEIGHT, 
  PLAYER_WIDTH, 
  PLAYER_HEIGHT, 
  PLAYER_X_START, 
  GROUND_Y, 
  INITIAL_GAME_SPEED, 
  SPEED_INCREMENT, 
  MAX_SPEED,
  DAY_NIGHT_THRESHOLD,
  POWER_UP_DURATION
} from '../constants/game';
import { GameState, Player, Obstacle, PowerUp } from '../types/game';
import { sounds } from './SoundEngine';

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
  gameState: GameState;
  onRestart: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ 
  onGameOver, 
  onScoreUpdate, 
  gameState,
  onRestart
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State Refs (to avoid re-renders during loop)
  const scoreRef = useRef(0);
  const highscoreRef = useRef(Number(localStorage.getItem('highscore')) || 0);
  const speedRef = useRef(INITIAL_GAME_SPEED);
  const playerRef = useRef<Player>({
    x: PLAYER_X_START,
    y: GROUND_Y - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dy: 0,
    isJumping: false,
    isDucking: false,
    isInvincible: false,
    invincibilityTime: 0,
    slowMoTime: 0,
    type: 'player'
  });
  
  const obstaclesRef = useRef<Obstacle[]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const cloudsRef = useRef<{x: number, y: number, speed: number}[]>([]);
  const lastObstacleTime = useRef(0);
  const frameCount = useRef(0);

  // Day/Night handling
  const [isNight, setIsNight] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      
      if ((e.code === 'Space' || e.code === 'ArrowUp') && !playerRef.current.isJumping) {
        playerRef.current.dy = JUMP_FORCE;
        playerRef.current.isJumping = true;
        sounds.jump();
      }
      
      if (e.code === 'ArrowDown') {
        playerRef.current.isDucking = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        playerRef.current.isDucking = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  const spawnObstacle = () => {
    const type = Math.random() > 0.3 ? 'cactus' : 'pterodactyl';
    const obstacle: Obstacle = {
      id: Date.now(),
      x: CANVAS_WIDTH,
      y: 0,
      width: 0,
      height: 0,
      speed: speedRef.current,
      type
    };

    if (type === 'cactus') {
      const isLarge = Math.random() > 0.5;
      obstacle.width = isLarge ? 40 : 25;
      obstacle.height = isLarge ? 50 : 35;
      obstacle.y = GROUND_Y - obstacle.height;
    } else {
      obstacle.width = 45;
      obstacle.height = 30;
      const heights = [GROUND_Y - 30, GROUND_Y - 70, GROUND_Y - 110];
      obstacle.y = heights[Math.floor(Math.random() * heights.length)];
    }

    obstaclesRef.current.push(obstacle);
  };

  const spawnPowerUp = () => {
    const type = Math.random() > 0.5 ? 'SHIELD' : 'SLOW_MO';
    powerUpsRef.current.push({
      id: Date.now(),
      x: CANVAS_WIDTH,
      y: GROUND_Y - 100,
      width: 30,
      height: 30,
      powerType: type,
      type: 'powerup'
    });
  };

  const resetGame = () => {
    scoreRef.current = 0;
    speedRef.current = INITIAL_GAME_SPEED;
    playerRef.current = {
      x: PLAYER_X_START,
      y: GROUND_Y - PLAYER_HEIGHT,
      width: PLAYER_WIDTH,
      height: PLAYER_HEIGHT,
      dy: 0,
      isJumping: false,
      isDucking: false,
      isInvincible: false,
      invincibilityTime: 0,
      slowMoTime: 0,
      type: 'player'
    };
    obstaclesRef.current = [];
    powerUpsRef.current = [];
    cloudsRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * CANVAS_WIDTH,
      y: Math.random() * 100,
      speed: 0.5 + Math.random() * 1
    }));
    lastObstacleTime.current = 0;
    frameCount.current = 0;
    setIsNight(false);
  };

  const update = () => {
    if (gameState !== 'PLAYING') return;

    frameCount.current++;
    
    // Slow Mo check
    const currentSpeed = playerRef.current.slowMoTime > 0 ? speedRef.current * 0.5 : speedRef.current;
    
    // Progress difficulty
    speedRef.current = Math.min(speedRef.current + SPEED_INCREMENT, MAX_SPEED);
    
    // Update Score
    scoreRef.current += 0.1;
    onScoreUpdate(Math.floor(scoreRef.current));
    
    // Day Night Transition
    if (Math.floor(scoreRef.current) % DAY_NIGHT_THRESHOLD === 0 && Math.floor(scoreRef.current) !== 0) {
      if (Math.floor(scoreRef.current) % (DAY_NIGHT_THRESHOLD * 2) === 0) {
        setIsNight(false);
      } else {
        setIsNight(true);
      }
    }

    // Player Physics
    playerRef.current.y += playerRef.current.dy;
    playerRef.current.dy += GRAVITY;

    const currentHeight = playerRef.current.isDucking ? DUCK_HEIGHT : PLAYER_HEIGHT;
    const groundLevel = GROUND_Y - currentHeight;

    if (playerRef.current.y > groundLevel) {
      playerRef.current.y = groundLevel;
      playerRef.current.dy = 0;
      playerRef.current.isJumping = false;
    }

    // Update Timers
    if (playerRef.current.invincibilityTime > 0) playerRef.current.invincibilityTime--;
    else playerRef.current.isInvincible = false;
    
    if (playerRef.current.slowMoTime > 0) playerRef.current.slowMoTime--;

    // Spawning
    if (frameCount.current - lastObstacleTime.current > 100 - speedRef.current * 2) {
       if (Math.random() > 0.98) {
         spawnObstacle();
         lastObstacleTime.current = frameCount.current;
       }
    }

    if (Math.random() > 0.998) {
      spawnPowerUp();
    }

    // Move Clouds
    cloudsRef.current.forEach(c => {
      c.x -= c.speed;
      if (c.x < -100) c.x = CANVAS_WIDTH + 100;
    });

    // Move Obstacles
    obstaclesRef.current.forEach((obs, idx) => {
      obs.x -= currentSpeed;
      
      // Collision detection
      const playerBox = {
        x: playerRef.current.x + 5,
        y: playerRef.current.y + 5,
        width: playerRef.current.width - 10,
        height: playerRef.current.isDucking ? DUCK_HEIGHT - 5 : PLAYER_HEIGHT - 10
      };

      if (
        playerBox.x < obs.x + obs.width &&
        playerBox.x + playerBox.width > obs.x &&
        playerBox.y < obs.y + obs.height &&
        playerBox.y + playerBox.height > obs.y
      ) {
        if (!playerRef.current.isInvincible) {
          sounds.hit();
          onGameOver(Math.floor(scoreRef.current));
          if (scoreRef.current > highscoreRef.current) {
            localStorage.setItem('highscore', Math.floor(scoreRef.current).toString());
          }
        }
      }
    });

    // Remove off-screen obstacles
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x > -100);

    // Move Powerups
    powerUpsRef.current.forEach((p, idx) => {
      p.x -= currentSpeed;
      
      // Collision
      if (
        playerRef.current.x < p.x + p.width &&
        playerRef.current.x + playerRef.current.width > p.x &&
        playerRef.current.y < p.y + p.height &&
        playerRef.current.y + playerRef.current.height > p.y
      ) {
        sounds.powerUp();
        if (p.powerType === 'SHIELD') {
          playerRef.current.isInvincible = true;
          playerRef.current.invincibilityTime = POWER_UP_DURATION;
        } else {
          playerRef.current.slowMoTime = POWER_UP_DURATION;
        }
        powerUpsRef.current.splice(idx, 1);
      }
    });
    
    powerUpsRef.current = powerUpsRef.current.filter(p => p.x > -100);
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    // Background color based on day/night
    ctx.fillStyle = isNight ? '#202124' : '#f7f7f7';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    const mainColor = isNight ? '#f7f7f7' : '#535353';

    // Draw Ground
    ctx.strokeStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.stroke();

    // Ground details
    for (let i = 0; i < CANVAS_WIDTH; i += 50) {
      const offset = (frameCount.current * speedRef.current) % 50;
      ctx.beginPath();
      ctx.moveTo(i - offset, GROUND_Y + 5);
      ctx.lineTo(i - offset + 10, GROUND_Y + 5);
      ctx.stroke();
    }

    // Draw Clouds
    cloudsRef.current.forEach(c => {
      ctx.fillStyle = isNight ? '#3c4043' : '#d3d3d3';
      ctx.fillRect(c.x, c.y, 40, 10);
      ctx.fillRect(c.x + 10, c.y - 5, 20, 5);
    });

    // Draw Player
    if (playerRef.current.isInvincible && Math.floor(frameCount.current / 5) % 2 === 0) {
      // Flashing effect for invincibility (skip drawing)
    } else {
      ctx.fillStyle = mainColor;
      const isDucking = playerRef.current.isDucking;
      
      if (isDucking) {
        // Ducking Dino
        // Body
        ctx.fillRect(playerRef.current.x, playerRef.current.y, 50, 25);
        // Head (forward)
        ctx.fillRect(playerRef.current.x + 40, playerRef.current.y + 5, 15, 15);
        // Eye
        ctx.fillStyle = isNight ? '#202124' : '#f7f7f7';
        ctx.fillRect(playerRef.current.x + 50, playerRef.current.y + 8, 3, 3);
      } else {
        // Standing Dino
        // Body
        ctx.fillRect(playerRef.current.x, playerRef.current.y + 15, 30, 25);
        // Neck/Head
        ctx.fillRect(playerRef.current.x + 20, playerRef.current.y, 24, 20);
        // Eye
        ctx.fillStyle = isNight ? '#202124' : '#f7f7f7';
        ctx.fillRect(playerRef.current.x + 35, playerRef.current.y + 5, 4, 4);
      }

      // Dino Legs
      ctx.fillStyle = mainColor;
      const legOffset = Math.floor(frameCount.current / 5) % 2 === 0 ? 0 : 5;
      if (!playerRef.current.isJumping) {
        const legY = playerRef.current.y + (isDucking ? 25 : 35);
        ctx.fillRect(playerRef.current.x + 10, legY + legOffset, 5, 10);
        ctx.fillRect(playerRef.current.x + 20, legY + (5 - legOffset), 5, 10);
      } else {
        const legY = playerRef.current.y + (isDucking ? 25 : 35);
        ctx.fillRect(playerRef.current.x + 10, legY, 5, 10);
        ctx.fillRect(playerRef.current.x + 20, legY, 5, 10);
      }
    }

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
      ctx.fillStyle = mainColor;
      if (obs.type === 'cactus') {
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Cactus arms
        ctx.fillRect(obs.x - 5, obs.y + 10, 5, obs.height - 20);
        ctx.fillRect(obs.x + obs.width, obs.y + 15, 5, obs.height - 25);
      } else {
        // Pterodactyl body
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Animated wings
        const wingPos = Math.floor(frameCount.current / 10) % 2 === 0 ? -10 : 10;
        ctx.fillRect(obs.x + 10, obs.y + wingPos, 20, 10);
      }
    });

    // Draw Power Ups
    powerUpsRef.current.forEach(p => {
      ctx.fillStyle = p.powerType === 'SHIELD' ? '#4285f4' : '#34a853';
      ctx.beginPath();
      ctx.arc(p.x + p.width/2, p.y + p.height/2, 10, 0, Math.PI * 2);
      ctx.fill();
      // Icon
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(p.powerType === 'SHIELD' ? 'S' : 'C', p.x + p.width/2, p.y + p.height/2 + 4);
    });

    // Draw HUD
    ctx.fillStyle = mainColor;
    ctx.font = '20px "Courier New"';
    ctx.textAlign = 'right';
    const currentScore = Math.floor(scoreRef.current).toString().padStart(5, '0');
    const highscore = highscoreRef.current.toString().padStart(5, '0');
    ctx.fillText(`HI ${highscore} ${currentScore}`, CANVAS_WIDTH - 20, 30);
    
    // Status effects
    if (playerRef.current.isInvincible) {
       ctx.fillStyle = '#4285f4';
       ctx.fillRect(20, 20, (playerRef.current.invincibilityTime / POWER_UP_DURATION) * 100, 5);
       ctx.fillText('SHIELD', 120, 30);
    }
    if (playerRef.current.slowMoTime > 0) {
       ctx.fillStyle = '#34a853';
       ctx.fillRect(20, 35, (playerRef.current.slowMoTime / POWER_UP_DURATION) * 100, 5);
       ctx.fillText('SLOW', 120, 45);
    }
  };

  const loop = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      update();
      draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (gameState === 'PLAYING') {
      resetGame();
      requestRef.current = requestAnimationFrame(loop);
    } else {
      cancelAnimationFrame(requestRef.current);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameState]);

  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center">
      <canvas 
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="max-w-full h-auto border-4 border-gray-300 rounded shadow-lg touch-none"
        onClick={() => {
          if (gameState === 'PLAYING' && !playerRef.current.isJumping) {
            playerRef.current.dy = JUMP_FORCE;
            playerRef.current.isJumping = true;
            sounds.jump();
          }
        }}
      />
    </div>
  );
};
