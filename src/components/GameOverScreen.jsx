import React from 'react'

const GameOverScreen = ({ score, onRestartGame }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opcity-70 z-40 opacity-100 transition-opacity duration-300">
      <div className="text-8xl text-yellow-400 font-bold mb-8 drop-shadow-lg">
        {score}
      </div>
      
      <button
        onClick={onRestartGame}
        className="bg-green-gradient text-white text-2xl font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200"
      >
        PLAY AGAIN
      </button>
    </div>
  )
}

export default GameOverScreen