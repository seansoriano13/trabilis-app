import styles from './PrimaryButton.module.css'

function PrimaryButton({ buttonText, isBold = false, className = '', ...rest }) {
  return (
    <button className={`${styles.button} ${className}`} {...rest}>
      {isBold ? <b>{buttonText}</b> : buttonText}
    </button>
  );
}

export default PrimaryButton
