import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'

export default function DiceScene({ onRollStart, onRollEnd }) {
  const containerRef = useRef(null)

  // Refs for Three.js objects
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const diceRef = useRef(null)
  const dotGeometryRef = useRef(null)
  const animationIdRef = useRef(null)
  const rollStartTimeRef = useRef(null)
  const rollDurationRef = useRef(1000) // 1秒滚动时间
  const targetRotationRef = useRef({ x: 0, y: 0, z: 0 })
  const finalFaceRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current) return

    try {
      init()
    } catch (err) {
      console.error('Error initializing Three.js scene:', err)
    }

    return () => {
      cleanup()
    }
  }, [])

  const cleanup = () => {
    if (animationIdRef.current) {
      cancelAnimationFrame(animationIdRef.current)
    }
    if (rendererRef.current) {
      rendererRef.current.dispose()
    }
  }

  const init = () => {
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

  const createDot = (dice, dotGeometry, x, y, z, color, face) => {
    const dotMaterial = createDotMaterial(color)
    const dot = new THREE.Mesh(dotGeometry, dotMaterial)

    let surfaceX, surfaceY, surfaceZ
    const offset = 0.001

    switch (face) {
      case 'front': // +Z
        surfaceX = x
        surfaceY = y
        surfaceZ = 1 + offset
        dot.rotation.set(0, 0, 0)
        break
      case 'back': // -Z
        surfaceX = x
        surfaceY = y
        surfaceZ = -1 - offset
        dot.rotation.set(Math.PI, 0, 0)
        break
      case 'right': // +X
        surfaceX = 1 + offset
        surfaceY = y
        surfaceZ = z
        dot.rotation.set(0, Math.PI / 2, Math.PI / 2)
        break
      case 'left': // -X
        surfaceX = -1 - offset
        surfaceY = y
        surfaceZ = z
        dot.rotation.set(0, -Math.PI / 2, -Math.PI / 2)
        break
      case 'top': // +Y
        surfaceX = x
        surfaceY = 1 + offset
        surfaceZ = z
        dot.rotation.set(-Math.PI / 2, 0, 0)
        break
      case 'bottom': // -Y
        surfaceX = x
        surfaceY = -1 - offset
        surfaceZ = z
        dot.rotation.set(Math.PI / 2, 0, 0)
        break
    }

    dot.position.set(surfaceX, surfaceY, surfaceZ)
    dice.add(dot)
  }

  const createDots = (dice, dotGeometry) => {
    const darkColor = 0x1e293b

    // Face 1 - 1 dot (RED) - Front face (+Z)
    createDot(dice, dotGeometry, 0, 0, 0, 0xef4444, 'front')

    // Face 6 - 6 dots - Back face (-Z)
    createDot(dice, dotGeometry, -0.5, 0.5, 0, darkColor, 'back')
    createDot(dice, dotGeometry, 0.5, 0.5, 0, darkColor, 'back')
    createDot(dice, dotGeometry, -0.5, -0.5, 0, darkColor, 'back')
    createDot(dice, dotGeometry, 0.5, -0.5, 0, darkColor, 'back')
    createDot(dice, dotGeometry, -0.5, 0, 0, darkColor, 'back')
    createDot(dice, dotGeometry, 0.5, 0, 0, darkColor, 'back')

    // Face 2 - 2 dots - Left face (-X)
    createDot(dice, dotGeometry, 0, 0.5, -0.5, darkColor, 'left')
    createDot(dice, dotGeometry, 0, -0.5, 0.5, darkColor, 'left')

    // Face 5 - 5 dots - Right face (+X)
    createDot(dice, dotGeometry, 0, 0.5, -0.5, darkColor, 'right')
    createDot(dice, dotGeometry, 0, -0.5, 0.5, darkColor, 'right')
    createDot(dice, dotGeometry, 0, 0, 0, darkColor, 'right')
    createDot(dice, dotGeometry, 0, 0.5, 0.5, darkColor, 'right')
    createDot(dice, dotGeometry, 0, -0.5, -0.5, darkColor, 'right')

    // Face 3 - 3 dots - Top face (+Y)
    createDot(dice, dotGeometry, 0, 0, 0, darkColor, 'top')
    createDot(dice, dotGeometry, -0.5, 0, -0.5, darkColor, 'top')
    createDot(dice, dotGeometry, 0.5, 0, 0.5, darkColor, 'top')

    // Face 4 - 4 dots - Bottom face (-Y)
    createDot(dice, dotGeometry, -0.5, 0, -0.5, darkColor, 'bottom')
    createDot(dice, dotGeometry, 0.5, 0, 0.5, darkColor, 'bottom')
    createDot(dice, dotGeometry, -0.5, 0, 0.5, darkColor, 'bottom')
    createDot(dice, dotGeometry, 0.5, 0, -0.5, darkColor, 'bottom')
  }

  const getRotationForFace = (face) => {
    const faceRotations = {
      1: { x: 0, y: 0, z: 0 },
      6: { x: Math.PI, y: 0, z: 0 },
      2: { x: 0, y: Math.PI / 2, z: 0 },
      5: { x: 0, y: -Math.PI / 2, z: 0 },
      3: { x: Math.PI / 2, y: 0, z: 0 },
      4: { x: -Math.PI / 2, y: 0, z: 0 }
    }
    return faceRotations[face]
  }

  const animate = () => {
    const dice = diceRef.current
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current

    const animateLoop = () => {
      animationIdRef.current = requestAnimationFrame(animateLoop)

      if (dice && dice.userData.isRolling) {
        const currentTime = Date.now()
        const elapsed = currentTime - rollStartTimeRef.current

        if (elapsed < rollDurationRef.current) {
          const speed = 1.5
          dice.rotation.x += speed * 0.5
          dice.rotation.y += speed
          dice.rotation.z += speed * 0.3
        } else {
          const target = targetRotationRef.current
          dice.rotation.x += (target.x - dice.rotation.x) * 0.1
          dice.rotation.y += (target.y - dice.rotation.y) * 0.1
          dice.rotation.z += (target.z - dice.rotation.z) * 0.1

          const diffX = Math.abs(target.x - dice.rotation.x)
          const diffY = Math.abs(target.y - dice.rotation.y)
          const diffZ = Math.abs(target.z - dice.rotation.z)

          if (diffX < 0.01 && diffY < 0.01 && diffZ < 0.01) {
            console.log('Rolling finished, face:', finalFaceRef.current)
            dice.userData.isRolling = false
            if (onRollEnd) {
              onRollEnd(finalFaceRef.current)
            }
          }
        }
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera)
      }
    }

    animateLoop()
  }

  const handleRoll = () => {
    if (diceRef.current && !diceRef.current.userData.isRolling) {
      diceRef.current.userData.isRolling = true
      rollStartTimeRef.current = Date.now()

      const face = Math.floor(Math.random() * 6) + 1
      finalFaceRef.current = face
      const baseRotation = getRotationForFace(face)
      targetRotationRef.current = baseRotation

      if (onRollStart) {
        onRollStart()
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-pointer"
      onClick={handleRoll}
    />
  )
}
