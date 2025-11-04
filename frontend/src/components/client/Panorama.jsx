import { useEffect, useState, useRef } from 'react'

function Panorama({ preview, image, aspectRatio = '16/9', id }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef(null)
  const initializedRef = useRef(false)

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before visible
        threshold: 0.1,
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  // Load Panellum only when visible
  useEffect(() => {
    if (!isVisible) return
    if (initializedRef.current) return

    const containerId = `panorama-${id}`
    setIsLoading(true)

    const proxy = (url) =>
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/v1/proxy/image?url=${encodeURIComponent(url)}`

    // Lazy load CSS
    if (!document.querySelector("link[href='/panellum/panellum.css']")) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/panellum/panellum.css'
      document.head.appendChild(link)
    }

    // Lazy load JS
    if (!document.querySelector("script[src='/panellum/panellum.js']")) {
      const script = document.createElement('script')
      script.src = '/panellum/panellum.js'
      script.async = true
      script.onload = () => initViewer()
      script.onerror = () => {
        setIsLoading(false)
        console.error('Failed to load Panellum library')
      }
      document.body.appendChild(script)
    } else {
      initViewer()
    }

    function initViewer() {
      if (window.pannellum) {
        try {
          if (initializedRef.current) return
          initializedRef.current = true
          const viewer = window.pannellum.viewer(containerId, {
            type: 'equirectangular',
            panorama: proxy(image),
            autoLoad: false,
            preview: proxy(preview),
            showZoomCtrl: false,
            showFullscreenCtrl: true,
            showControls: true,
            compass: false,
            keyboardZoom: false,
            mouseZoom: true,
            doubleClickZoom: true,
            touchPan: true,
            touchZoom: true,
          })

          if (viewer) {
            // Stop showing our loading overlay once the viewer and its load button are ready
            setIsLoading(false)
            viewer.on('load', () => {
              setIsLoading(false)
            })
            viewer.on('error', () => {
              setIsLoading(false)
            })
          }
        } catch (error) {
          console.error('Error initializing Panellum viewer:', error)
          setIsLoading(false)
        }
      }
    }

    return () => {
      const container = document.getElementById(containerId)
      if (container) container.innerHTML = ''
      initializedRef.current = false
    }
  }, [isVisible, image, preview, id])

  return (
    <div
      ref={containerRef}
      id={`panorama-${id}`}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio,
        minHeight: '100%',
        position: 'relative',
        backgroundColor: '#000',
      }}
    >
      {!isVisible && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${preview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(5px)',
          }}
        />
      )}
      {isLoading && isVisible && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            fontSize: '14px',
            textAlign: 'center',
          }}
        >
          <div
            className='loader'
            style={{ margin: '0 auto 10px' }}
          />
          Loading 360° View...
        </div>
      )}
    </div>
  )
}

export default Panorama
