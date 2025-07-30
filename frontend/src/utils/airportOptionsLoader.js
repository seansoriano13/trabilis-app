

export const filterOptions = (inputValue, options) =>
    options.filter((a) =>
        a.label.toLowerCase().includes(inputValue.toLowerCase())
    )

export const loadOptions = (options, defaultAirportOptionsData) => {
    const defaultOptions = options.filter((option) =>
        defaultAirportOptionsData.includes(option.value)
    )

    const asyncLoader = (inputValue, callback) => {
        if (inputValue.length < 3) {
            callback([])
            return
        }

        setTimeout(() => {
            callback(filterOptions(inputValue, options))
        }, 1000)
    }

    return { asyncLoader, defaultOptions }
}
