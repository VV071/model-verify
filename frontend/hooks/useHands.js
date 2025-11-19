'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

/**
 * useHands hook
 * returns:
 *  - videoRef, canvasRef
 *  - latestLandmarks,embedding
 *  - isInsideBox(bool)
 *  - captureEmbedding(): returns current embedding (array) or null
 *  - storage helpers
 */

export default function useHands({onResults} = {}){
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const handsRef = useRef(null)
  const cameraRef = useRef(null)
  const [landmarks,setLandmarks] = useState(null)
  const [embedding,setEmbedding] = useState(null)
  const [isInside,setIsInside] = useState(false)

  // helper to compute embedding (flatten 21 landmarks x,y,z)
  const computeEmbedding = (lm) => {
    if(!lm || !Array.isArray(lm)) return null
    return lm.flatMap(p => [p.x,p.y,p.z])
  }

  // check if all landmarks within box (box uses center normalized coordinates)
  const checkInsideBox = (lm,videoWidth,videoHeight) => {
    if(!lm) return false
    // dotted box as center rectangle: width 0.48, height 0.6 of video
    const boxW = 0.48*videoWidth
    const boxH = 0.6*videoHeight
    const boxX = (videoWidth - boxW)/2
    const boxY = (videoHeight - boxH)/2
    for(const p of lm){
      const px = p.x * videoWidth
      const py = p.y * videoHeight
      if(px < boxX || px > boxX+boxW || py < boxY || py > boxY+boxH) return false
    }
    return true
  }

  useEffect(()=>{
    if(typeof window === 'undefined') return
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if(!video || !canvas || !ctx) return

    let Hands, Camera
    let isMounted = true

    // Dynamically import MediaPipe modules
    const loadMediaPipe = async () => {
      try {
        // Import as namespace to handle all export types
        const handsModule = await import('@mediapipe/hands')
        const cameraModule = await import('@mediapipe/camera_utils')
        
        // MediaPipe Hands - try all possible ways to get the constructor
        // The error suggests default exists but isn't a constructor, so check for nested properties
        if (typeof handsModule === 'function') {
          Hands = handsModule
        } else if (handsModule.Hands && typeof handsModule.Hands === 'function') {
          Hands = handsModule.Hands
        } else if (handsModule.default) {
          if (typeof handsModule.default === 'function') {
            Hands = handsModule.default
          } else if (handsModule.default.Hands && typeof handsModule.default.Hands === 'function') {
            Hands = handsModule.default.Hands
          } else if (typeof handsModule.default === 'object') {
            // Try to find Hands in the object
            const keys = Object.keys(handsModule.default)
            for (const key of keys) {
              if (key.includes('Hands') && typeof handsModule.default[key] === 'function') {
                Hands = handsModule.default[key]
                break
              }
            }
            // If still not found, try default.default
            if (typeof Hands !== 'function' && handsModule.default.default) {
              Hands = handsModule.default.default
            }
          }
        }
        
        // Last resort: check if it's exported as a named export we haven't tried
        if (typeof Hands !== 'function') {
          const allKeys = Object.keys(handsModule)
          for (const key of allKeys) {
            if (typeof handsModule[key] === 'function' && key.toLowerCase().includes('hand')) {
              Hands = handsModule[key]
              break
            }
          }
        }
        
        // MediaPipe Camera - same approach
        if (typeof cameraModule === 'function') {
          Camera = cameraModule
        } else if (cameraModule.default) {
          if (typeof cameraModule.default === 'function') {
            Camera = cameraModule.default
          } else if (cameraModule.default.Camera) {
            Camera = cameraModule.default.Camera
          } else if (typeof cameraModule.default === 'object' && cameraModule.default.default) {
            Camera = cameraModule.default.default
          }
        } else if (cameraModule.Camera) {
          Camera = cameraModule.Camera
        }
        
        // Final check
        if (typeof Hands !== 'function') {
          console.error('Hands is not a constructor. Module structure:', handsModule)
          return false
        }
        if (typeof Camera !== 'function') {
          console.error('Camera is not a constructor. Module structure:', cameraModule)
          return false
        }
        
        return true
      } catch (error) {
        console.error('Error loading MediaPipe:', error)
        return false
      }
    }
    
    loadMediaPipe().then((loaded) => {
      if(!isMounted || !loaded) return

      const hands = new Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        }
      })
      
      hands.setOptions({
        maxNumHands:1,
        modelComplexity:1,
        minDetectionConfidence:0.6,
        minTrackingConfidence:0.6
      })
      
      hands.onResults((results) => {
        if(!isMounted) return
        
        // results.multiHandLandmarks may be undefined
        const lm = results.multiHandLandmarks && results.multiHandLandmarks[0] ? results.multiHandLandmarks[0] : null
        setLandmarks(lm)

        // compute inside box (use video width/height)
        const vw = video.videoWidth || video.clientWidth || 640
        const vh = video.videoHeight || video.clientHeight || 480
        const inside = checkInsideBox(lm, vw, vh)
        setIsInside(inside)

        let emb = null
        if(inside){
          emb = computeEmbedding(lm)
          setEmbedding(emb)
        }else{
          setEmbedding(null)
        }

        // draw on canvas
        ctx.clearRect(0,0,canvas.width,canvas.height)
        // draw mirrored video onto canvas for nicer overlay
        ctx.save()
        ctx.translate(canvas.width,0)
        ctx.scale(-1,1)
        ctx.drawImage(video,0,0,canvas.width,canvas.height)
        ctx.restore()

        // draw dotted capture box
        const boxW = canvas.width * 0.48
        const boxH = canvas.height * 0.6
        const boxX = (canvas.width - boxW)/2
        const boxY = (canvas.height - boxH)/2
        ctx.setLineDash([6,8])
        ctx.lineWidth = 3
        ctx.strokeStyle = inside ? 'rgba(34,197,94,0.9)' : 'rgba(107,114,128,0.9)'
        ctx.strokeRect(boxX, boxY, boxW, boxH)
        ctx.setLineDash([])

        // draw landmarks if present
        if(lm){
          // landmarks are normalized; also we mirrored video so reflect x
          for(let i=0;i<lm.length;i++){
            const p = lm[i]
            const x = canvas.width - p.x*canvas.width // mirror x
            const y = p.y*canvas.height
            // draw circle
            ctx.beginPath()
            ctx.fillStyle = 'rgba(255,165,0,0.95)'
            ctx.arc(x,y,6,0,Math.PI*2)
            ctx.fill()
            // small label
            ctx.fillStyle = 'white'
            ctx.font = '10px sans-serif'
            ctx.fillText(i,x+6,y+4)
          }
          // draw simple skeleton lines (hand connections)
          const connections = [
            [0,1],[1,2],[2,3],[3,4],      // thumb
            [0,5],[5,6],[6,7],[7,8],      // index
            [0,9],[9,10],[10,11],[11,12], // middle
            [0,13],[13,14],[14,15],[15,16],// ring
            [0,17],[17,18],[18,19],[19,20] // pinky
          ]
          ctx.strokeStyle = 'rgba(0,0,0,0.4)'
          ctx.lineWidth = 2
          for(const [a,b] of connections){
            const pa = lm[a], pb = lm[b]
            const ax = canvas.width - pa.x*canvas.width, ay = pa.y*canvas.height
            const bx = canvas.width - pb.x*canvas.width, by = pb.y*canvas.height
            ctx.beginPath()
            ctx.moveTo(ax,ay)
            ctx.lineTo(bx,by)
            ctx.stroke()
          }
        }

        if(onResults) onResults({landmarks:lm,embedding:emb,inside})
      })

      handsRef.current = hands

      try{
        const camera = new Camera(video, {
          onFrame: async () => {
            if(handsRef.current) {
              await handsRef.current.send({image: video})
            }
          },
          width: 640,
          height: 480
        })
        camera.start()
        cameraRef.current = camera
      }catch(e){
        console.error('Camera start failed',e)
      }

      // set canvas size when video metadata is ready
      const handleResize = () => {
        if(canvas && video) {
          canvas.width = video.clientWidth || 640
          canvas.height = video.clientHeight || 480
        }
      }
      video.addEventListener('loadedmetadata', handleResize)
      window.addEventListener('resize', handleResize)
      handleResize()
    }).catch((error) => {
      console.error('Failed to load MediaPipe modules:', error)
    })

    return () => {
      isMounted = false
      window.removeEventListener('resize', () => {})
      try{ 
        if(cameraRef.current) {
          cameraRef.current.stop()
        }
      }catch(e){}
      if(handsRef.current) {
        handsRef.current.onResults(()=>{})
      }
    }
  },[onResults])

  // capture function returns current embedding if inside and stable (caller decides)
  const captureEmbedding = useCallback(()=>{
    return isInside ? embedding : null
  },[embedding, isInside])

  // storage helpers
  const saveToLocal = useCallback((dataObj)=>{
    if (typeof window !== 'undefined') {
      localStorage.setItem('palmData', JSON.stringify(dataObj))
    }
  },[])

  const loadFromLocal = useCallback(()=>{
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem('palmData')
    if(!raw) return null
    try{ return JSON.parse(raw) }catch(e){return null}
  },[])

  const deleteLocal = useCallback(()=>{
    if (typeof window !== 'undefined') {
      localStorage.removeItem('palmData')
    }
  },[])

  return {
    videoRef,
    canvasRef,
    landmarks,
    embedding,
    isInside,
    captureEmbedding,
    saveToLocal,
    loadFromLocal,
    deleteLocal
  }
}
