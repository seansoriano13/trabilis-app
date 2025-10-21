import { useState } from 'react'
import { IoChevronUp, IoChevronDown } from 'react-icons/io5'

const FeeRulesSection = ({
  formData,
  updateFormData,
  addCustomFeeRule,
  updateCustomFeeRule,
  removeCustomFeeRule,
}) => {
  const [openGroups, setOpenGroups] = useState({ default: true })

  const toggleGroup = (key) => {
    setOpenGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className='tour-form__fee-rules'>
      {/* Default Fee Rules */}
      <div className='tour-form__fee-rule-card'>
        <div
          className='tour-form__fee-rule-header'
          onClick={() => toggleGroup('default')}
        >
          <h3 className='tour-form__fee-rule-title'>Default (All Dates)</h3>
          {openGroups['default'] ? <IoChevronUp /> : <IoChevronDown />}
        </div>
        {openGroups['default'] && (
          <div className='tour-form__fields tour-form__fields--grid'>
            <div className='tour-form__field-group'>
              <label className='tour-form__label'>
                Per Removed Group (PHP)
              </label>
              <input
                type='number'
                className='tour-form__input'
                min='0'
                value={formData.fee_rules?.perRemovedGroup || 0}
                onChange={(e) =>
                  updateFormData('fee_rules', {
                    ...formData.fee_rules,
                    perRemovedGroup: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='tour-form__field-group'>
              <label className='tour-form__label'>Per Rest Day (PHP)</label>
              <input
                type='number'
                className='tour-form__input'
                min='0'
                value={formData.fee_rules?.perRestDay || 0}
                onChange={(e) =>
                  updateFormData('fee_rules', {
                    ...formData.fee_rules,
                    perRestDay: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='tour-form__field-group'>
              <label className='tour-form__label'>Minimum Fee (PHP)</label>
              <input
                type='number'
                className='tour-form__input'
                min='0'
                value={formData.fee_rules?.minFee || 0}
                onChange={(e) =>
                  updateFormData('fee_rules', {
                    ...formData.fee_rules,
                    minFee: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className='tour-form__field-group'>
              <label className='tour-form__label'>Maximum Fee (PHP)</label>
              <input
                type='number'
                className='tour-form__input'
                min='0'
                value={formData.fee_rules?.maxFee || 0}
                onChange={(e) =>
                  updateFormData('fee_rules', {
                    ...formData.fee_rules,
                    maxFee: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom Fee Rules */}
      {formData.dates.length >= 2 &&
        formData.customFeeRules?.map((rule, idx) => (
          <div
            key={idx}
            className='tour-form__fee-rule-card'
          >
            <div
              className='tour-form__fee-rule-header'
              onClick={() => toggleGroup(idx)}
            >
              <h3 className='tour-form__fee-rule-title'>
                {rule.dateIndex !== undefined
                  ? `Date ${rule.dateIndex + 1}`
                  : 'Unassigned'}
              </h3>
              {openGroups[idx] ? <IoChevronUp /> : <IoChevronDown />}
            </div>
            {openGroups[idx] && (
              <div className='tour-form__fee-rule-body'>
                <div className='tour-form__fields tour-form__fields--grid'>
                  <div className='tour-form__field-group tour-form__field-group--full'>
                    <label className='tour-form__label'>Assign to Date</label>
                    <select
                      className='tour-form__select'
                      value={rule.dateIndex !== undefined ? rule.dateIndex : ''}
                      onChange={(e) =>
                        updateCustomFeeRule(
                          idx,
                          'dateIndex',
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    >
                      <option value=''>Select Date</option>
                      {formData.dates.map((d, i) => (
                        <option
                          key={i}
                          value={i}
                        >
                          Date {i + 1}: {d.start_date} - {d.end_date}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='tour-form__field-group'>
                    <label className='tour-form__label'>
                      Per Removed Group (PHP)
                    </label>
                    <input
                      type='number'
                      className='tour-form__input'
                      min='0'
                      value={rule.perRemovedGroup || 0}
                      onChange={(e) =>
                        updateCustomFeeRule(
                          idx,
                          'perRemovedGroup',
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className='tour-form__field-group'>
                    <label className='tour-form__label'>
                      Per Rest Day (PHP)
                    </label>
                    <input
                      type='number'
                      className='tour-form__input'
                      min='0'
                      value={rule.perRestDay || 0}
                      onChange={(e) =>
                        updateCustomFeeRule(
                          idx,
                          'perRestDay',
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className='tour-form__field-group'>
                    <label className='tour-form__label'>
                      Minimum Fee (PHP)
                    </label>
                    <input
                      type='number'
                      className='tour-form__input'
                      min='0'
                      value={rule.minFee || 0}
                      onChange={(e) =>
                        updateCustomFeeRule(
                          idx,
                          'minFee',
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className='tour-form__field-group'>
                    <label className='tour-form__label'>
                      Maximum Fee (PHP)
                    </label>
                    <input
                      type='number'
                      className='tour-form__input'
                      min='0'
                      value={rule.maxFee || 0}
                      onChange={(e) =>
                        updateCustomFeeRule(
                          idx,
                          'maxFee',
                          Number(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeCustomFeeRule(idx)}
                  className='tour-form__btn tour-form__btn--danger'
                >
                  Remove Fee Rule
                </button>
              </div>
            )}
          </div>
        ))}

      {formData.dates.length >= 2 && (
        <button
          onClick={addCustomFeeRule}
          className='tour-form__btn'
        >
          Add Custom Fee Rule
        </button>
      )}
    </div>
  )
}

export default FeeRulesSection

