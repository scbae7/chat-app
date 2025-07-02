import React, { useState, useRef, useEffect } from 'react';
import { FaBell, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import ProfileModal from './Modal/ProfileModal';
import ProfileMenu from './Common/ProfileMenu';

import styles from './Header.module.css';

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutSide = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutSide);
    return () => document.removeEventListener('mousedown', handleClickOutSide);
  }, []);

  const handleLogoClick = () => {
    navigate('/chatList');
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
            // 검색 기능 추가 시 onChange 등 이벤트 핸들러 추가
          />
        </div>

        <div className={styles.rightMenu}>
          <button className={styles.iconButton} title="알림">
            <FaBell />
            {/* <span className={styles.badge}>3</span> */}
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
        />
      )}
    </>
    
  );
}

export default Header;