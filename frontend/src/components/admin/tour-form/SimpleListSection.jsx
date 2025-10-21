const SimpleListSection = ({
  items,
  updateItem,
  addItem,
  removeItem,
  placeholder,
  label,
}) => {
  return (
    <div className='tour-form__simple-list'>
      {items.map((item, index) => (
        <div
          key={index}
          className='tour-form__simple-list-item'
        >
          <input
            type='text'
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            className='tour-form__input'
            placeholder={placeholder}
          />
          {items.length > 1 && (
            <button
              onClick={() => removeItem(index)}
              className='tour-form__btn-icon tour-form__btn-icon--danger'
              title={`Remove ${label}`}
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button
        onClick={addItem}
        className='tour-form__btn'
      >
        Add {label}
      </button>
    </div>
  )
}

export default SimpleListSection

