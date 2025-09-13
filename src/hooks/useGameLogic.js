import { useState, useEffect, useCallback, useRef } from 'react'

export const useGameLogic = (canvasRef, gameState, setGameState) => {
  const [score, setScore] = useState(0)
  const [bird, setBird] = useState({
    x: 80,
    y: 320,
    velocity: 0,
    rotation: 0
  })
  const [pipes, setPipes] = useState([])
  const [clouds, setClouds] = useState([])
  
  const animationId = useRef()
  const lastPipeTime = useRef(0)
  const gameSpeed = useRef(1)

  // Game constants
  const GRAVITY = 0.5
  const FLAP_FORCE = -10
  const PIPE_SPEED = 4
  const PIPE_GAP = 192
  const PIPE_FREQUENCY = 1500
  const GROUND_HEIGHT = 60
  const BIRD_RADIUS = 20

  // Initialize clouds
  const createClouds = useCallback(() => {
    const newClouds = []
    for (let i = 0; i < 5; i++) {
      newClouds.push({
        x: Math.random() * 400,
        y: Math.random() * 320,
        size: 30 + Math.random() * 40,
        speed: 0.2 + Math.random() * 0.5
      })
    }
    setClouds(newClouds)
  }, [])

  // Create new pipe
  const createPipe = useCallback(() => {
    const topHeight = 50 + Math.random() * (640 - PIPE_GAP - GROUND_HEIGHT - 100)
    setPipes(prev => [...prev, {
      x: 400,
      width: 70,
      topHeight,
      counted: false
    }])
  }, [])

  // Check collisions
  const checkCollisions = useCallback((currentBird, currentPipes) => {
    // Ground collision
    if (currentBird.y + BIRD_RADIUS > 640 - GROUND_HEIGHT) {
      return true
    }

    // Pipe collisions
    for (const pipe of currentPipes) {
      if (currentBird.x + BIRD_RADIUS > pipe.x && currentBird.x - BIRD_RADIUS < pipe.x + pipe.width) {
        if (currentBird.y - BIRD_RADIUS < pipe.topHeight || 
            currentBird.y + BIRD_RADIUS > pipe.topHeight + PIPE_GAP) {
          return true
        }
      }
    }
    return false
  }, [])

  // Main game loop
  const gameLoop = useCallback(() => {
    setBird(prevBird => {
      const newVelocity = prevBird.velocity + GRAVITY * gameSpeed.current
      const newY = Math.max(BIRD_RADIUS, prevBird.y + newVelocity * gameSpeed.current)
      const newRotation = Math.min(90, Math.max(-30, newVelocity * 3))

      const newBird = {
        ...prevBird,
        y: newY,
        velocity: newVelocity,
        rotation: newRotation
      }

      // Check collisions
      setPipes(currentPipes => {
        if (checkCollisions(newBird, currentPipes)) {
          setGameState('gameover')
          return currentPipes
        }
        return currentPipes
      })

      return newBird
    })

    // Update pipes
    setPipes(prevPipes => {
      const updatedPipes = prevPipes.map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED * gameSpeed.current }))
      
      // Count score and remove off-screen pipes
      let newScore = score
      const filteredPipes = updatedPipes.filter(pipe => {
        if (!pipe.counted && pipe.x + pipe.width < bird.x) {
          pipe.counted = true
          newScore++
        }
        return pipe.x + pipe.width > 0
      })

      if (newScore !== score) {
        setScore(newScore)
      }

      return filteredPipes
    })

    // Update clouds
    setClouds(prevClouds => 
      prevClouds.map(cloud => ({
        ...cloud,
        x: cloud.x - cloud.speed * gameSpeed.current < -cloud.size * 2 
          ? 400 + cloud.size 
          : cloud.x - cloud.speed * gameSpeed.current,
        y: cloud.x - cloud.speed * gameSpeed.current < -cloud.size * 2 
          ? Math.random() * 320 
          : cloud.y
      }))
    )

    // Create new pipes
    const currentTime = Date.now()
    if (currentTime - lastPipeTime.current > PIPE_FREQUENCY / gameSpeed.current) {
      createPipe()
      lastPipeTime.current = currentTime
    }

    // Adjust game speed based on score
    if (score > 5) gameSpeed.current = 1.2
    if (score > 10) gameSpeed.current = 1.4
    if (score > 20) gameSpeed.current = 1.7

    // Continue game loop
    if (gameState === 'playing') {
      animationId.current = requestAnimationFrame(gameLoop)
    }
  }, [bird.x, score, gameState, createPipe, checkCollisions, setGameState])

  // Flap function
  const flap = useCallback(() => {
    setBird(prev => ({ ...prev, velocity: FLAP_FORCE }))
  }, [])

  // Start game
  const startGame = useCallback(() => {
    createClouds()
    lastPipeTime.current = Date.now()
    animationId.current = requestAnimationFrame(gameLoop)
  }, [createClouds, gameLoop])

  // Reset game
  const resetGame = useCallback(() => {
    setScore(0)
    setBird({ x: 80, y: 320, velocity: 0, rotation: 0 })
    setPipes([])
    createClouds()
    gameSpeed.current = 1
    lastPipeTime.current = Date.now()
    
    if (animationId.current) {
      cancelAnimationFrame(animationId.current)
    }
    animationId.current = requestAnimationFrame(gameLoop)
  }, [createClouds, gameLoop])

  // Start game loop when playing
  useEffect(() => {
    if (gameState === 'playing') {
      animationId.current = requestAnimationFrame(gameLoop)
    } else {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
      }
    }

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current)
      }
    }
  }, [gameState, gameLoop])

  // Initialize clouds on mount
  useEffect(() => {
    createClouds()
  }, [createClouds])

  return {
    score,
    bird,
    pipes,
    clouds,
    flap,
    resetGame,
    startGame
  }
}