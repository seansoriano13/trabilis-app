import { useEffect } from 'react'
import '../../../public/panellum/panellum.css'

function Panorama({ preview, image, aspectRatio = '16/9', id }) {
    useEffect(() => {
        const containerId = `panorama-${id}`

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
                window.pannellum.viewer(containerId, {
                    type: 'equirectangular',
                    panorama: image,
                    autoLoad: false,
                    preview: preview,
                    showZoomCtrl: false,
                    showFullscreenCtrl: true,
                })
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
                aspectRatio,
                maxHeight: '20vh',
            }}
        ></div>
    )
}

export default Panorama
