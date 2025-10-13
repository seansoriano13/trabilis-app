import express from 'express'
import multer from 'multer'
import imageUploadService from '../services/imageUploadService.js'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.'), false)
        }
    }
})

/**
 * POST /api/v1/images/upload-image
 * Upload and optimize image using Tinify + ImgBB
 */
router.post('/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No image file provided'
            })
        }

        const { buffer, originalname } = req.file
        
        // Validate image
        imageUploadService.validateImage(buffer, originalname)
        
        // Optimize and upload image
        const imageUrl = await imageUploadService.optimizeAndUpload(buffer, originalname)
        
        res.json({
            success: true,
            data: {
                url: imageUrl,
                filename: originalname,
                size: buffer.length
            }
        })
        
    } catch (error) {
        console.error('Image upload error:', error)
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to upload image'
        })
    }
})

/**
 * GET /api/v1/images/compression-stats
 * Get Tinify compression statistics
 */
router.get('/compression-stats', async (req, res) => {
    try {
        const compressionCount = await imageUploadService.getCompressionCount()
        const apiKeyStatus = process.env.TINIFY_API_KEY ? 'Configured' : 'Not configured'
        
        res.json({
            success: true,
            data: {
                compressionsUsed: compressionCount,
                compressionsRemaining: apiKeyStatus === 'Configured' ? Math.max(0, 500 - compressionCount) : null,
                apiKey: apiKeyStatus
            }
        })
        
    } catch (error) {
        console.error('Compression stats error:', error)
        res.status(500).json({
            success: false,
            error: error.message || 'Failed to get compression stats'
        })
    }
})

export default router
