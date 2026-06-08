import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { onUnmounted } from 'vue'

export function useScene(containerRef) {
  const scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf1f5f9)

  const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 100)
  camera.position.set(0, 1.1, 3.2)

  const renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0.85, 0)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.update()

  const ambLight = new THREE.HemisphereLight(0xffffff, 0x8899aa, 1.8)
  scene.add(ambLight)

  const keyLight = new THREE.DirectionalLight(0xffffff, 2.5)
  keyLight.position.set(3, 4, 5)
  keyLight.castShadow = true
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0xbbccff, 0.8)
  fillLight.position.set(-2, 1, 3)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0xffffff, 0.6)
  rimLight.position.set(0, 1, -4)
  scene.add(rimLight)

  const grid = new THREE.GridHelper(3, 12, 0x94a3b8, 0xd1d5db)
  scene.add(grid)

  let currentObject = null
  let measurementLines = []

  function resize() {
    const el = containerRef.value
    if (!el) return
    const w = el.clientWidth
    const h = el.clientHeight
    if (w === 0 || h === 0) return
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h)
  }

  function mount() {
    const el = containerRef.value
    if (!el) return
    el.appendChild(renderer.domElement)
    resize()
  }

  function setObject(obj) {
    if (currentObject) scene.remove(currentObject)
    currentObject = obj
    if (obj) scene.add(obj)
    frameObject(obj)
  }

  function getObject() {
    return currentObject
  }

  function frameObject(obj) {
    if (!obj) return
    const box = new THREE.Box3().setFromObject(obj)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxSize = Math.max(size.x, size.y, size.z) || 1
    const distance = maxSize * 1.8

    controls.target.copy(center)
    camera.position.set(center.x, center.y + maxSize * 0.2, center.z + distance)
    camera.near = Math.max(maxSize / 100, 0.001)
    camera.far = Math.max(maxSize * 20, 100)
    camera.updateProjectionMatrix()
    controls.update()
  }

  function setRenderMode(mode) {
    if (!currentObject) return
    currentObject.traverse((child) => {
      if (!child.isMesh) return
      if (mode === 'wireframe') {
        child.material.wireframe = true
        child.material.transparent = false
        child.material.opacity = 1
      } else if (mode === 'xray') {
        child.material.wireframe = false
        child.material.transparent = true
        child.material.opacity = 0.5
      } else {
        child.material.wireframe = false
        child.material.transparent = false
        child.material.opacity = 1
      }
    })
  }

  function setLighting(preset) {
    const intensityMap = {
      studio: { amb: 1.8, key: 2.5, fill: 0.8, rim: 0.6 },
      bright: { amb: 2.5, key: 3.5, fill: 1.5, rim: 1.0 },
      dim: { amb: 0.8, key: 1.2, fill: 0.4, rim: 0.3 },
    }
    const v = intensityMap[preset] || intensityMap.studio
    ambLight.intensity = v.amb
    keyLight.intensity = v.key
    fillLight.intensity = v.fill
    rimLight.intensity = v.rim
  }

  function toggleGrid(show) {
    grid.visible = show
  }

  function clearMeasurements() {
    measurementLines.forEach((l) => scene.remove(l))
    measurementLines = []
  }

  function updateMeasurements(show) {
    clearMeasurements()
    if (!show || !currentObject) return

    const box = new THREE.Box3().setFromObject(currentObject)
    const min = box.min
    const max = box.max

    const height = max.y - min.y
    const shoulderY = min.y + height * 0.82
    const hipY = min.y + height * 0.48
    const shoulderWidth = (max.x - min.x) * 0.55

    const heightColor = 0xef4444
    const heightPoints = [
      new THREE.Vector3(0, min.y, max.z + 0.02),
      new THREE.Vector3(0, max.y, max.z + 0.02),
    ]
    const heightLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(heightPoints),
      new THREE.LineBasicMaterial({ color: heightColor, linewidth: 1, transparent: true, opacity: 0.7 }),
    )
    scene.add(heightLine)
    measurementLines.push(heightLine)

    const heightDash = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(heightPoints),
      new THREE.LineDashedMaterial({ color: heightColor, dashSize: 0.01, gapSize: 0.01, transparent: true, opacity: 0.4 }),
    )
    heightDash.computeLineDistances()
    scene.add(heightDash)
    measurementLines.push(heightDash)

    const shoulderColor = 0xf97316
    const shoulderPoints = [
      new THREE.Vector3(-shoulderWidth / 2, shoulderY, max.z + 0.02),
      new THREE.Vector3(shoulderWidth / 2, shoulderY, max.z + 0.02),
    ]
    const shoulderLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(shoulderPoints),
      new THREE.LineBasicMaterial({ color: shoulderColor, linewidth: 1, transparent: true, opacity: 0.7 }),
    )
    scene.add(shoulderLine)
    measurementLines.push(shoulderLine)
  }

  function tick() {
    controls.update()
    renderer.render(scene, camera)
  }

  function dispose() {
    renderer.dispose()
    scene.traverse((obj) => {
      if (obj.isMesh) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose())
        else obj.material?.dispose()
      }
    })
  }

  onUnmounted(dispose)

  return {
    scene,
    camera,
    renderer,
    controls,
    mount,
    resize,
    setObject,
    getObject,
    frameObject,
    setRenderMode,
    setLighting,
    toggleGrid,
    updateMeasurements,
    tick,
    dispose,
  }
}
