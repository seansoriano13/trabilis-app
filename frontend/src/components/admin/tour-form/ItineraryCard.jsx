const ItineraryCard = ({
  itinIndex,
  itinerary,
  updateItinerary,
  removeItinerary,
  handleItineraryImageChange,
  handleRemoveItineraryImage,
  itineraryImagePreviews,
  maxImages = 10,
  canRemove,
}) => {
  // Get images array from itinerary (support both images array and image_url for backward compatibility)
  const images =
    itinerary.images || (itinerary.image_url ? [itinerary.image_url] : [])
  const imageCount = images.length
  const canAddMore = imageCount < maxImages

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
          <label className='tour-form__label'>
            Images (Optional)
            <span
              className='tour-form__label-hint'
              style={{
                marginLeft: '8px',
                fontWeight: 'normal',
                fontSize: '0.9em',
                color: '#666',
              }}
            >
              {imageCount}/{maxImages} images
            </span>
          </label>
          <div className='tour-form__image-upload'>
            {canAddMore && (
              <div style={{ marginBottom: '12px' }}>
                <input
                  type='file'
                  accept='image/*'
                  onChange={(e) => handleItineraryImageChange(itinIndex, e)}
                  className='tour-form__file-input'
                  id={`itinerary-image-${itinIndex}`}
                />
                <label
                  htmlFor={`itinerary-image-${itinIndex}`}
                  className='tour-form__btn tour-form__btn--secondary'
                  style={{
                    display: 'inline-block',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    marginBottom: '8px',
                  }}
                >
                  + Add Image
                </label>
              </div>
            )}
            {!canAddMore && (
              <div
                style={{
                  marginBottom: '12px',
                  color: '#999',
                  fontSize: '0.9em',
                }}
              >
                Maximum {maxImages} images reached
              </div>
            )}

            {/* Display existing images */}
            {images.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {images.map((imageUrl, imageIndex) => {
                  // Use preview if available, otherwise use the actual URL
                  const previewUrl =
                    itineraryImagePreviews?.[itinIndex]?.[imageIndex]
                  const displayUrl = previewUrl || imageUrl

                  return (
                    <div
                      key={imageIndex}
                      className='tour-form__image-preview'
                      style={{ position: 'relative', display: 'inline-block' }}
                    >
                      <img
                        src={displayUrl}
                        alt={`Itinerary ${itinIndex + 1} image ${
                          imageIndex + 1
                        }`}
                        className='tour-form__preview-img'
                        style={{
                          width: '120px',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />
                      <button
                        type='button'
                        onClick={() =>
                          handleRemoveItineraryImage(itinIndex, imageIndex)
                        }
                        style={{
                          position: 'absolute',
                          top: '4px',
                          right: '4px',
                          background: 'rgba(220, 53, 69, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 'bold',
                        }}
                        title='Remove image'
                      >
                        ×
                      </button>
                    </div>
                  )
                })}
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
