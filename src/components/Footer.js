import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Footer.module.css';

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { name: '유저목록', path: '/userList' },
    { name: '1:1 채팅', path: '/privateChatList' },
    { name: '오픈채팅', path: '/chatList' },
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
