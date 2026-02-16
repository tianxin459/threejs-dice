import React, { useRef, useEffect, useState } from 'react'
import * as THREE from 'three'

function App() {
  const containerRef = useRef(null)
  const [error, setError] = useState(null)
  const [showError, setShowError] = useState(false)
  const [version, setVersion] = useState(null)

  // Refs for Three.js objects
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const diceRef = useRef(null)
  const dotGeometryRef = useRef(null)

  // Rolling state
  const [isRolling, setIsRolling] = useState(false)
  const targetRotationRef = useRef({ x: 0, y: 0, z: 0 })
  const animationIdRef = useRef(null)

  useEffect(() => {
    // Load version
    fetch('/version.json')
      .then(res => res.json())
      .then(data => {
        setVersion(`${data.version} (${data.buildDate})`)
      })
      .catch(err => {
        console.error('Failed to load version:', err)
        setVersion('1.0.0 (unknown)')
      })

    if (!containerRef.current) return

    try {
      init()
    } catch (err) {
      handleError(err)
    }

    return () => {
      cleanup()
    }
  }, [])

  const handleError = (err) => {
    console.error('Error:', err)
    setError(err.message || 'Unknown error occurred')
    setShowError(true)
  }

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }
    if (rendererRef.current) {
      rendererRef.current.dispose()
    }
  }

  const init = () => {
    console.log('Initializing Three.js scene...')

    // Scene
    const scene = new THREE.Scene()
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(-5, 5, 5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.add(ambientLight)

    const spotLight = new THREE.SpotLight(0xffffff, 1)
    spotLight.position.set(0, 15, 0)
    spotLight.angle = Math.PI / 6
    spotLight.penumbra = 0.3
    spotLight.decay = 2
    spotLight.distance = 50
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 2048
    spotLight.shadow.mapSize.height = 2048
    spotLight.shadow.camera.near = 0.5
    spotLight.shadow.camera.far = 50
    scene.add(spotLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
    directionalLight.position.set(5, 5, 5)
    scene.add(directionalLight)

    // Dice
    const diceGeometry = new THREE.BoxGeometry(2, 2, 2)
    const diceMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x444444,
      shininess: 50
    })
    const dice = new THREE.Mesh(diceGeometry, diceMaterial)
    dice.castShadow = true
    dice.receiveShadow = true
    scene.add(dice)
    diceRef.current = dice

    spotLight.target = dice

    // Dot geometry
    const dotGeometry = new THREE.CircleGeometry(0.225, 32)
    dotGeometryRef.current = dotGeometry

    // Add dots
    createDots(dice, dotGeometry)

    // Start animation
    animate()

    // Window resize handler
    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      }
    }
    window.addEventListener('resize', handleResize)
  }

  const createDotMaterial = (color) => {
    return new THREE.MeshBasicMaterial({
      color: color,
      side: THREE.DoubleSide
    })
  }

  const createDot = (dice, dotGeometry, x, y, z, color) => {
    const dotMaterial = createDotMaterial(color)
    const dot = new THREE.Mesh(dotGeometry, dotMaterial)

    // Position dot on the dice surface
    let surfaceX, surfaceY, surfaceZ
    const offset = 0.001

    if (z > 0) {
      // Front face (+Z)
      surfaceX = x
      surfaceY = y
      surfaceZ = 1 + offset
      dot.rotation.set(0, 0, 0)
    } else if (z < 0) {
      // Back face (-Z)
      surfaceX = x
      surfaceY = y
      surfaceZ = -1 - offset
      dot.rotation.set(Math.PI, 0, 0)
    } else if (x > 0) {
      // Right face (+X)
      surfaceX = 1 + offset
      surfaceY = y
      surfaceZ = z
      dot.rotation.set(0, Math.PI / 2, Math.PI / 2)
    } else if (x < 0) {
      // Left face (-X)
      surfaceX = -1 - offset
      surfaceY = y
      surfaceZ = z
      dot.rotation.set(0, -Math.PI / 2, -Math.PI / 2)
    } else if (y > 0) {
      // Top face (+Y)
      surfaceX = x
      surfaceY = 1 + offset
      surfaceZ = z
      dot.rotation.set(-Math.PI / 2, 0, 0)
    } else if (y < 0) {
      // Bottom face (-Y)
      surfaceX = x
      surfaceY = -1 - offset
      surfaceZ = z
      dot.rotation.set(Math.PI / 2, 0, 0)
    }

    dot.position.set(surfaceX, surfaceY, surfaceZ)
    dice.add(dot)
  }

  const createDots = (dice, dotGeometry) => {
    const darkColor = 0x1e293b

    // Face 1 - 1 dot (RED) - Front face (+Z)
    createDot(dice, dotGeometry, 0, 0, 1, 0xef4444)

    // Face 6 - 6 dots - Back face (-Z)
    createDot(dice, dotGeometry, -0.5, 0.5, -1, darkColor)
    createDot(dice, dotGeometry, 0.5, 0.5, -1, darkColor)
    createDot(dice, dotGeometry, -0.5, -0.5, -1, darkColor)
    createDot(dice, dotGeometry, 0.5, -0.5, -1, darkColor)
    createDot(dice, dotGeometry, -0.5, 0, -1, darkColor)
    createDot(dice, dotGeometry, 0.5, 0, -1, darkColor)

    // Face 2 - 2 dots - Left face (-X)
    createDot(dice, dotGeometry, -1, 0.5, -0.5, darkColor)
    createDot(dice, dotGeometry, -1, -0.5, 0.5, darkColor)

    // Face 5 - 5 dots - Right face (+X)
    createDot(dice, dotGeometry, 1, 0.5, -0.5, darkColor)
    createDot(dice, dotGeometry, 1, -0.5, 0.5, darkColor)
    createDot(dice, dotGeometry, 1, 0, 0, darkColor)
    createDot(dice, dotGeometry, 1, 0.5, 0.5, darkColor)
    createDot(dice, dotGeometry, 1, -0.5, -0.5, darkColor)

    // Face 3 - 3 dots - Top face (+Y)
    createDot(dice, dotGeometry, 0, 1, 0, darkColor)
    createDot(dice, dotGeometry, -0.5, 1, -0.5, darkColor)
    createDot(dice, dotGeometry, 0.5, 1, 0.5, darkColor)

    // Face 4 - 4 dots - Bottom face (-Y)
    createDot(dice, dotGeometry, -0.5, -1, -0.5, darkColor)
    createDot(dice, dotGeometry, 0.5, -1, 0.5, darkColor)
    createDot(dice, dotGeometry, -0.5, -1, 0.5, darkColor)
    createDot(dice, dotGeometry, 0.5, -1, -0.5, darkColor)
  }

  const animate = () => {
    const dice = diceRef.current
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current

    const animateLoop = () => {
      animationIdRef.current = requestAnimationFrame(animateLoop)

      if (dice && isRolling) {
        const target = targetRotationRef.current
        dice.rotation.x += (target.x - dice.rotation.x) * 0.08
        dice.rotation.y += (target.y - dice.rotation.y) * 0.08
        dice.rotation.z += (target.z - dice.rotation.z) * 0.08

        const diffX = Math.abs(target.x - dice.rotation.x)
        const diffY = Math.abs(target.y - dice.rotation.y)
        const diffZ = Math.abs(target.z - dice.rotation.z)

        console.log('Rotation diff:', { x: diffX, y: diffY, z: diffZ })

        if (diffX < 0.01 && diffY < 0.01 && diffZ < 0.01) {
          console.log('Rolling finished')
          setIsRolling(false)
        }
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }

    animateLoop()
  }

  const handleRollDice = () => {
    console.log('Roll clicked, isRolling:', isRolling)
    if (isRolling) {
      console.log('Already rolling, ignoring click')
      return
    }

    console.log('Starting roll...')
    setIsRolling(true)

    const rotations = Math.floor(Math.random() * 3) + 2
    const targetRotation = {
      x: Math.PI * 2 * rotations + Math.floor(Math.random() * 6) * Math.PI / 2,
      y: Math.PI * 2 * rotations + Math.floor(Math.random() * 6) * Math.PI / 2,
      z: Math.PI * 2 * rotations + Math.floor(Math.random() * 6) * Math.PI / 2
    }
    console.log('Target rotation:', targetRotation)
    targetRotationRef.current = targetRotation
  }

  const handleCopyError = () => {
    if (error) {
      navigator.clipboard.writeText(error)
        .then(() => {
          const btn = document.getElementById('copy-btn')
          if (btn) {
            btn.textContent = '已复制！'
            setTimeout(() => {
              btn.textContent = '复制错误信息'
            }, 2000)
          }
        })
        .catch(() => {
          const btn = document.getElementById('copy-btn')
          if (btn) {
            btn.textContent = '复制失败'
          }
        })
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen flex items-center justify-center relative bg-slate-900 cursor-pointer"
      onClick={handleRollDice}
    >
      {/* Version display in top-left corner */}
      {version && (
        <div className="absolute top-4 left-4 text-white/60 text-sm font-mono pointer-events-none z-10">
          v{version}
        </div>
      )}

      {/* Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-white text-2xl font-light tracking-wider pointer-events-none z-10">
        骰子-点击投掷
      </div>

      {/* Error display */}
      {showError && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-20 text-sm">
          <div className="mb-2">
            <strong>错误:</strong> {error}
          </div>
          <button
            id="copy-btn"
            onClick={(e) => {
              e.stopPropagation()
              handleCopyError()
            }}
            className="bg-white text-red-600 px-3 py-1 rounded text-xs font-bold hover:bg-gray-100 transition"
          >
            复制错误信息
          </button>
        </div>
      )}
    </div>
  )
}

export default App
