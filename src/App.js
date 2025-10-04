import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';

import { useUserStore } from './store/userStore';

import AuthPage from './pages/AuthPage';
import PrivateChatList from './components/PrivateChatList';
import ChatList from './components/ChatList';
import ChatRoom from './components/ChatRoom/ChatRoom';
import UserList from './components/UserList';
import Footer from './components/Footer';

function App() {
  const [loading, setLoading] = useState(true);
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const showFooter = !loading && user;

  return (
    <div style={{ paddingBottom: showFooter ? '60px' : '0' }}>
      <Routes>
        {/* 로그인 / 회원가입 */}
        <Route
          path="/"
          element={
            !loading ? (
              user ? (
                <Navigate to="/userList" replace /> // 로그인 상태면 유저 리스트로 이동
              ) : (
                <AuthPage /> // 아니면 로그인 페이지
              )
            ) : null
          }
        />

        {/* ✅ 로그인된 유저만 ChatRoom 접근 가능 */}
        {/* <Route
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
      /> */}
        {/* ✅ 로그인 안한 유저도 접근 가능 */}
        <Route
          path="/userList"
          element={!loading ? <UserList user={user} /> : null}
        />
        <Route
          path="/privateChatList"
          element={!loading ? <PrivateChatList user={user} /> : null}
        />
        <Route
          path="/chatList"
          element={!loading ? <ChatList user={user} /> : null}
        />
        {/* 그룹 채팅 */}
        <Route
          path="/chat/:roomId"
          element={!loading ? <ChatRoom user={user} /> : null}
        />
        {/* 1:1 채팅 */}
        <Route
          path="/dm"
          element={!loading ? <ChatRoom user={user} /> : null}
        />
        <Route
          path="/dm/:roomId"
          element={!loading ? <ChatRoom user={user} /> : null}
        />

        {/* 유효하지 않은 경로일 경우 로그인으로 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      {showFooter && <Footer />}
    </div>
  );
}

export default App;
