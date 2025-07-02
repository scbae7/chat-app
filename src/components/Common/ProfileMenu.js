import { useState, useRef, useEffect } from 'react';
import { FaUserCircle, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from './ProfileMenu.module.css';

function ProfileMenu({ user, onLogout, onProfileClick }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => setOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if(dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, []);

  return (
    <div className={styles.profile} onClick={toggleDropdown} ref={dropdownRef} tabIndex={0}>
      {user?.photoURL ? (
        <img src={user.photoURL} alt='프로필' className={styles.avatar} /> 
      ) : (
        <FaUserCircle className={styles.avatarIcon} />
      )}
      <span className={styles.displayName}>{user?.displayName || '익명'}</span>
      {open ? <FaChevronUp className={styles.caretIcon} /> : <FaChevronDown className={styles.caretIcon} />}
      {open && (
        <div className={styles.dropdown}>
          <button onClick={onProfileClick} className={styles.dropdownItem}>마이페이지</button>
          <button onClick={onLogout} className={styles.dropdownItem}>로그아웃</button>
        </div>
      )}
    </div>
  );
}

export default ProfileMenu;