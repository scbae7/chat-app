import React, { useState } from 'react';

import { useUserStore } from '../../store/userStore';
import usePreviewImage from '../../hooks/usePreviewImage';

import { auth } from '../../firebase';
import { updateProfile } from 'firebase/auth';

import styles from './ProfileModal.module.css';
import { FaUserCircle, FaTimes } from 'react-icons/fa';
import { FiUploadCloud } from 'react-icons/fi';

import uploadToCloudinary from '../../utils/Cloudinary/uploadToCloudinary';

function ProfileModal({ onClose, onAvatarClick }) {
  const user = useUserStore((state) => state.user);
  const updateNickname = useUserStore((state) => state.updateNickname);

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState(user.displayName || '');
  const [photoFile, setPhotoFile] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  const originalNickname = user.displayName || '';

  const isSameNickname = nickname.trim() === originalNickname.trim();
  const isChanged = !isSameNickname || photoFile !== null;

  const { previewURL, error } = usePreviewImage(photoFile);

  const handleNicknameSave = async () => {
    if (!nickname.trim()) {
      setStatusMsg('닉네임을 입력하세요.');
      return;
    }
    try {
      await updateProfile(auth.currentUser, {
        displayName: nickname.trim(),
      });
      updateNickname(nickname.trim());
      setStatusMsg('닉네임이 성공적으로 변경되었습니다!');
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      setStatusMsg('변경 중 오류가 발생했습니다.');
    }
  };

  const updatePhotoURL = useUserStore((state) => state.updatePhotoURL);

  // 프로필 사진 선택 핸들러
  const handlePhotoChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setPhotoFile(e.target.files[0]);
    }
  };

  // 사진 업로드 후 profile 업데이트 함수
  const handleUploadAndSave = async () => {
    if (!nickname.trim()) {
      setStatusMsg('닉네임 입력하세요.');
      return;
    }

    setStatusMsg('업로드 중입니다...');

    try {
      let photoURL = user.photoURL;

      if (photoFile) {
        // Cloudinary 업로드 로직
        photoURL = await uploadToCloudinary(photoFile);
      }

      // 프로필 업데이트
      await updateProfile(auth.currentUser, {
        displayName: nickname.trim(),
        photoURL,
      });

      // zustand 상태 업데이트 함수
      updateNickname(nickname.trim());
      updatePhotoURL(photoURL);

      setStatusMsg('프로필이 성공적으로 변경되었습니다!');
      setIsEditing(false);
      setPhotoFile(null);
    } catch (error) {
      console.error(error);
      setStatusMsg('변경 중 오류가 발생했습니다.');
    }
  };

  if (!user) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes size={20} />
        </button>

        {previewURL ? (
          <img
            src={previewURL}
            alt="프로필 미리보기"
            className={styles.avatar}
          />
        ) : user.photoURL ? (
          <img
            src={user.photoURL}
            alt="기존 프로필"
            className={styles.avatar}
            onClick={onAvatarClick}
            style={{ cursor: 'pointer' }}
          />
        ) : (
          <FaUserCircle className={styles.avatarIcon} />
        )}

        {error && <p>{error}</p>}

        <p className={styles.email}>{user.email}</p>

        {isEditing ? (
          <>
            <div className={styles.editRow}>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className={styles.nicknameInput}
              />
              <div className={styles.buttonGroup}>
                <button
                  onClick={handleUploadAndSave}
                  className={styles.saveBtn}
                  disabled={!nickname.trim() || !isChanged || !!error}
                >
                  저장
                </button>
                <button
                  onClick={() => {
                    setNickname(originalNickname);
                    setIsEditing(false);
                    setStatusMsg('');
                  }}
                  className={styles.cancelBtn}
                >
                  취소
                </button>
              </div>
            </div>
            {statusMsg && <p className={styles.statusMsg}>{statusMsg}</p>}
          </>
        ) : (
          <>
            <p className={styles.nickname}>{user.displayName || '익명'}</p>
            <div className={styles.buttonGroup}>
              <button onClick={() => setIsEditing(true)}>
                프로필 사진 변경 / 닉네임 수정
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;
