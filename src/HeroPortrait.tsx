import { useEffect, useRef } from 'react'

const PORTRAIT_URL = '/assets/mridul-srivastava.png'
const COLUMNS = 18
const ROWS = 24
const PIECE_COUNT = COLUMNS * ROWS

function deterministicNoise(value: number) {
  const result = Math.sin(value * 12.9898 + 78.233) * 43758.5453
  return result - Math.floor(result)
}

export default function HeroPortrait() {
  const anchorRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const edgeRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const anchor = anchorRef.current
    const sourceImage = imageRef.current
    const edge = edgeRef.current
    const hero = document.querySelector<HTMLElement>('.hero')
    if (!anchor || !sourceImage || !edge || !hero) return

    if (window.matchMedia('(prefers-reduced-motion: reduce), (max-width: 760px)').matches) return

    let disposed = false
    let cleanup = () => {}

    Promise.all([import('three'), import('gsap'), import('gsap/ScrollTrigger')]).then(([THREE, gsapModule, triggerModule]) => {
      if (disposed) return

      const gsap = gsapModule.gsap
      const ScrollTrigger = triggerModule.ScrollTrigger
      gsap.registerPlugin(ScrollTrigger)

      const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      })
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65))
      renderer.outputColorSpace = THREE.SRGBColorSpace
      renderer.domElement.className = 'hero-fragment-canvas'
      renderer.domElement.setAttribute('aria-hidden', 'true')
      renderer.domElement.style.opacity = '0'
      document.body.appendChild(renderer.domElement)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(45, 1, 1, 4000)
      camera.position.z = 1000

      const basePlane = new THREE.PlaneGeometry(1, 1)
      const geometry = new THREE.InstancedBufferGeometry()
      geometry.index = basePlane.index
      geometry.setAttribute('position', basePlane.attributes.position)
      geometry.setAttribute('uv', basePlane.attributes.uv)
      geometry.instanceCount = PIECE_COUNT

      const origins = new Float32Array(PIECE_COUNT * 3)
      const destinations = new Float32Array(PIECE_COUNT * 3)
      const rotations = new Float32Array(PIECE_COUNT * 3)
      const uvCenters = new Float32Array(PIECE_COUNT * 2)
      const scales = new Float32Array(PIECE_COUNT)
      const delays = new Float32Array(PIECE_COUNT)

      for (let row = 0; row < ROWS; row++) {
        for (let column = 0; column < COLUMNS; column++) {
          const index = row * COLUMNS + column
          const normalizedX = column / (COLUMNS - 1) - 0.5
          const normalizedY = row / (ROWS - 1) - 0.5
          const centerDistance = Math.hypot(normalizedX * 2, normalizedY * 2)

          uvCenters[index * 2] = (column + 0.5) / COLUMNS
          uvCenters[index * 2 + 1] = 1 - (row + 0.5) / ROWS
          rotations[index * 3] = (deterministicNoise(index + 17) - 0.5) * 1.05
          rotations[index * 3 + 1] = (deterministicNoise(index + 37) - 0.5) * 1.7
          rotations[index * 3 + 2] = (deterministicNoise(index + 59) - 0.5) * 2.6
          scales[index] = 0.55 + deterministicNoise(index + 79) * 0.9
          delays[index] = 0.025 + deterministicNoise(index + 97) * 0.19 + Math.max(0, 0.12 - centerDistance * 0.08)
        }
      }

      const originAttribute = new THREE.InstancedBufferAttribute(origins, 3)
      const destinationAttribute = new THREE.InstancedBufferAttribute(destinations, 3)
      geometry.setAttribute('aOrigin', originAttribute)
      geometry.setAttribute('aDestination', destinationAttribute)
      geometry.setAttribute('aRotation', new THREE.InstancedBufferAttribute(rotations, 3))
      geometry.setAttribute('aUvCenter', new THREE.InstancedBufferAttribute(uvCenters, 2))
      geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1))
      geometry.setAttribute('aDelay', new THREE.InstancedBufferAttribute(delays, 1))

      const uniforms = {
        uTexture: { value: null as THREE.Texture | null },
        uProgress: { value: 0 },
        uPieceSize: { value: new THREE.Vector2(10, 10) },
        uGrid: { value: new THREE.Vector2(COLUMNS, ROWS) },
      }

      const material = new THREE.ShaderMaterial({
        uniforms,
        transparent: true,
        depthTest: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        vertexShader: `
          attribute vec3 aOrigin;
          attribute vec3 aDestination;
          attribute vec3 aRotation;
          attribute vec2 aUvCenter;
          attribute float aScale;
          attribute float aDelay;
          uniform float uProgress;
          uniform vec2 uPieceSize;
          uniform vec2 uGrid;
          varying vec2 vImageUv;

          float cinematicEase(float value) {
            return value < 0.5
              ? 2.0 * value * value
              : 1.0 - pow(-2.0 * value + 2.0, 2.0) / 2.0;
          }

          mat3 rotationMatrix(vec3 angles) {
            vec3 c = cos(angles);
            vec3 s = sin(angles);
            return mat3(
              c.y * c.z, c.z * s.x * s.y - c.x * s.z, c.x * c.z * s.y + s.x * s.z,
              c.y * s.z, c.x * c.z + s.x * s.y * s.z, -c.z * s.x + c.x * s.y * s.z,
              -s.y, c.y * s.x, c.x * c.y
            );
          }

          void main() {
            float localProgress = clamp((uProgress - aDelay) / (1.0 - aDelay), 0.0, 1.0);
            float separation = cinematicEase(localProgress);
            float pieceScale = mix(1.015, aScale, separation);
            vec3 local = vec3(position.xy * uPieceSize * pieceScale, 0.0);
            local = rotationMatrix(aRotation * separation) * local;
            vec3 center = mix(aOrigin, aDestination, separation);

            gl_Position = projectionMatrix * modelViewMatrix * vec4(center + local, 1.0);
            vImageUv = aUvCenter + vec2(position.x / uGrid.x, position.y / uGrid.y);
          }
        `,
        fragmentShader: `
          uniform sampler2D uTexture;
          varying vec2 vImageUv;

          void main() {
            vec4 portrait = texture2D(uTexture, vImageUv);
            gl_FragColor = portrait;
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      })

      const pieces = new THREE.Mesh(geometry, material)
      pieces.frustumCulled = false
      scene.add(pieces)

      const textureLoader = new THREE.TextureLoader()
      textureLoader.load(PORTRAIT_URL, texture => {
        if (disposed) {
          texture.dispose()
          return
        }

        texture.colorSpace = THREE.SRGBColorSpace
        texture.minFilter = THREE.LinearFilter
        texture.magFilter = THREE.LinearFilter
        uniforms.uTexture.value = texture

        const render = () => renderer.render(scene, camera)
        const updatePieceLayout = () => {
          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight
          const rect = anchor.getBoundingClientRect()
          const pieceWidth = rect.width / COLUMNS
          const pieceHeight = rect.height / ROWS

          uniforms.uPieceSize.value.set(pieceWidth, pieceHeight)

          for (let row = 0; row < ROWS; row++) {
            for (let column = 0; column < COLUMNS; column++) {
              const index = row * COLUMNS + column
              const originalX = rect.left + (column + 0.5) * pieceWidth - viewportWidth / 2
              const originalY = viewportHeight / 2 - (rect.top + (row + 0.5) * pieceHeight)
              const normalizedRow = row / (ROWS - 1)
              const centeredRow = normalizedRow - 0.5
              const direction = row % 2 === 0 ? 1 : -1
              const lateralDistance = viewportWidth * (0.22 + deterministicNoise(row + 47) * 0.4)
              const pieceVariationX = (deterministicNoise(index + 101) - 0.5) * viewportWidth * 0.26
              const organicLift = (deterministicNoise(index + 89) - 0.5) * viewportHeight * 0.42
              const outwardLift = -centeredRow * viewportHeight * (0.18 + deterministicNoise(row + 61) * 0.18)

              origins[index * 3] = originalX
              origins[index * 3 + 1] = originalY
              origins[index * 3 + 2] = 0
              destinations[index * 3] = direction * lateralDistance + pieceVariationX
              destinations[index * 3 + 1] = organicLift + outwardLift
              destinations[index * 3 + 2] = (deterministicNoise(index + 131) - 0.5) * 780
            }
          }

          originAttribute.needsUpdate = true
          destinationAttribute.needsUpdate = true
        }

        const resize = () => {
          const viewportWidth = window.innerWidth
          const viewportHeight = window.innerHeight
          renderer.setSize(viewportWidth, viewportHeight, false)
          camera.aspect = viewportWidth / viewportHeight
          camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(viewportHeight / (2 * camera.position.z)))
          camera.updateProjectionMatrix()
          updatePieceLayout()
          render()
        }

        const applyProgress = (progress: number) => {
          updatePieceLayout()
          uniforms.uProgress.value = progress

          const crossfade = Math.max(0, Math.min(1, progress / 0.055))
          sourceImage.style.opacity = String(1 - crossfade)
          edge.style.opacity = String(1 - crossfade)
          renderer.domElement.style.opacity = String(crossfade)
          render()
        }

        const scrollState = { progress: 0 }
        const scrollTween = gsap.to(scrollState, {
          progress: 1,
          ease: 'none',
          onUpdate: () => applyProgress(scrollState.progress),
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: 0.9,
            invalidateOnRefresh: true,
            onEnter: () => { renderer.domElement.style.visibility = 'visible' },
            onEnterBack: () => { renderer.domElement.style.visibility = 'visible' },
            onLeave: () => { renderer.domElement.style.visibility = 'hidden' },
            onLeaveBack: () => {
              renderer.domElement.style.visibility = 'visible'
              applyProgress(0)
            },
          },
        })

        const heroArt = anchor.closest<HTMLElement>('.hero-art')
        const settleAfterEntrance = () => {
          resize()
          ScrollTrigger.refresh()
        }
        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(anchor)
        heroArt?.addEventListener('animationend', settleAfterEntrance, { once: true })
        window.addEventListener('resize', resize, { passive: true })
        resize()
        applyProgress(0)

        cleanup = () => {
          window.removeEventListener('resize', resize)
          resizeObserver.disconnect()
          heroArt?.removeEventListener('animationend', settleAfterEntrance)
          scrollTween.scrollTrigger?.kill()
          scrollTween.kill()
          sourceImage.style.opacity = ''
          edge.style.opacity = ''
          texture.dispose()
          basePlane.dispose()
          geometry.dispose()
          material.dispose()
          renderer.dispose()
          renderer.domElement.remove()
        }
      }, undefined, () => {
        renderer.dispose()
        renderer.domElement.remove()
      })
    }).catch(() => {
    })

    return () => {
      disposed = true
      cleanup()
    }
  }, [])

  return (
    <div className="hero-portrait">
      <div className="hero-portrait__frame" ref={anchorRef}>
        <img ref={imageRef} src={PORTRAIT_URL} alt="Mridul Srivastava in a black suit and white shirt" />
        <span ref={edgeRef} aria-hidden="true" />
      </div>
      <div className="scene-label scene-label-a">PORTRAIT / {PIECE_COUNT} PIECES</div>
      <div className="scene-label scene-label-b"><i /> SCROLL TO DISPERSE</div>
    </div>
  )
}
