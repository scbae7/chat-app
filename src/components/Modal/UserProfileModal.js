import React from 'react';
import styles from './ProfileModal.module.css';
import { FaUserCircle, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../../store/userStore';
import { goToDM } from '../../utils/chat2';

export default function UserProfileModal({
  userInfo,
  onClose,
  onAvatarClick,
  isPrivateRoom = false,
  rooms = [],
}) {
  const navigate = useNavigate();
  const currentUser = useUserStore((state) => state.user);

  if (!userInfo) return null;

  const handleStartDM = async () => {
    if (!currentUser || !userInfo) return;

    await goToDM({
      navigate,
      currentUserUid: currentUser.uid,
      targetUserUid: userInfo.uid,
      rooms, // 방 리스트를 전달하면 우선 검색
    });

    onClose();
  };
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes size={20} />
        </button>
        {userInfo.photoURL ? (
          <img
            src={userInfo.photoURL}
            alt="프로필"
            className={styles.avatar}
            onClick={onAvatarClick}
          />
        ) : (
          <FaUserCircle className={styles.avatarIcon} />
        )}
        <p className={styles.nickname}>{userInfo.displayName || '익명'}</p>

        {/* 오픈채팅이 아닐 때만 DM 시작 버튼 */}
        {!isPrivateRoom && currentUser.uid !== userInfo.uid && (
          <button className={styles.dmButton} onClick={handleStartDM}>
            1:1 채팅 시작
          </button>
        )}
      </div>
    </div>
  );
}
