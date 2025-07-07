import React from 'react';
import { FaTimes } from 'react-icons/fa';
import styles from './ImageModal.module.css';

export default function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <img src={imageUrl} alt="확대 이미지" className={styles.modalImage} />
      </div>
    </div>
  );
}
