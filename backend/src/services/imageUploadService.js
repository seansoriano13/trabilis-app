import tinify from 'tinify'
import axios from 'axios'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configure Tinify
console.log('Tinify API Key configured:', process.env.TINIFY_API_KEY ? 'Yes' : 'No')
console.log('Tinify API Key value:', process.env.TINIFY_API_KEY)

class ImageUploadService {
    constructor() {
        this.imgbbApiUrl = process.env.IMG_BB_API_URL || 'https://api.imgbb.com/1/upload'
        this.imgbbApiKey = process.env.IMG_BB_API_KEY
    }

    /**
     * Optimize image using Tinify and upload to ImgBB
     * @param {Buffer} imageBuffer - Image buffer data
     * @param {string} filename - Original filename
     * @returns {Promise<string>} - ImgBB URL
     */
    async optimizeAndUpload(imageBuffer, filename = 'image.jpg') {
        try {
            console.log(`Starting image upload process for: ${filename}`)
            console.log(`Image size: ${(imageBuffer.length / 1024).toFixed(2)} KB`)
            
            let optimizedBuffer = imageBuffer
            
            // Step 1: Optimize image with Tinify (if API key is valid)
            if (process.env.TINIFY_API_KEY) {
                try {
                    console.log('Optimizing image with Tinify...')
                    tinify.key = process.env.TINIFY_API_KEY
                    optimizedBuffer = await this.optimizeImage(imageBuffer)
                } catch (tinifyError) {
                    console.warn('Tinify optimization failed, using original image:', tinifyError.message)
                    optimizedBuffer = imageBuffer
                }
            } else {
                console.log('Tinify API key not configured, skipping optimization')
            }
            
            // Step 2: Upload image to ImgBB
            console.log('Uploading image to ImgBB...')
            const imgbbUrl = await this.uploadToImgBB(optimizedBuffer, filename)
            
            console.log('Image successfully uploaded:', imgbbUrl)
            return imgbbUrl
            
        } catch (error) {
            console.error('Error in optimizeAndUpload:', error)
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                filename: filename,
                imageSize: imageBuffer.length
            })
            throw new Error(`Failed to optimize and upload image: ${error.message}`)
        }
    }

    /**
     * Optimize image using Tinify
     * @param {Buffer} imageBuffer - Image buffer data
     * @returns {Promise<Buffer>} - Optimized image buffer
     */
    async optimizeImage(imageBuffer) {
        try {
            // Convert buffer to Tinify source
            const source = tinify.fromBuffer(imageBuffer)
            
            // Get optimized buffer
            const optimizedBuffer = await source.toBuffer()
            
            // Log compression stats
            const originalSize = imageBuffer.length
            const optimizedSize = optimizedBuffer.length
            const compressionRatio = ((originalSize - optimizedSize) / originalSize * 100).toFixed(2)
            
            console.log(`Image optimization complete:`)
            console.log(`- Original size: ${(originalSize / 1024).toFixed(2)} KB`)
            console.log(`- Optimized size: ${(optimizedSize / 1024).toFixed(2)} KB`)
            console.log(`- Compression: ${compressionRatio}%`)
            
            return optimizedBuffer
            
        } catch (error) {
            console.error('Tinify optimization error:', error)
            throw new Error(`Image optimization failed: ${error.message}`)
        }
    }

    /**
     * Upload image to ImgBB
     * @param {Buffer} imageBuffer - Image buffer data
     * @param {string} filename - Filename for upload
     * @returns {Promise<string>} - ImgBB URL
     */
    async uploadToImgBB(imageBuffer, filename) {
        try {
            if (!this.imgbbApiKey) {
                throw new Error('ImgBB API key not configured')
            }

            // Convert buffer to base64
            const base64Image = imageBuffer.toString('base64')
            
            // Prepare form data
            const formData = new FormData()
            formData.append('image', base64Image)
            formData.append('name', filename)

            // Upload to ImgBB
            const response = await axios.post(
                `${this.imgbbApiUrl}?key=${this.imgbbApiKey}`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            )

            if (response.data.success) {
                return response.data.data.url
            } else {
                throw new Error(`ImgBB upload failed: ${response.data.error?.message || 'Unknown error'}`)
            }
            
        } catch (error) {
            console.error('ImgBB upload error:', error)
            throw new Error(`ImgBB upload failed: ${error.message}`)
        }
    }

    /**
     * Get Tinify compression count (for monitoring)
     * @returns {Promise<number>} - Number of compressions used this month
     */
    async getCompressionCount() {
        try {
            if (!tinify.key) {
                console.log('Tinify API key not configured, returning 0')
                return 0
            }
            
            const result = await tinify.compressionCount
            console.log('Tinify compression count:', result)
            return result || 0
        } catch (error) {
            console.error('Error getting compression count:', error)
            return 0
        }
    }

    /**
     * Validate image file
     * @param {Buffer} imageBuffer - Image buffer data
     * @param {string} filename - Original filename
     * @returns {boolean} - Whether image is valid
     */
    validateImage(imageBuffer, filename) {
        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024 // 10MB
        if (imageBuffer.length > maxSize) {
            throw new Error('Image file too large. Maximum size is 10MB.')
        }

        // Check file extension
        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp']
        const ext = path.extname(filename).toLowerCase()
        if (!allowedExtensions.includes(ext)) {
            throw new Error(`Unsupported image format. Allowed: ${allowedExtensions.join(', ')}`)
        }

        // Check if it's a valid image buffer (basic check)
        if (imageBuffer.length < 100) {
            throw new Error('Invalid image file.')
        }

        return true
    }
}

export default new ImageUploadService()
