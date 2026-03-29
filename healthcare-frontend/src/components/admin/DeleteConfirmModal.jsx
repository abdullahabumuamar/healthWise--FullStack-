import styles from '../../assets/style/ManageUsers.module.css'

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, title = 'Delete Item', message = 'Are you sure you want to delete this item?' }) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.deleteModalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.deleteModalBody}>
          <h2 className={styles.deleteModalTitle}>{title}</h2>
          <p className={styles.deleteModalText}>
            {message}
          </p>
        </div>
        <div className={styles.deleteModalFooter}>
          <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={onClose}>
            Cancel
          </button>
          <button className={`${styles.modalButton} ${styles.modalButtonDanger}`} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

