import React from 'react'

const ScoreDisplay = ({ score }) => {
  return (
    <div className="absolute top-8 left-0 w-full text-center z-20">
      <div className="text-7xl font-bold text-white drop-shadow-lg">
        {score}
      </div>
    </div>
  )
}

export default ScoreDisplay