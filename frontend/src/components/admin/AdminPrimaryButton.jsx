import styles from './AdminPrimaryButton.module.css'

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
            className={`${styles.button} ${className}`}
            disabled={loading}
            {...rest}
        >
            {icon && iconPosition === 'left' && (
                <span className={styles.icon}>{icon}</span>
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
                <span className={styles.icon}>{icon}</span>
            )}
        </button>
    )
}

export default PrimaryButton
