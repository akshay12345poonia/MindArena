import React, { useRef, useEffect, useState, useCallback } from 'react'
import GameCanvas from './GameCanvas'
import ScoreDisplay from './ScoreDisplay'
import WelcomeScreen from './WelcomeScreen'
import GameOverScreen from './GameOverScreen'
import { useGameLogic } from '../hooks/useGameLogic'

const FlappyBird = () => {
  const canvasRef = useRef(null)
  const [gameState, setGameState] = useState('welcome')
  
  const {
    score,
    bird,
    pipes,
    clouds,
    flap,
    resetGame,
    startGame
  } = useGameLogic(canvasRef, gameState, setGameState)

  const handleStartGame = useCallback(() => {
    setGameState('playing')
    startGame()
  }, [startGame])

  const handleRestartGame = useCallback(() => {
    setGameState('playing')
    resetGame()
  }, [resetGame])

  const handleFlap = useCallback(() => {
    if (gameState === 'playing') {
      flap()
    }
  }, [gameState, flap])

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault()
        if (gameState === 'welcome') {
          handleStartGame()
        } else if (gameState === 'playing') {
          flap()
        } else if (gameState === 'gameover') {
          handleRestartGame()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [gameState, flap, handleStartGame, handleRestartGame])

  return (
    <div className="relative w-[400px] h-[640px] bg-sky-gradient rounded-3xl shadow-2xl overflow-hidden">
      <GameCanvas 
        ref={canvasRef}
        bird={bird}
        pipes={pipes}
        clouds={clouds}
        onClick={handleFlap}
      />
      
      <ScoreDisplay score={score} />
      
      {gameState === 'welcome' && (
        <WelcomeScreen onStartGame={handleStartGame} />
      )}
      
      {gameState === 'gameover' && (
        <GameOverScreen 
          score={score}
          onRestartGame={handleRestartGame}
        />
      )}
      
      {/* Ground */}
      <div className="absolute bottom-0 left-0 w-full h-[60px] bg-ground-gradient z-[5] border-t-4 border-amber-900">
        <div className="w-full h-1 bg-amber-900"></div>
        {/* Grass details */}
        <div className="flex">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="w-5 h-1 bg-amber-800 mr-5"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FlappyBird