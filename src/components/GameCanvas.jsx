import React, { useEffect, forwardRef } from 'react'

const GameCanvas = forwardRef(({ bird, pipes, clouds, onClick }, ref) => {
  useEffect(() => {
    if (!ref.current) return

    const canvas = ref.current
    const ctx = canvas.getContext('2d')

    const drawBackground = () => {
      // Sky gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#64b3f4')
      gradient.addColorStop(1, '#c2e59c')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
      clouds.forEach(cloud => {
        ctx.beginPath()
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2)
        ctx.arc(cloud.x + cloud.size * 0.8, cloud.y - cloud.size * 0.2, cloud.size * 0.6, 0, Math.PI * 2)
        ctx.arc(cloud.x + cloud.size * 1.5, cloud.y, cloud.size * 0.7, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    const drawBird = () => {
      ctx.save()
      ctx.translate(bird.x, bird.y)
      ctx.rotate(bird.rotation * Math.PI / 180)

      // Bird body
      ctx.fillStyle = '#FFD700'
      ctx.beginPath()
      ctx.arc(0, 0, 20, 0, Math.PI * 2)
      ctx.fill()

      // Bird eye
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(8, -5, 6, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(10, -5, 3, 0, Math.PI * 2)
      ctx.fill()

      // Bird beak
      ctx.fillStyle = '#FF6600'
      ctx.beginPath()
      ctx.moveTo(15, 0)
      ctx.lineTo(30, -5)
      ctx.lineTo(30, 5)
      ctx.closePath()
      ctx.fill()

      // Bird wing
      ctx.fillStyle = '#FFA500'
      ctx.beginPath()
      ctx.ellipse(-5, 10, 15, 8, Math.PI/4, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    const drawPipes = () => {
      pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#2E8B57'
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight)

        // Pipe cap (top)
        ctx.fillStyle = '#228B22'
        ctx.fillRect(pipe.x - 5, pipe.topHeight - 15, pipe.width + 10, 15)

        // Bottom pipe
        ctx.fillStyle = '#2E8B57'
        ctx.fillRect(pipe.x, pipe.topHeight + 190, pipe.width, canvas.height - pipe.topHeight - 190)

        // Pipe cap (bottom)
        ctx.fillStyle = '#228B22'
        ctx.fillRect(pipe.x - 5, pipe.topHeight + 190, pipe.width + 10, 15)
      })
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      drawBackground()
      drawPipes()
      drawBird()
    }

    render()
  }, [bird, pipes, clouds])

  return (
    <canvas
      ref={ref}
      width={400}
      height={640}
      className="absolute top-0 left-0 w-full h-full cursor-pointer"
      onClick={onClick}
    />
  )
})

GameCanvas.displayName = 'GameCanvas'

export default GameCanvas