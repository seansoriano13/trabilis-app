import { useEffect } from 'react'
import '../../../public/panellum/panellum.css'

function Panorama({ preview, image, aspectRatio = '16/9', id }) {
    useEffect(() => {
        const containerId = `panorama-${id}`

        // Auto-proxy external images
        const isExternal =
            !image.startsWith('/') && !image.includes(window.location.host)
        const safeImage = isExternal
            ? `${
                  import.meta.env.VITE_BACKEND_URL || ''
              }/proxy-image?url=${encodeURIComponent(image)}`
            : image

        const safePreview =
            preview &&
            !preview.startsWith('/') &&
            !preview.includes(window.location.host)
                ? `${
                      import.meta.env.VITE_BACKEND_URL || ''
                  }/proxy-image?url=${encodeURIComponent(preview)}`
                : preview

        if (!document.querySelector("script[src='/panellum/panellum.js']")) {
            const script = document.createElement('script')
            script.src = '/panellum/panellum.js'
            script.async = true
            script.onload = () => initViewer(safeImage, safePreview)
            document.body.appendChild(script)
        } else {
            initViewer(safeImage, safePreview)
        }

        function initViewer(img, prev) {
            if (window.pannellum) {
                window.pannellum.viewer(containerId, {
                    type: 'equirectangular',
                    panorama: img,
                    autoLoad: false,
                    preview: prev,
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
