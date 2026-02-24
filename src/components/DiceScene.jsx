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
    renderer.shadowMap.type = THREE.PCFShadowMap
    
    // 清理旧的 canvas 防止重复添加
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild)
    }
    
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
    // 使用 RoundedBoxGeometry 创建圆角骰子
    // width=2, height=2, depth=2, segments=8, radius=0.25
    const diceGeometry = new RoundedBoxGeometry(2, 2, 2, 8, 0.25)
    // 材质调整：更加光滑，接近图标质感
    const diceMaterial = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0xcccccc,
      shininess: 100
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

    // 初始化目标角度为 0
    targetRotationRef.current = { x: 0, y: 0, z: 0 }

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
    // 渲染器和场景引用
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current

    if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current)

    const animateLoop = () => {
      animationIdRef.current = requestAnimationFrame(animateLoop)
      
      // 每一帧都实时获取 dice，避免闭包引用旧对象（虽然 ref.current 应该是稳定的）
      // 更重要的是，确保我们操作的是最新的 dice 实例
      const dice = diceRef.current

      if (renderer && scene && camera) {
        // 先旋转，再渲染
        if (dice && dice.userData && dice.userData.isRolling) {
          // 如果没有被要求停止，就一直旋转
          if (!dice.userData.shouldStop) {
            // 持续旋转阶段 - 全部为正向旋转
            const speed = 0.15 // 稍微提升基础速度
            dice.rotation.x += speed * 1.5
            // Y 轴主旋转 (水平旋转)
            dice.rotation.y += speed * 2.0
            dice.rotation.z += speed * 1.2
          } else {
            // 停止阶段：平滑过渡到目标面
            const target = targetRotationRef.current
            const pi2 = Math.PI * 2
            
            // 辅助函数：计算两个角度之间的对齐距离（确保只正向旋转 - 从左到右）
            const getForwardAngleDistance = (current, target) => {
              // 当前角度
              let currentMod = current % pi2
              if (currentMod < 0) currentMod += pi2
              
              // 目标角度
              let targetMod = target % pi2
              if (targetMod < 0) targetMod += pi2
              
              let diff = targetMod - currentMod
              
              // 必须是正数（向前），如果目标在后面，加一圈
              if (diff <= 0) {
                diff += pi2
              }
              
              return diff
            }
  
            // 计算每一轴的向前旋转距离
            const diffX = getForwardAngleDistance(dice.rotation.x, target.x)
            const diffY = getForwardAngleDistance(dice.rotation.y, target.y)
            const diffZ = getForwardAngleDistance(dice.rotation.z, target.z)
  
            // 平滑过渡到目标角度 (lerp)，使用非常平缓的系数
            // 使用系数 0.05 会让它最后转几圈才停下，看起来像惯性刹车
            dice.rotation.x += diffX * 0.08
            dice.rotation.y += diffY * 0.08
            dice.rotation.z += diffZ * 0.08
  
            const isClose = (d) => d < 0.05 // 使用单向判断
            
            // 如果非常接近目标
            if (isClose(diffX) && isClose(diffY) && isClose(diffZ)) {
              // 确保完全对齐（向前对齐）
              const alignToGrid = (val, targetVal) => {
                 let currentPoints = Math.floor(val / pi2)
                 // 目标应该是下一圈的对应角度
                 return (currentPoints * pi2) + targetVal + (targetVal < (val % pi2) ? pi2 : 0)
                 // 实际上这步有点复杂，直接设置为目标角度加圈数即可
                 // 简单方法：既然最后 diff 很小，直接加上 diff 就可以
                 return val + getForwardAngleDistance(val, targetVal)
              }
  
              // 最终修正，直接赋以最接近的未来值
              // 由于 diff 是正向距离，直接加上即可
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

  const [buttonState, setButtonState] = React.useState('start'); // 'start' | 'stop'

  const handleRoll = () => {
    if (diceRef.current) {
      // 这里的逻辑：
      // 1. 如果没在转，开始转 => 状态变为 'stop' (等待点击停止)
      if (!diceRef.current.userData.isRolling) {
         if (onRollStart) onRollStart()
         
         diceRef.current.userData.isRolling = true
         diceRef.current.userData.shouldStop = false
         // rollStartTimeRef.current 此时其实不再用于 1s 倒计时，而是用于计算旋转增量（如果需要）
         // 但我们现在的逻辑是无限旋转，所以只需要保证 animation loop 里 speed 增加即可
         
         setButtonState('stop')
      } else {
         // 2. 如果正在转
         // 如果还没进入"停止阶段" (shouldStop=false)，则触发停止
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

  // 监听 roll 结束事件来重置按钮状态（防止意外情况，虽然我们在上面应该已经处理了 setButtonState('start')）
  // 实际上，当 shouldStop=true 后，动画还会持续一小会儿直到完全停稳 (isRolling=false)
  // 我们的按钮状态反映的是"下一个动作是什么"。
  // 点击"开始" -> 变"停止" -> 点击"停止" -> 变"开始"
  // 所以上面的逻辑是正确的。当点击停止时，虽然物理上骰子还在减速，但在用户意图上，下一个动作只能是重新开始。

  return (
    <div className="w-full h-full relative">
      <div 
        ref={containerRef} 
        className="w-full h-full cursor-pointer"
        onClick={() => {
           handleRoll() 
        }} 
      />
      
      <button 
        className="absolute bottom-10 right-10 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded backdrop-blur border border-white/20 pointer-events-auto transition-colors font-mono select-none"
        onClick={(e) => {
          e.stopPropagation()
          handleRoll()
        }}
      >
        {buttonState === 'stop' ? "停止转动 (STOP)" : "开始转动 (START)"}
      </button>
    </div>
  )
}
