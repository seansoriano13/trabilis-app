import { supabase } from '../config/supabaseClient.js'
import { v4 as uuidv4 } from 'uuid'
import { sendEmail } from './brevoEmailService.js'

export const buildRatingEmailHtml = (passengerName, tourName, token) => {
  const ratingUrl = `${
    process.env.FRONTEND_URL || 'http://localhost:5173'
  }/submit-rating/${token}`

  return `
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
                  <a href="mailto:${
                    process.env.SUPPORT_EMAIL || 'support@trabilis.com'
                  }">
                    ${process.env.SUPPORT_EMAIL || 'support@trabilis.com'}
                  </a>
                </p>
                <p>Phone: <strong>${
                  process.env.SUPPORT_PHONE || '9296106660'
                }</strong></p>
              </div>
              
              <p style="font-size: 12px; margin-top: 20px; color: #888;">
                &copy; ${new Date().getFullYear()} Trabilis. All rights reserved.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
}

/**
 * Cron job function to send rating request emails
 * Runs daily to check for completed tours
 * @param {boolean} dryRun - If true, only logs what would happen without sending emails
 */
export const sendRatingRequests = async (dryRun = false) => {
  try {
    console.log(
      `Running rating request email job... ${dryRun ? '(DRY RUN MODE)' : ''}`
    )

    // Get email delay setting from system_settings
    const { data: settingData } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'rating_email_delay_days')
      .single()

    const delayDays = settingData ? parseInt(settingData.value) : 1

    // Calculate target end date (today - delay days)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() - delayDays)
    const targetDateStr = targetDate.toISOString().split('T')[0]

    console.log(`Looking for tours that ended on ${targetDateStr}`)

    // Find tour bookings where end_date = target date and status is CONFIRMED
    const { data: allBookings, error: toursError } = await supabase
      .from('tour_bookings')
      .select(
        `
        *,
        package_dates (
          end_date,
          tour_packages (
            title
          )
        )
      `
      )
      .eq('status', 'CONFIRMED')

    if (toursError) {
      console.error('Error fetching tour bookings:', toursError)
      return
    }

    // Filter by end date in JavaScript since end_date is in package_dates
    const completedTours = (allBookings || []).filter(
      (booking) => booking.package_dates?.end_date === targetDateStr
    )

    console.log(`Found ${completedTours.length} completed tours`)

    if (completedTours.length === 0) {
      console.log('No completed tours found. Exiting.')
      return
    }

    if (dryRun) {
      console.log(
        '🔍 DRY RUN: Will process these bookings without sending emails'
      )
    }

    let emailsSent = 0
    let emailsSkipped = 0

    // For each completed tour, check if rating already exists or email already sent
    for (const tour of completedTours) {
      const { data: existingRating } = await supabase
        .from('tour_ratings')
        .select('*')
        .eq('tour_booking_id', tour.id)
        .single()

      if (existingRating) {
        console.log(
          `⏭️  Rating already exists for booking ${tour.booking_reference}`
        )
        emailsSkipped++
        continue
      }

      // Generate unique token
      const token = uuidv4()

      // Create rating record with email_sent_at (skip in dry run)
      if (!dryRun) {
        const { error: insertError } = await supabase
          .from('tour_ratings')
          .insert({
            tour_booking_id: tour.id,
            email_sent_at: new Date().toISOString(),
            token: token,
            rating: null, // Will be filled when user submits
          })

        if (insertError) {
          console.error(
            `Error creating rating record for ${tour.booking_reference}:`,
            insertError
          )
          continue
        }
      } else {
        console.log(
          `[DRY RUN] Would create rating record for booking ${tour.booking_reference}`
        )
      }

      // Send email to primary passenger with validation
      let passengers = tour.passenger_details

      // Validate and parse passenger_details structure
      if (!passengers) {
        console.warn(
          `No passenger_details for booking ${tour.booking_reference}, skipping`
        )
        emailsSkipped++
        continue
      }

      // Handle if passenger_details is a string (needs parsing)
      if (typeof passengers === 'string') {
        try {
          passengers = JSON.parse(passengers)
        } catch (parseError) {
          console.error(
            `Failed to parse passenger_details for booking ${tour.booking_reference}:`,
            parseError
          )
          emailsSkipped++
          continue
        }
      }

      // Ensure passengers is an array
      if (!Array.isArray(passengers)) {
        console.warn(
          `passenger_details is not an array for booking ${
            tour.booking_reference
          }, type: ${typeof passengers}, skipping`
        )
        emailsSkipped++
        continue
      }

      // Get primary passenger
      const primaryPassenger = passengers[0]

      if (!primaryPassenger) {
        console.warn(
          `No passengers found in passenger_details for booking ${tour.booking_reference}, skipping`
        )
        emailsSkipped++
        continue
      }

      // Validate email exists
      const passengerEmail =
        primaryPassenger.email || primaryPassenger.contact?.emailAddress
      if (!passengerEmail) {
        console.warn(
          `No email found for primary passenger in booking ${tour.booking_reference}, skipping`
        )
        emailsSkipped++
        continue
      }

      // Validate passenger name
      let passengerName = 'Valued Customer'

      if (typeof primaryPassenger.name === 'string') {
        // If name is already a string, use it
        passengerName = primaryPassenger.name
      } else if (
        primaryPassenger.name?.firstName ||
        primaryPassenger.name?.lastName
      ) {
        // If name is an object with firstName/lastName, build the full name
        const firstName = primaryPassenger.name.firstName || ''
        const lastName = primaryPassenger.name.lastName || ''
        passengerName = `${firstName} ${lastName}`.trim() || 'Valued Customer'
      } else if (primaryPassenger.firstName || primaryPassenger.lastName) {
        // Check if firstName/lastName are at the root level
        const firstName = primaryPassenger.firstName || ''
        const lastName = primaryPassenger.lastName || ''
        passengerName = `${firstName} ${lastName}`.trim() || 'Valued Customer'
      }

      const tourName = tour.package_dates?.tour_packages?.title || 'Tour'
      const ratingUrl = `${
        process.env.FRONTEND_URL || 'http://localhost:5173'
      }/submit-rating/${token}`

      const emailHtml = buildRatingEmailHtml(
        passengerName,
        tourName,
        token
      )

      try {
        if (!dryRun) {
          await sendEmail({
            to: passengerEmail,
            subject: `Rate your ${tourName} experience`,
            html: emailHtml,
          })

          console.log(
            `✅ Rating request email sent to ${passengerEmail} for booking ${tour.booking_reference}`
          )
          emailsSent++
        } else {
          console.log(`[DRY RUN] Would send email to: ${passengerEmail}`)
          console.log(`  📧 Subject: Rate your ${tourName} experience`)
          console.log(`  📝 Booking: ${tour.booking_reference}`)
          console.log(`  👤 Passenger: ${passengerName}`)
          console.log(`  🔗 Rating URL: ${ratingUrl}`)
          emailsSent++
        }
      } catch (emailError) {
        console.error(
          `❌ Error sending rating email for ${tour.booking_reference}:`,
          emailError
        )
        emailsSkipped++
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(
      `📊 Rating Request Email Job ${dryRun ? '(DRY RUN)' : ''} Summary:`
    )
    console.log('='.repeat(60))
    console.log(`✅ Emails ${dryRun ? 'to be sent' : 'sent'}: ${emailsSent}`)
    console.log(`⏭️  Emails skipped: ${emailsSkipped}`)
    console.log(`📦 Total bookings processed: ${completedTours.length}`)
    console.log('='.repeat(60) + '\n')
  } catch (error) {
    console.error('Error in sendRatingRequests:', error)
  }
}

/**
 * Process rating submission from public endpoint
 */
export const processRatingSubmission = async (token, rating, comment = null) => {
  try {
    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      throw new Error('Invalid rating value')
    }

    // Find rating record by token
    const { data: ratingRecord, error: findError } = await supabase
      .from('tour_ratings')
      .select('*, tour_bookings(*)')
      .eq('token', token)
      .single()

    if (findError || !ratingRecord) {
      throw new Error('Invalid or expired rating link')
    }

    // Check if rating already submitted
    if (ratingRecord.rating !== null) {
      throw new Error('Rating already submitted')
    }

    // Prepare update data
    const updateData = {
      rating: rating,
      created_at: new Date().toISOString(),
    }

    // Add comment if provided (trim and set to null if empty)
    if (comment !== null && comment !== undefined) {
      const trimmedComment = comment.trim()
      updateData.comment = trimmedComment || null
    }

    // Update rating
    const { error: updateError } = await supabase
      .from('tour_ratings')
      .update(updateData)
      .eq('id', ratingRecord.id)

    if (updateError) throw updateError

    return {
      success: true,
      message: 'Thank you for your feedback!',
      bookingReference: ratingRecord.tour_bookings.booking_reference,
    }
  } catch (error) {
    console.error('Error processing rating submission:', error)
    throw error
  }
}
