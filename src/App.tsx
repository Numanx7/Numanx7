/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Play, RotateCcw, Shield, Clock, MousePointer2, Smartphone } from 'lucide-react';
import { GameCanvas } from './components/GameCanvas';
import { GameState } from './types/game';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(Number(localStorage.getItem('highscore')) || 0);

  const handleGameOver = useCallback((finalScore: number) => {
    setGameState('GAMEOVER');
    setScore(finalScore);
    const savedHighScore = Number(localStorage.getItem('highscore')) || 0;
    if (finalScore > savedHighScore) {
      setHighScore(finalScore);
    }
  }, []);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(newScore);
  }, []);

  const startGame = () => {
    setGameState('PLAYING');
  };

  const restartGame = () => {
    setGameState('PLAYING');
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] text-[#535353] font-mono flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white p-6 rounded-2xl shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-2">
            DINO <span className="text-blue-500">RUN</span> EVOLVED
          </h1>
          <div className="flex items-center gap-4 text-sm font-bold">
            <div className="flex items-center gap-1">
              <Trophy size={16} className="text-yellow-500" />
              <span>HI {highScore.toString().padStart(5, '0')}</span>
            </div>
            <div className="bg-gray-100 px-3 py-1 rounded-full">
              {score.toString().padStart(5, '0')}
            </div>
          </div>
        </div>

        {/* Game Container */}
        <div className="relative aspect-[4/1] bg-gray-50 rounded-lg overflow-hidden border-2 border-gray-100">
           <GameCanvas 
             gameState={gameState} 
             onGameOver={handleGameOver} 
             onScoreUpdate={handleScoreUpdate}
             onRestart={restartGame}
           />

           {/* Overlays */}
           <AnimatePresence>
             {gameState === 'START' && (
               <motion.div 
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10"
               >
                 <div className="text-center space-y-6">
                   <motion.div
                     animate={{ y: [0, -10, 0] }}
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="text-6xl"
                   >
                     🦖
                   </motion.div>
                   <button 
                     onClick={startGame}
                     className="flex items-center gap-2 bg-[#535353] text-white px-8 py-3 rounded-full hover:bg-black transition-all font-bold text-lg group"
                   >
                     <Play size={20} className="group-hover:translate-x-1 transition-transform" />
                     START MISSION
                   </button>
                   <div className="flex gap-8 justify-center text-xs opacity-60">
                     <div className="flex flex-col items-center gap-1">
                       <div className="p-2 bg-gray-200 rounded-md"><MousePointer2 size={16} /></div>
                       <span>Click to Jump</span>
                     </div>
                     <div className="flex flex-col items-center gap-1">
                       <div className="p-2 bg-gray-200 rounded-md"><Smartphone size={16} /></div>
                       <span>Tap to Play</span>
                     </div>
                   </div>
                 </div>
               </motion.div>
             )}

             {gameState === 'GAMEOVER' && (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 className="absolute inset-0 bg-red-500/90 flex flex-col items-center justify-center z-20 text-white"
               >
                 <h2 className="text-5xl font-black mb-2 italic">G A M E  O V E R</h2>
                 <p className="text-xl mb-8 font-bold">SCORE: {score.toString().padStart(5, '0')}</p>
                 <button 
                   onClick={restartGame}
                   className="flex items-center gap-2 bg-white text-red-500 px-8 py-3 rounded-full hover:bg-gray-100 transition-all font-bold text-lg shadow-xl"
                 >
                   <RotateCcw size={20} />
                   RETRY RUN
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Instructions & Features */}
        <div className="mt-8 grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-3 opacity-50">How to play</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs font-black border border-gray-200">SPACE / ↑</span>
                <span>Jump over obstacles</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="bg-white px-2 py-0.5 rounded shadow-sm text-xs font-black border border-gray-200">↓</span>
                <span>Duck under Pterodactyls</span>
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xs uppercase tracking-widest mb-3 opacity-50">Power-Ups</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2 text-blue-600">
                <Shield size={16} />
                <span><strong className="font-black">Shield:</strong> Invincibility for 5s</span>
              </p>
              <p className="flex items-center gap-2 text-green-600">
                <Clock size={16} />
                <span><strong className="font-black">Chrono:</strong> Slow motion for 5s</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] uppercase tracking-widest opacity-40">
          <span>PIXEL PROTOCOL V1.0</span>
          <span>STABLE SYSTEM READY</span>
        </div>
      </div>
      
      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-50" />
    </div>
  );
}
