export const reactSelectStyles = () => {
    const primary = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-yellow')
        .trim()

    return {
        input: (provided) => ({
            ...provided,
            color: '#ffffff',
        }),
        control: (base) => ({
            ...base,
            border: 'none',
            boxShadow: 'none',
            background: 'none',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#FFFFFF80',
        }),
        singleValue: (base) => ({
            ...base,
            color: 'white',
            opacity: '.9',
            whiteSpace: 'normal',
        }),
        menu: (base) => ({
            ...base,
            position: 'absolute',
            top: '30px',
            borderRadius: '10px',
            background: 'rgba(190, 190, 190, 0.1)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            opacity: 0,
            transform: 'translateY(-5px)',
            animation: 'fadeSlideIn 0.2s ease forwards',
        }),
        option: (base, state) => ({
            ...base,
            borderRadius: '10px',
            backgroundColor: state.isSelected
                ? primary
                : state.isFocused
                ? '#2a2a2a40'
                : 'transparent',
            color: state.isSelected ? '#000' : '#fff',
            cursor: 'pointer',
            ':active': {
                backgroundColor: state.isSelected ? primary : '#2a2a2a',
            },
        }),
        menuList: (base) => ({
            ...base,
            padding: '0',
        }),
        indicatorSeparator: () => ({
            opacity: '1',
        }),
    }
}

export const flightNavInputStyles = {
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isSelected
            ? 'var(--color-yellow)'
            : 'transparent',
        color: state.isSelected ? 'black' : 'inherit',
        textAlign: 'center',
    }),
    control: (base) => ({
        ...base,
        padding: '0 2rem',
        backgroundColor: 'var(--color-yellow)',
        border: 'none',
        cursor: 'pointer',
        color: 'black',
        textAlign: 'center',
        boxShadow: 'var(--box-shadow)',
    }),
    menu: (base) => ({
        ...base,
        position: 'absolute',
        top: '40px',
        borderRadius: '10px',
        background: 'rgba(190, 190, 190, 0.1)',
        backdropFilter: 'blur(4px)',
        border: 'none',
        opacity: 0,
        transform: 'translateY(-5px)',
        animation: 'fadeSlideIn 0.2s ease forwards',
    }),
    valueContainer: (base) => ({
        ...base,
        justifyContent: 'center',
        padding: 0,
    }),
    singleValue: (base) => ({
        ...base,
        color: 'black',
        textAlign: 'center',
        whiteSpace: 'normal',
    }),
    placeholder: (base) => ({
        ...base,
        color: 'black',
        textAlign: 'center',
    }),
    input: (base) => ({
        ...base,
        color: 'black',
        textAlign: 'center',
    }),
    indicatorsContainer: () => ({
        display: 'none',
    }),
}
