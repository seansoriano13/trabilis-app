import { useEffect } from 'react'
import '../../../public/panellum/panellum.css'

function Panorama({ preview, image, aspectRatio = '16/9' }) {
    useEffect(() => {
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
                window.pannellum.viewer('panorama', {
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
            const container = document.getElementById('panorama')
            if (container) container.innerHTML = ''
        }
    }, [image])

    return (
        <div
            id='panorama'
            style={{
                width: '100%',
                aspectRatio, // responsive height based on width
                maxHeight: '20vh', // prevent overflow
            }}
        ></div>
    )
}

export default Panorama
