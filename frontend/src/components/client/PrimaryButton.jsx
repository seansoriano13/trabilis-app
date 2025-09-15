function PrimaryButton({
    buttonText,
    isBold = false,
    className = '',
    icon = null,
    iconPosition = 'left',
    loading = false,
    ...rest
}) {
    return (
        <button
            className={`flex items-center justify-center gap-2 bg-[#f7d100] rounded-md px-4 py-2 
              text-center cursor-pointer transition hover:bg-[#ffe347] disabled:opacity-50 ${className}`}
            disabled={loading}
            {...rest}
        >
            {icon && iconPosition === 'left' && (
                <span className='flex items-center justify-center'>{icon}</span>
            )}

            {loading ? (
                isBold ? (
                    <b>Please Wait...</b>
                ) : (
                    'Please Wait...'
                )
            ) : isBold ? (
                <b>{buttonText}</b>
            ) : (
                buttonText
            )}

            {icon && iconPosition === 'right' && (
                <span className='flex items-center justify-center'>{icon}</span>
            )}
        </button>
    )
}

export default PrimaryButton
