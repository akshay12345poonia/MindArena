import React from 'react'

const WelcomeScreen = ({ onStartGame }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-black bg-opacity-60 z-30 transition-opacity duration-300">
      <div className="text-7xl font-bold text-yellow-400 mb-8 tracking-wider drop-shadow-lg">
        FLAPPY BIRD
      </div>
      
      <div className="text-white text-2xl text-center max-w-xs mb-12 drop-shadow-md leading-relaxed">
        Press SPACE or tap to flap your wings and avoid the pipes!
      </div>
      
      <button
        onClick={onStartGame}
        className="bg-orange-gradient text-white text-2xl font-bold py-4 px-10 rounded-full shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200 drop-shadow-md"
      >
        START GAME
      </button>
    </div>
  )
}

export default WelcomeScreen