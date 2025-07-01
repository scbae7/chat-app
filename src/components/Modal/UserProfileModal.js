import React from 'react';
import styles from './ProfileModal.module.css';
import { FaUserCircle, FaTimes } from 'react-icons/fa';

export default function UserProfileModal({ userInfo, onClose }) {
  if(!userInfo) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes size={20} />
        </button>
        {userInfo.photoURL ? (
          <img src={userInfo.photoURL} alt="프로필" className={styles.avatar} />
        ) : (
          <FaUserCircle className={styles.avatarIcon} />
        )}
        <p className={styles.nickname}>{userInfo.displayName || '익명'}</p>
        <p className={styles.email}>{userInfo.email || '이메일 비공개'}</p>
      </div>
    </div>
  )
}