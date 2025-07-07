import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import { useUserStore } from './store/userStore';

import AuthPage from './pages/AuthPage';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom/ChatRoom';

function App() {
  const [loading, setLoading] = useState(true);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <Routes>
      {/* 로그인 / 회원가입 */}
      <Route path="/" element={<AuthPage />} />

      {/* ✅ 로그인된 유저만 ChatRoom 접근 가능 */}
      <Route
        path="/chatList"
        element={
          !loading ? (
            user ? (
              <ChatList user={user} />
            ) : (
              <Navigate to="/" />
            )
          ) : null
        }
      />
      <Route
        path="/chat/:roomId"
        element={
          !loading ? (
            user ? (
              <ChatRoom user={user} />
            ) : (
              <Navigate to="/" />
            )
          ) : null
        }
      />

      {/* 유효하지 않은 경로일 경우 로그인으로 */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
