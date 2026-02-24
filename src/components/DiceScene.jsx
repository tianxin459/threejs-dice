import React, { useRef, useEffect } from 'react'
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export default function DiceScene({ onRollStart, onRollEnd }) {
  const containerRef = useRef(null)

  // Refs for Three.js objects
  const sceneRef = useRef(null)
  const cameraRef = useRef(null)
  const rendererRef = useRef(null)
  const diceRef = useRef(null)
  const dotGeometryRef = useRef(null)
  const animationIdRef = useRef(null)
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
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0c)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(-4.5, 5, 5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.6

    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }

    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Ground plane - subtle reflective surface
    const groundGeometry = new THREE.PlaneGeometry(30, 30)
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x0e0e12,
      metalness: 0.3,
      roughness: 0.8,
    })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -1.5
    ground.receiveShadow = true
    scene.add(ground)

    // Lighting - warm premium feel
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    // Key light - warm golden spotlight from above
    const spotLight = new THREE.SpotLight(0xf5e6c8, 2.5)
    spotLight.position.set(2, 12, 4)
    spotLight.angle = Math.PI / 5
    spotLight.penumbra = 0.5
    spotLight.decay = 2
    spotLight.distance = 40
    spotLight.castShadow = true
    spotLight.shadow.mapSize.width = 2048
    spotLight.shadow.mapSize.height = 2048
    spotLight.shadow.camera.near = 0.5
    spotLight.shadow.camera.far = 50
    spotLight.shadow.bias = -0.001
    scene.add(spotLight)

    // Fill light - subtle cool from the side
    const fillLight = new THREE.DirectionalLight(0xc8d8f0, 0.7)
    fillLight.position.set(-5, 3, -3)
    scene.add(fillLight)

    // Rim light - subtle warm edge
    const rimLight = new THREE.PointLight(0xc8a96e, 0.8, 20)
    rimLight.position.set(5, 2, -5)
    scene.add(rimLight)

    // Dice - premium ivory material
    const diceGeometry = new RoundedBoxGeometry(2, 2, 2, 8, 0.25)
    const diceMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xf5f0e8,
      metalness: 0.0,
      roughness: 0.15,
      clearcoat: 0.8,
      clearcoatRoughness: 0.1,
      reflectivity: 0.5,
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

    targetRotationRef.current = { x: 0, y: 0, z: 0 }

    animate()

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
    return new THREE.MeshPhongMaterial({
      color: color,
      side: THREE.DoubleSide,
      shininess: 30,
      specular: 0x111111
    })
  }

  const createDot = (dice, dotGeometry, x, y, z, color, face) => {
    const dotMaterial = createDotMaterial(color)
    const dot = new THREE.Mesh(dotGeometry, dotMaterial)

    let surfaceX, surfaceY, surfaceZ
    const offset = 0.001

    switch (face) {
      case 'front':
        surfaceX = x; surfaceY = y; surfaceZ = 1 + offset
        dot.rotation.set(0, 0, 0)
        break
      case 'back':
        surfaceX = x; surfaceY = y; surfaceZ = -1 - offset
        dot.rotation.set(Math.PI, 0, 0)
        break
      case 'right':
        surfaceX = 1 + offset; surfaceY = y; surfaceZ = z
        dot.rotation.set(0, Math.PI / 2, Math.PI / 2)
        break
      case 'left':
        surfaceX = -1 - offset; surfaceY = y; surfaceZ = z
        dot.rotation.set(0, -Math.PI / 2, -Math.PI / 2)
        break
      case 'top':
        surfaceX = x; surfaceY = 1 + offset; surfaceZ = z
        dot.rotation.set(-Math.PI / 2, 0, 0)
        break
      case 'bottom':
        surfaceX = x; surfaceY = -1 - offset; surfaceZ = z
        dot.rotation.set(Math.PI / 2, 0, 0)
        break
    }

    dot.position.set(surfaceX, surfaceY, surfaceZ)
    dice.add(dot)
  }

  const createDots = (dice, dotGeometry) => {
    const darkColor = 0x1a1a2e

    // Face 1 - 1 dot (accent red) - Front face (+Z)
    createDot(dice, dotGeometry, 0, 0, 0, 0xc84444, 'front')

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
    // Rotations to make the result face point UP (+Y direction)
    // Face layout: 1=front(+Z), 6=back(-Z), 2=left(-X), 5=right(+X), 3=top(+Y), 4=bottom(-Y)
    // In Three.js right-hand coordinate system:
    //   Rotate X by -90: +Z goes to +Y (front face up)
    //   Rotate X by +90: -Z goes to +Y (back face up)
    //   Rotate Z by +90: -X goes to +Y (left face up)
    //   Rotate Z by -90: +X goes to +Y (right face up)
    const faceRotations = {
      1: { x: -Math.PI / 2, y: 0, z: 0 },  // Face 1 on +Z -> rotate X -90 -> +Z face points up
      6: { x: Math.PI / 2, y: 0, z: 0 },   // Face 6 on -Z -> rotate X +90 -> -Z face points up
      2: { x: 0, y: 0, z: Math.PI / 2 },    // Face 2 on -X -> rotate Z +90 -> -X face points up
      5: { x: 0, y: 0, z: -Math.PI / 2 },   // Face 5 on +X -> rotate Z -90 -> +X face points up
      3: { x: 0, y: 0, z: 0 },              // Face 3 on +Y -> already pointing up
      4: { x: Math.PI, y: 0, z: 0 },        // Face 4 on -Y -> rotate X 180 -> -Y face points up
    }
    return faceRotations[face]
  }

  const animate = () => {
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current

    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)

    const animateLoop = () => {
      animationIdRef.current = requestAnimationFrame(animateLoop)

      const dice = diceRef.current

      if (renderer && scene && camera) {
        if (dice && dice.userData && dice.userData.isRolling) {
          if (!dice.userData.shouldStop) {
            const speed = 0.15
            dice.rotation.x += speed * 1.5
            dice.rotation.y += speed * 2.0
            dice.rotation.z += speed * 1.2
          } else {
            const target = targetRotationRef.current
            const pi2 = Math.PI * 2

            const getForwardAngleDistance = (current, target) => {
              let currentMod = current % pi2
              if (currentMod < 0) currentMod += pi2
              let targetMod = target % pi2
              if (targetMod < 0) targetMod += pi2
              let diff = targetMod - currentMod
              if (diff <= 0) diff += pi2
              return diff
            }

            const diffX = getForwardAngleDistance(dice.rotation.x, target.x)
            const diffY = getForwardAngleDistance(dice.rotation.y, target.y)
            const diffZ = getForwardAngleDistance(dice.rotation.z, target.z)

            dice.rotation.x += diffX * 0.08
            dice.rotation.y += diffY * 0.08
            dice.rotation.z += diffZ * 0.08

            const isClose = (d) => d < 0.05

            if (isClose(diffX) && isClose(diffY) && isClose(diffZ)) {
              dice.rotation.x += diffX
              dice.rotation.y += diffY
              dice.rotation.z += diffZ

              dice.userData.isRolling = false
              dice.userData.shouldStop = false

              setButtonState('start')

              if (onRollEnd) {
                onRollEnd(finalFaceRef.current)
              }
            }
          }
        }

        renderer.render(scene, camera)
      }
    }

    animateLoop()
  }

  const [buttonState, setButtonState] = React.useState('start')

  const handleRoll = () => {
    if (diceRef.current) {
      if (!diceRef.current.userData.isRolling) {
        if (onRollStart) onRollStart()

        diceRef.current.userData.isRolling = true
        diceRef.current.userData.shouldStop = false

        setButtonState('stop')
      } else {
        if (!diceRef.current.userData.shouldStop) {
          diceRef.current.userData.shouldStop = true

          const face = Math.floor(Math.random() * 6) + 1
          finalFaceRef.current = face
          targetRotationRef.current = getRotationForFace(face)

          setButtonState('start')
        }
      }
    }
  }

  return (
    <div className="w-full h-full relative">
      <div
        ref={containerRef}
        className="w-full h-full cursor-pointer"
        onClick={() => handleRoll()}
      />

      {/* Roll button - bottom center */}
      <button
        className={`absolute bottom-32 left-1/2 -translate-x-1/2 z-50 pointer-events-auto transition-all duration-300 select-none
          ${buttonState === 'stop'
            ? 'w-20 h-20 rounded-full bg-foreground/10 border-2 border-foreground/20 text-foreground/70 hover:bg-foreground/15 backdrop-blur-md'
            : 'w-20 h-20 rounded-full bg-primary/90 border-2 border-primary text-primary-foreground font-semibold hover:bg-primary animate-pulse-glow backdrop-blur-md shadow-lg shadow-primary/20'
          }`}
        onClick={(e) => {
          e.stopPropagation()
          handleRoll()
        }}
      >
        <span className="text-base tracking-wider uppercase">
          {buttonState === 'stop' ? 'Stop' : 'Roll'}
        </span>
      </button>
    </div>
  )
}
