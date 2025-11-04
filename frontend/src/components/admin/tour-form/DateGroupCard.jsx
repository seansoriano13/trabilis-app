import { useState } from 'react'
import { IoChevronUp, IoChevronDown } from 'react-icons/io5'

const DateGroupCard = ({
  index,
  dateGroup,
  updateDateGroup,
  removeDateGroup,
  isEditMode,
}) => {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className='tour-form__date-card'>
      <div
        className='tour-form__date-card-header'
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className='tour-form__date-card-title'>Date Group {index + 1}</h3>
        {isOpen ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
      </div>
      {isOpen && (
        <div className='tour-form__date-card-body'>
          <div className='tour-form__fields tour-form__fields--grid'>
            <div className='tour-form__field-group'>
              <label className='tour-form__label'>
                Start Date <span className='tour-form__required'>*</span>
              </label>
              <input
                type='date'
                value={dateGroup.start_date}
                onChange={(e) =>
                  updateDateGroup(index, 'start_date', e.target.value)
                }
                className='tour-form__input'
              />
            </div>

            <div className='tour-form__field-group'>
              <label className='tour-form__label'>
                End Date <span className='tour-form__required'>*</span>
              </label>
              <input
                type='date'
                value={dateGroup.end_date}
                onChange={(e) =>
                  updateDateGroup(index, 'end_date', e.target.value)
                }
                className='tour-form__input'
              />
            </div>

            <div className='tour-form__field-group'>
              <label className='tour-form__label'>
                Rate per Pax (PHP){' '}
                <span className='tour-form__required'>*</span>
              </label>
              <input
                type='number'
                value={dateGroup.rate_per_pax}
                onChange={(e) =>
                  updateDateGroup(index, 'rate_per_pax', Number(e.target.value))
                }
                className='tour-form__input'
                min='0'
              />
            </div>

            <div className='tour-form__field-group'>
              <label className='tour-form__label'>
                Reservation Fee per Pax (PHP){' '}
                <span className='tour-form__required'>*</span>
              </label>
              <input
                type='number'
                value={dateGroup.reservation_fee_per_pax}
                onChange={(e) =>
                  updateDateGroup(
                    index,
                    'reservation_fee_per_pax',
                    Number(e.target.value)
                  )
                }
                className='tour-form__input'
                min='0'
              />
            </div>

            <div className='tour-form__field-group'>
              <label className='tour-form__label'>
                Total Slots{' '}
                {!dateGroup.id ? (
                  <span className='tour-form__required'>*</span>
                ) : (
                  ''
                )}
              </label>
              <input
                type='number'
                value={dateGroup.total_slots}
                onChange={
                  !dateGroup.id
                    ? (e) => {
                        const slots = Number(e.target.value)
                        updateDateGroup(index, 'total_slots', slots)
                        updateDateGroup(index, 'available_slots', slots)
                      }
                    : undefined
                }
                className={`tour-form__input ${
                  dateGroup.id ? 'tour-form__input--readonly' : ''
                }`}
                readOnly={!!dateGroup.id}
                disabled={!!dateGroup.id}
                min='1'
              />
              <small className='tour-form__help-text'>
                {dateGroup.id
                  ? 'Total slots cannot be changed for existing date groups.'
                  : 'Set the total number of slots available.'}
              </small>
            </div>

            <div className='tour-form__field-group'>
              <label className='tour-form__label'>Available Slots</label>
              <input
                type='number'
                value={dateGroup.available_slots}
                className='tour-form__input tour-form__input--readonly'
                readOnly
                disabled
              />
              <small className='tour-form__help-text'>
                Available slots are automatically calculated.
              </small>
            </div>
          </div>

          {index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeDateGroup(index)
              }}
              className='tour-form__btn tour-form__btn--danger'
            >
              Remove Date Group
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default DateGroupCard
