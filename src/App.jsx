import React from 'react'
import { Analytics } from '@vercel/analytics/react'

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            SupplyLens
          </h1>
          <p className="text-gray-400 text-lg">
            is in progress
          </p>
        </div>
      </div>
      <Analytics />
    </>
  )
}

export default App
