import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: '채팅', path: '/chatList' },
    { name: '유저', path: '/userList' },
    { name: '프로필', path: '/profile' },
  ];

  return (
    <footer className={styles.footer}>
      {tabs.map((tab) => (
        <button
          key={tab.path}
          className={`${styles.tabButton} ${
            location.pathname === tab.path ? styles.active : ''
          }`}
          onClick={() => navigate(tab.path)}
        >
          {tab.name}
        </button>
      ))}
    </footer>
  );
}
