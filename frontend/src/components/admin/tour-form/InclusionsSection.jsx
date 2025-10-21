const InclusionsSection = ({
  formData,
  setFormData,
  addInclusionGroupForDate,
  duplicateInclusionGroup,
  updateInclusionGroup,
  removeInclusionGroup,
  addInclusionGroupItem,
  duplicateInclusionItem,
  updateInclusionGroupItem,
  removeInclusionGroupItem,
  categoryOptions,
}) => {
  return (
    <div className='tour-form__inclusions'>
      {formData.dates.map((dateGroup, dIdx) => (
        <div
          key={dIdx}
          className='tour-form__inclusion-date-group'
        >
          <div className='tour-form__inclusion-date-header'>
            <h3 className='tour-form__inclusion-date-title'>Date {dIdx + 1}</h3>
            {dIdx > 0 && dateGroup.inclusion_groups?.length === 0 && (
              <span className='tour-form__badge tour-form__badge--default'>
                Using Default Inclusions
              </span>
            )}
            {dIdx > 0 && dateGroup.inclusion_groups?.length > 0 && (
              <span className='tour-form__badge tour-form__badge--custom'>
                Custom Inclusions
              </span>
            )}
          </div>

          <div className='tour-form__inclusion-groups'>
            {(dateGroup.inclusion_groups || []).map((group, gIdx) => (
              <div
                key={gIdx}
                className='tour-form__inclusion-group-card'
              >
                <div className='tour-form__field-group'>
                  <label className='tour-form__label'>Group Title</label>
                  <select
                    className='tour-form__select'
                    value={group.category || 'Custom…'}
                    onChange={(e) =>
                      updateInclusionGroup(
                        dIdx,
                        gIdx,
                        'category',
                        e.target.value
                      )
                    }
                  >
                    {categoryOptions.map((opt) => (
                      <option
                        key={opt}
                        value={opt}
                      >
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                {group.category === 'Custom…' && (
                  <div className='tour-form__field-group'>
                    <label className='tour-form__label'>
                      Custom Group Title
                    </label>
                    <input
                      type='text'
                      className='tour-form__input'
                      value={group.title || ''}
                      onChange={(e) =>
                        updateInclusionGroup(
                          dIdx,
                          gIdx,
                          'title',
                          e.target.value
                        )
                      }
                    />
                  </div>
                )}
                <div className='tour-form__field-group'>
                  <label className='tour-form__label'>Removable?</label>
                  <select
                    className='tour-form__select'
                    value={group.removable ? 'yes' : 'no'}
                    onChange={(e) =>
                      updateInclusionGroup(
                        dIdx,
                        gIdx,
                        'removable',
                        e.target.value === 'yes'
                      )
                    }
                  >
                    <option value='yes'>Yes</option>
                    <option value='no'>No (Required)</option>
                  </select>
                </div>
                <div className='tour-form__field-group tour-form__field-group--full'>
                  <label className='tour-form__label'>Items</label>
                  {(group.items || []).map((item, iIdx) => (
                    <div
                      key={iIdx}
                      className='tour-form__inclusion-item'
                    >
                      <input
                        type='text'
                        className='tour-form__input'
                        value={item}
                        onChange={(e) =>
                          updateInclusionGroupItem(
                            dIdx,
                            gIdx,
                            iIdx,
                            e.target.value
                          )
                        }
                        placeholder='e.g., Roundtrip international airfare on economy class'
                      />
                      {(group.items || []).length > 1 && (
                        <div className='tour-form__inclusion-item-actions'>
                          <button
                            onClick={() =>
                              duplicateInclusionItem(dIdx, gIdx, iIdx)
                            }
                            className='tour-form__btn-icon'
                            title='Duplicate'
                          >
                            Dup
                          </button>
                          <button
                            onClick={() =>
                              removeInclusionGroupItem(dIdx, gIdx, iIdx)
                            }
                            className='tour-form__btn-icon tour-form__btn-icon--danger'
                            title='Remove'
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addInclusionGroupItem(dIdx, gIdx)}
                    className='tour-form__btn tour-form__btn--small'
                  >
                    Add Item
                  </button>
                </div>
                <div className='tour-form__inclusion-group-actions'>
                  <button
                    onClick={() => duplicateInclusionGroup(dIdx, gIdx)}
                    className='tour-form__btn tour-form__btn--small'
                  >
                    Duplicate Group
                  </button>
                  <button
                    onClick={() => removeInclusionGroup(dIdx, gIdx)}
                    className='tour-form__btn tour-form__btn--small tour-form__btn--danger'
                  >
                    Remove Group
                  </button>
                </div>
              </div>
            ))}

            {dIdx > 0 &&
              dateGroup.inclusion_groups?.length === 0 &&
              formData.dates[0]?.inclusion_groups?.length > 0 && (
                <button
                  onClick={() => {
                    const newDates = [...formData.dates]
                    const firstDateGroups = newDates[0]?.inclusion_groups || []
                    newDates[dIdx] = {
                      ...newDates[dIdx],
                      inclusion_groups: JSON.parse(
                        JSON.stringify(firstDateGroups)
                      ),
                    }
                    setFormData((prev) => ({ ...prev, dates: newDates }))
                  }}
                  className='tour-form__btn tour-form__btn--secondary'
                >
                  Use Date 1 Template
                </button>
              )}

            <button
              onClick={() => addInclusionGroupForDate(dIdx)}
              className='tour-form__btn'
            >
              Add Inclusion Group
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default InclusionsSection

