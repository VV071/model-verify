'use client'
import React from 'react'

export default function CameraCanvas({videoRef,canvasRef,caption}){
  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
        <video 
          ref={videoRef} 
          className="w-full h-auto rounded-2xl" 
          style={{transform:'scaleX(-1)'}} 
          autoPlay 
          muted 
          playsInline
        />
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full rounded-2xl pointer-events-none"
        />
      </div>
      {caption && (
        <div className="mt-4 text-center text-base font-medium text-gray-700">{caption}</div>
      )}
    </div>
  )
}
