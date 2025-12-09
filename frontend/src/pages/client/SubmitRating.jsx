import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FaStar } from 'react-icons/fa'
import axios from 'axios'
import { BACKEND_URL } from '../../config'
import './SubmitRating.css'

const SubmitRating = () => {
  const { token } = useParams()
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState('')
  const [commentEdited, setCommentEdited] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [bookingReference, setBookingReference] = useState('')

  const getDefaultComment = (ratingValue) => {
    const defaults = {
      1: 'Poor',
      2: 'Fair',
      3: 'Good',
      4: 'Very good',
      5: 'Excellent',
    }
    return defaults[ratingValue] || ''
  }

  const handleRatingClick = (star) => {
    setRating(star)
    const defaultForStar = getDefaultComment(star)

    // If the user has not edited the comment or it's still at a default/empty state,
    // update it to match the selected star's default text.
    const isAtDefaultOrEmpty =
      !commentEdited ||
      comment.trim() === '' ||
      comment.trim() === getDefaultComment(rating)

    if (isAtDefaultOrEmpty) {
      setComment(defaultForStar)
      setCommentEdited(false)
    }
  }

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/ratings/submit/${token}`,
        { rating, comment: comment.trim() || null }
      )

      setBookingReference(response.data.bookingReference)
      setSubmitted(true)
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to submit rating. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className='submit-rating-container'>
        <div className='submit-rating-card success-card'>
          <div className='success-icon'>✓</div>
          <h1>Thank You!</h1>
          <p>Your feedback has been submitted successfully.</p>
          {bookingReference && (
            <p className='booking-ref'>Booking Reference: {bookingReference}</p>
          )}
          <p className='sub-text'>
            We appreciate you taking the time to rate your experience with
            Trabilis Travel.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='submit-rating-container'>
      <div className='submit-rating-card'>
        <h1>Rate Your Experience</h1>
        <p className='intro-text'>
          How would you rate your tour experience with Trabilis Travel?
        </p>

        <div className='star-selector'>
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`star-icon ${
                star <= (hoveredRating || rating)
                  ? 'star-active'
                  : 'star-inactive'
              }`}
              onClick={() => handleRatingClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
            />
          ))}
        </div>

        <div className='rating-labels'>
          {rating === 0 && (
            <span className='rating-label'>Select a rating</span>
          )}
          {rating === 1 && <span className='rating-label'>Poor</span>}
          {rating === 2 && <span className='rating-label'>Fair</span>}
          {rating === 3 && <span className='rating-label'>Good</span>}
          {rating === 4 && <span className='rating-label'>Very Good</span>}
          {rating === 5 && <span className='rating-label'>Excellent</span>}
        </div>

        <div className='comment-section'>
          <label
            htmlFor='comment'
            className='comment-label'
          >
            Comment (optional)
          </label>
          <textarea
            id='comment'
            className='comment-textarea'
            value={comment}
            onChange={(e) => {
              const value = e.target.value
              setComment(value)
              // Mark as edited if user deviates from the default text for the current rating
              const currentDefault = getDefaultComment(rating)
              setCommentEdited(value.trim() !== currentDefault)
            }}
            placeholder='Share your thoughts about your experience...'
            rows={4}
          />
        </div>

        {error && <div className='error-message'>{error}</div>}

        <button
          className='submit-button'
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Rating'}
        </button>

        <p className='privacy-text'>
          Your feedback helps us improve our services and provide better
          experiences.
        </p>
      </div>
    </div>
  )
}

export default SubmitRating
