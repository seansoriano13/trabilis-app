import * as brevo from '@getbrevo/brevo'
import { supabase } from '../config/supabaseClient.js'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi()
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY)

/**
 * Send ticketing deadline alert email
 */
export async function sendTicketingDeadlineAlert({
    email,
    firstName,
    lastName,
    bookingReference,
    hoursRemaining,
    deadline,
    totalAmount,
    currency
}) {
    try {
        console.log(`[EMAIL] Sending ticketing deadline alert to ${email}`)
        
        // Create deadline alert email
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Ticketing Deadline Alert</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #ff6b35, #f7931e); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .urgent-box { background: #fff3cd; border: 2px solid #ffeaa7; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .booking-details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #ff6b35; }
                    .cta-button { display: inline-block; background: #ff6b35; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; text-align: center; }
                    .cta-button:hover { background: #e55a2b; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
                    .amount { font-size: 24px; font-weight: bold; color: #ff6b35; }
                    .deadline-notice { background: #e9ecef; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>⏰ Ticketing Deadline Alert</h1>
                    <p>Lindela Travel and Tours</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${firstName} ${lastName},</h2>
                    
                    <div class="urgent-box">
                        <h3 style="color: #856404; margin-top: 0;">⚠️ URGENT: Ticketing Deadline Approaching</h3>
                        <p style="margin-bottom: 0;">
                            Your flight booking needs to be ticketed within <strong>${hoursRemaining} hours</strong> 
                            or it will be automatically cancelled.
                        </p>
                    </div>
                    
                    <div class="booking-details">
                        <h3 style="margin-top: 0;">Booking Details</h3>
                        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
                        <p><strong>Total Amount:</strong> <span class="amount">₱${totalAmount?.toLocaleString() || '0'}</span></p>
                        <p><strong>Deadline:</strong> ${new Date(deadline).toLocaleString()}</p>
                        <p><strong>Time Remaining:</strong> ${hoursRemaining} hours</p>
                    </div>
                    
                    <div class="deadline-notice">
                        <strong>🚨 ACTION REQUIRED</strong><br>
                        Our ticketing team needs to process your booking before the deadline to avoid automatic cancellation.
                    </div>
                    
                    <p><strong>What happens next?</strong></p>
                    <ul>
                        <li>Our ticketing team will process your booking immediately</li>
                        <li>You will receive your e-ticket via email once processed</li>
                        <li>If not processed in time, your booking will be automatically cancelled</li>
                        <li>No refund will be issued for cancelled bookings (non-refundable policy)</li>
                    </ul>
                    
                    <p><strong>Need immediate assistance?</strong><br>
                    Contact our ticketing team at <a href="mailto:lindelatravelandtours@gmail.com">lindelatravelandtours@gmail.com</a> 
                    or call us at 9296106660.</p>
                </div>
                
                <div class="footer">
                    <p><strong>Lindela Travel and Tours</strong></p>
                    <p>Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street<br>
                    Makati Metro Manila, Philippines</p>
                    <p>Phone: 9296106660 | Email: lindelatravelandtours@gmail.com</p>
                    <p style="font-size: 12px; margin-top: 20px;">
                        This is an automated alert. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>
        `
        
        // Create email data
        const emailData = {
            to: [{ email, name: `${firstName} ${lastName}`.trim() }],
            subject: `⏰ URGENT: Ticketing Deadline Alert - ${bookingReference}`,
            htmlContent: htmlContent,
            sender: {
                name: 'Lindela Travel and Tours',
                email: 'lindelatravelandtours@gmail.com'
            }
        }
        
        // Send email
        const result = await apiInstance.sendTransacEmail(emailData)
        
        console.log(`[EMAIL] ✅ Ticketing deadline alert sent successfully to ${email}`)
        return { success: true, messageId: result.messageId }
        
    } catch (error) {
        console.error(`[EMAIL] ❌ Failed to send ticketing deadline alert to ${email}:`, error)
        throw new Error(`Failed to send ticketing deadline alert: ${error.message}`)
    }
}

/**
 * Send ticketing expired alert email
 */
export async function sendTicketingExpiredAlert({
    email,
    firstName,
    lastName,
    bookingReference,
    totalAmount,
    currency
}) {
    try {
        console.log(`[EMAIL] Sending ticketing expired alert to ${email}`)
        
        // Create expiration alert email
        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>Booking Expired - Ticketing Deadline Missed</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #dc3545, #c82333); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
                    .expired-box { background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 8px; padding: 20px; margin: 20px 0; }
                    .booking-details { background: white; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #dc3545; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; color: #6c757d; font-size: 14px; }
                    .amount { font-size: 24px; font-weight: bold; color: #dc3545; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>❌ Booking Expired</h1>
                    <p>Lindela Travel and Tours</p>
                </div>
                
                <div class="content">
                    <h2>Hello ${firstName} ${lastName},</h2>
                    
                    <div class="expired-box">
                        <h3 style="color: #721c24; margin-top: 0;">⚠️ BOOKING EXPIRED</h3>
                        <p style="margin-bottom: 0;">
                            Your flight booking has been automatically cancelled due to missed ticketing deadline.
                        </p>
                    </div>
                    
                    <div class="booking-details">
                        <h3 style="margin-top: 0;">Booking Details</h3>
                        <p><strong>Booking Reference:</strong> ${bookingReference}</p>
                        <p><strong>Amount Forfeited:</strong> <span class="amount">₱${totalAmount?.toLocaleString() || '0'}</span></p>
                        <p><strong>Status:</strong> EXPIRED</p>
                        <p><strong>Reason:</strong> Missed ticketing deadline</p>
                    </div>
                    
                    <p><strong>What happened?</strong></p>
                    <ul>
                        <li>Your booking was not ticketed within the 6-day deadline</li>
                        <li>The airline automatically cancelled the reservation</li>
                        <li>No refund will be issued (per non-refundable policy)</li>
                        <li>You will need to make a new booking if you still wish to travel</li>
                    </ul>
                    
                    <p><strong>Need assistance?</strong><br>
                    If you believe this is an error or need help with a new booking, 
                    please contact us at <a href="mailto:lindelatravelandtours@gmail.com">lindelatravelandtours@gmail.com</a> 
                    or call 9296106660.</p>
                </div>
                
                <div class="footer">
                    <p><strong>Lindela Travel and Tours</strong></p>
                    <p>Unit 2215 Cityland 10 Tower II, H. V. Dela Costa Street<br>
                    Makati Metro Manila, Philippines</p>
                    <p>Phone: 9296106660 | Email: lindelatravelandtours@gmail.com</p>
                    <p style="font-size: 12px; margin-top: 20px;">
                        This is an automated notification. Please do not reply to this email.
                    </p>
                </div>
            </body>
            </html>
        `
        
        // Create email data
        const emailData = {
            to: [{ email, name: `${firstName} ${lastName}`.trim() }],
            subject: `❌ Booking Expired - ${bookingReference}`,
            htmlContent: htmlContent,
            sender: {
                name: 'Lindela Travel and Tours',
                email: 'lindelatravelandtours@gmail.com'
            }
        }
        
        // Send email
        const result = await apiInstance.sendTransacEmail(emailData)
        
        console.log(`[EMAIL] ✅ Ticketing expired alert sent successfully to ${email}`)
        return { success: true, messageId: result.messageId }
        
    } catch (error) {
        console.error(`[EMAIL] ❌ Failed to send ticketing expired alert to ${email}:`, error)
        throw new Error(`Failed to send ticketing expired alert: ${error.message}`)
    }
}
