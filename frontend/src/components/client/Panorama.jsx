import { useEffect } from 'react'

function Panorama({ preview, image, aspectRatio = '16/9', id }) {
    useEffect(() => {
        const containerId = `panorama-${id}`

        const proxy = (url) =>
            `${
                import.meta.env.VITE_BACKEND_URL
            }/api/v1/proxy/image?url=${encodeURIComponent(url)}`

        if (!document.querySelector("script[src='/panellum/panellum.js']")) {
            const script = document.createElement('script')
            script.src = '/panellum/panellum.js'
            script.async = true
            script.onload = () => initViewer()
            document.body.appendChild(script)
        } else {
            initViewer()
        }

        function initViewer() {
            if (window.pannellum) {
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
                
                // Ensure the viewer is interactive
                if (viewer) {
                    viewer.on('load', () => {
                        console.log('Panorama loaded for', containerId)
                    })
                }
            }
        }

        return () => {
            const container = document.getElementById(containerId)
            if (container) container.innerHTML = ''
        }
    }, [image, preview, id])

    return (
        <div
            id={`panorama-${id}`}
            style={{
                width: '100%',
                height: '100%',
                aspectRatio,
                minHeight: '100%',
            }}
        ></div>
    )
}

export default Panorama
