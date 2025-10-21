const ItineraryCard = ({
  itinIndex,
  itinerary,
  updateItinerary,
  removeItinerary,
  handleItineraryImageChange,
  itineraryImagePreviews,
  canRemove,
}) => {
  return (
    <div className='tour-form__itinerary-card'>
      <div className='tour-form__itinerary-header'>
        <span className='tour-form__itinerary-badge'>
          Day {itinerary.day_number}
        </span>
      </div>
      <div className='tour-form__fields'>
        <div className='tour-form__field-group'>
          <label className='tour-form__label'>
            Day Number <span className='tour-form__required'>*</span>
          </label>
          <input
            type='number'
            value={itinerary.day_number}
            onChange={(e) =>
              updateItinerary(itinIndex, 'day_number', Number(e.target.value))
            }
            className='tour-form__input'
            min='1'
          />
        </div>

        <div className='tour-form__field-group tour-form__field-group--full'>
          <label className='tour-form__label'>
            Title <span className='tour-form__required'>*</span>
          </label>
          <input
            type='text'
            value={itinerary.title}
            onChange={(e) =>
              updateItinerary(itinIndex, 'title', e.target.value)
            }
            className='tour-form__input'
            placeholder='e.g., Arrival to Amman'
          />
        </div>

        <div className='tour-form__field-group tour-form__field-group--full'>
          <label className='tour-form__label'>
            Description <span className='tour-form__required'>*</span>
          </label>
          <textarea
            value={itinerary.description}
            onChange={(e) =>
              updateItinerary(itinIndex, 'description', e.target.value)
            }
            className='tour-form__textarea'
            rows='3'
            placeholder='Describe the activities for this day...'
          />
        </div>

        <div className='tour-form__field-group tour-form__field-group--full'>
          <label className='tour-form__label'>Image URL (Optional)</label>
          <div className='tour-form__image-upload'>
            <input
              type='file'
              accept='image/*'
              onChange={(e) => handleItineraryImageChange(itinIndex, e)}
              className='tour-form__file-input'
            />
            {itineraryImagePreviews[itinIndex] && (
              <div className='tour-form__image-preview'>
                <img
                  src={itineraryImagePreviews[itinIndex]}
                  alt={`Itinerary ${itinIndex + 1} preview`}
                  className='tour-form__preview-img'
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {canRemove && (
        <button
          onClick={() => removeItinerary(itinIndex)}
          className='tour-form__btn tour-form__btn--danger'
        >
          Remove Itinerary
        </button>
      )}
    </div>
  )
}

export default ItineraryCard

