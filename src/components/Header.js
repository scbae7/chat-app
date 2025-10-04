import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import ProfileModal from './Modal/ProfileModal';
import ProfileMenu from './Common/ProfileMenu';
import ImageModal from './Modal/ImageModal';

import styles from './Header.module.css';
import { useUnreadStore } from '../store/unreadStore';

function Header({ user, onLogout, onSearch }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // state: 이미지 모달 상태
  const [modalImage, setModalImage] = useState(null);

  const dropdownRef = useRef(null);

  const unreadCount = useUnreadStore((state) => state.unreadCount);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutSide = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutSide);
    return () => document.removeEventListener('mousedown', handleClickOutSide);
  }, []);

  const handleLogoClick = () => {
    navigate('/userList');
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const openProfileModal = () => {
    setIsModalOpen(true);
    setDropdownOpen(false);
  };

  const closeProfileModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo} onClick={handleLogoClick}>
          ChatApp<span className={styles.dot}>.</span>
        </div>

        <div className={styles.searchWrapper}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="채팅방 또는 사용자 검색"
            className={styles.searchInput}
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        <div className={styles.rightMenu}>
          <button className={styles.iconButton} title="알림">
            <FaBell />
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
            <span className={styles.badge}>3</span>
          </button>

          <ProfileMenu
            user={user}
            onLogout={onLogout}
            onProfileClick={openProfileModal}
          />
        </div>
      </header>
      {isModalOpen && (
        <ProfileModal
          user={user}
          onClose={closeProfileModal}
          onAvatarClick={() => setModalImage(user.photoURL)}
        />
      )}

      {/* 이미지 확대 모달 */}
      <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
    </>
  );
}

export default Header;
