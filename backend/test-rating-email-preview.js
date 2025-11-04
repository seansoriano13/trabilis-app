/**
 * Test script to preview the rating email template
 * Run: node test-rating-email-preview.js
 * Opens: rating-email-preview.html in your browser
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Mock data for preview
const passengerName = 'John Doe'
const tourName = 'Amazing Palawan Adventure Tour'
const bookingReference = 'TOUR-2024-ABC123'
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
const ratingUrl = `${frontendUrl}/submit-rating/sample-token-preview`

// Email HTML template (same as in ratingEmailService.js)
const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Rate Your Tour Experience</title>
  <style>
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background-color: #f5f7fa; 
      margin: 0; 
      padding: 0; 
      line-height: 1.6; 
      color: #333; 
    }
    .container { 
      max-width: 600px; 
      margin: 30px auto; 
      background: white; 
      border-radius: 8px; 
      box-shadow: 0 2px 8px rgba(0,0,0,0.1); 
      overflow: hidden;
    }
    .header { 
      background: black; 
      color: white; 
      padding: 40px 30px; 
      text-align: center; 
    }
    .header h1 { 
      margin: 0 0 10px 0; 
      font-size: 28px; 
      font-weight: 700;
    }
    .header p { 
      margin: 0; 
      font-size: 15px; 
      opacity: 0.85; 
    }
    .content { 
      padding: 40px 30px; 
    }
    .content p { 
      font-size: 16px; 
      color: #333; 
      margin-bottom: 20px; 
      line-height: 1.6;
    }
    .highlight-box { 
      background: #fffbea; 
      border: 1px solid #f7d100; 
      padding: 20px; 
      border-radius: 8px; 
      margin: 25px 0; 
    }
    .highlight-box p { 
      margin: 5px 0; 
      color: #333; 
    }
    .cta-section { 
      text-align: center; 
      margin: 35px 0 25px 0; 
    }
    .button { 
      display: inline-block; 
      background: linear-gradient(135deg, #f7d100 0%, #e6c200 100%); 
      color: #000; 
      padding: 16px 40px; 
      text-decoration: none; 
      border-radius: 8px; 
      font-weight: 700; 
      font-size: 16px; 
      box-shadow: 0 4px 12px rgba(247, 209, 0, 0.3); 
      transition: all 0.3s ease;
    }
    .info-box { 
      background: #f8f9fa; 
      border: 1px solid #e9ecef; 
      border-radius: 8px; 
      padding: 20px; 
      margin: 25px 0; 
    }
    .info-box p { 
      margin: 0; 
      color: #333; 
      font-size: 14px; 
      line-height: 1.6;
    }
    .info-box-title {
      font-weight: 700;
      margin-bottom: 10px;
      font-size: 15px;
    }
    .footer { 
      text-align: center; 
      padding: 30px; 
      border-top: 1px solid #e9ecef; 
      background-color: #f8f9fa;
    }
    .footer p { 
      margin: 5px 0; 
      font-size: 14px; 
      color: #6c757d; 
    }
    .footer .brand { 
      font-size: 18px; 
      font-weight: 900; 
      color: #000; 
      margin-bottom: 5px; 
    }
    .footer .brand-highlight { 
      color: #f7d100; 
    }
    .footer .tagline { 
      font-size: 13px; 
      color: #888; 
      margin-bottom: 15px;
    }
    .footer .contact { 
      margin-top: 15px; 
      padding-top: 15px; 
      border-top: 1px solid #dee2e6; 
    }
    .footer .contact a { 
      color: #f7d100; 
      text-decoration: none; 
      font-weight: 600; 
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>How was your tour?</h1>
      <p>We'd love to hear about your experience!</p>
    </div>
    
    <div class="content">
      <p>Dear <strong>${passengerName}</strong>,</p>
      
      <p>We hope you had an amazing experience on your <strong>${tourName}</strong> tour!</p>
      
      <div class="info-box">
        <p class="info-box-title">Your Feedback Matters</p>
        <p>
          Your feedback helps us improve our services and provide better experiences for future travelers. 
          It only takes a moment to rate your experience.
        </p>
      </div>
      
      <div class="cta-section">
        <a href="${ratingUrl}" class="button">Rate Your Experience</a>
      </div>
      
      <div class="highlight-box">
        <p><strong>Tour:</strong> ${tourName}</p>
      </div>
      
      <p style="color: #6c757d; font-size: 14px;">
        Thank you for choosing Trabilis! We appreciate your trust in us and look forward to serving you again.
      </p>
    </div>
    
    <div class="footer">
      <p class="brand">
        <span class="brand-highlight">Trabilis</span>
      </p>
      <p class="tagline">Your Travel Companion</p>
      
      <div class="contact">
        <p>
          Need help? Contact us at 
          <a href="mailto:support@trabilis.com">support@trabilis.com</a>
        </p>
        <p>Phone: <strong>9296106660</strong></p>
      </div>
      
      <p style="font-size: 12px; margin-top: 20px; color: #888;">
        &copy; ${new Date().getFullYear()} Trabilis. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
`

// Save to file
const outputPath = path.join(__dirname, 'rating-email-preview.html')
fs.writeFileSync(outputPath, emailHtml)

console.log('✅ Email preview generated!')
console.log(`📧 Open this file in your browser: ${outputPath}`)
console.log('\nOr run:')
console.log(`   start ${outputPath}  (Windows)`)
console.log(`   open ${outputPath}   (Mac)`)
console.log(`   xdg-open ${outputPath}  (Linux)`)
