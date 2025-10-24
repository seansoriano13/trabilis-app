import Modal from 'react-modal'
import { IoIosClose } from 'react-icons/io'
import { FiPackage } from 'react-icons/fi'
import './BookingReferencesModal.css'

const BookingReferencesModal = ({
  isOpen,
  onClose,
  references,
  travelerName,
}) => {
  if (!references || references.length === 0) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      className='booking-references-modal'
      overlayClassName='booking-references-modal__overlay'
    >
      <div className='booking-references-modal__header'>
        <div className='booking-references-modal__header-content'>
          <FiPackage size={24} />
          <h2 className='booking-references-modal__title'>
            {travelerName}'s Bookings
          </h2>
        </div>
        <button
          className='booking-references-modal__close-btn'
          onClick={onClose}
          aria-label='Close'
        >
          <IoIosClose size={32} />
        </button>
      </div>

      <div className='booking-references-modal__content'>
        <p className='booking-references-modal__count'>
          Total: {references.length} booking{references.length > 1 ? 's' : ''}
        </p>
        <ul className='booking-references-modal__list'>
          {references.map((ref, index) => (
            <li
              key={index}
              className='booking-references-modal__item'
            >
              <span className='booking-references-modal__number'>
                {index + 1}.
              </span>
              <span className='booking-references-modal__reference'>{ref}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className='booking-references-modal__footer'>
        <button
          className='booking-references-modal__close-footer-btn'
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </Modal>
  )
}

export default BookingReferencesModal
