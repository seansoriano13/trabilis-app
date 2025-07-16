import styles from './PrimaryButton.module.css'

function PrimaryButton({
    buttonText,
    isBold = false,
    className = '',
    icon = null, 
    iconPosition = 'left', // 'left' or 'right'
    ...rest
}) {
    return (
        <button
            className={`${styles.button} ${className}`}
            {...rest}
        >
            {icon && iconPosition === 'left' && (
                <span className={styles.icon}>{icon}</span>
            )}

            {isBold ? <b>{buttonText}</b> : buttonText}

            {icon && iconPosition === 'right' && (
                <span className={styles.icon}>{icon}</span>
            )}
        </button>
    )
}

export default PrimaryButton
