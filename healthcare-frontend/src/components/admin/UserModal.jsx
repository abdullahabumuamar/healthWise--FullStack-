import PasswordInput from '../common/PasswordInput'
import styles from '../../assets/style/ManageUsers.module.css'

export default function UserModal({ isOpen, isEdit, formData, onClose, onSubmit, onInputChange }) {
  if (!isOpen) return null

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEdit ? 'Edit User' : 'Add New User'}</h2>
          <button className={styles.modalCloseButton} onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className={styles.formInput}
              placeholder="Enter email"
              value={formData.email}
              onChange={onInputChange}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="password">Password</label>
            <PasswordInput
              id="password"
              name="password"
              value={formData.password}
              onChange={onInputChange}
              placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formLabel} htmlFor="dob">Date of Birth</label>
            <input
              type="date"
              id="dob"
              name="dob"
              className={styles.formInput}
              value={formData.dob}
              onChange={onInputChange}
            />
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={`${styles.modalButton} ${styles.modalButtonCancel}`} onClick={onClose}>
            Cancel
          </button>
          <button className={`${styles.modalButton} ${styles.modalButtonPrimary}`} onClick={onSubmit}>
            {isEdit ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  )
}

