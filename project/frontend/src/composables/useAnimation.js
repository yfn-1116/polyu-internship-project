import { store } from '../stores/viewerStore.js'

// Singleton animation player — shared between ViewerPanel (creates/updates)
// and PlaybackControls (play/pause/seek/speed).

let player = null

export function useAnimation() {
  function createPlayer(mesh, verticesData, nVertices, nFrames, fps) {
    stop()
    player = {
      mesh,
      verticesData,
      nVertices,
      nFrames,
      fps,
      currentFrame: 0,
      playing: false,
    }
  }

  function tick(dt) {
    if (!player || !player.playing) return
    const framesToAdvance = dt * player.fps * store.animSpeed
    player.currentFrame += framesToAdvance
    if (player.currentFrame >= player.nFrames) {
      player.currentFrame = 0
    }
    updateGeometry()
  }

  function updateGeometry() {
    const frameIdx = Math.floor(player.currentFrame)
    const offset = frameIdx * player.nVertices * 3
    const posAttr = player.mesh.geometry.attributes.position
    const src = player.verticesData.subarray(offset, offset + player.nVertices * 3)
    posAttr.array.set(src)
    posAttr.needsUpdate = true
    player.mesh.geometry.computeVertexNormals()

    store.animFrame = frameIdx
  }

  function play() {
    if (!player) return
    player.playing = true
    store.isAnimating = true
  }

  function pause() {
    if (!player) return
    player.playing = false
    store.isAnimating = false
  }

  function toggle() {
    if (!player) return
    if (player.playing) pause()
    else play()
  }

  function stop() {
    if (player) {
      player.playing = false
      player = null
    }
    store.isAnimating = false
    store.animFrame = 0
    store.animTotalFrames = 0
  }

  function seek(frame) {
    if (!player) return
    player.currentFrame = Math.max(0, Math.min(Number(frame), player.nFrames - 1))
    updateGeometry()
  }

  function setSpeed(speed) {
    store.animSpeed = Number(speed)
  }

  function getPlayer() {
    return player
  }

  return {
    createPlayer,
    tick,
    play,
    pause,
    toggle,
    stop,
    seek,
    setSpeed,
    getPlayer,
  }
}
