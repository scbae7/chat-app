import styles from './ConfirmModal.module.css';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.message}>{message}</p>
        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={onCancel}>
            취소
          </button>
          <button className={styles.confirm} onClick={onConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
