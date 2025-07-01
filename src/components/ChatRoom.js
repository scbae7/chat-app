import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useUserStore } from '../store/userStore';

import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';

import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

import ProfileModal from './Modal/ProfileModal';

import { FaArrowAltCircleLeft } from 'react-icons/fa';

import styles from './ChatRoom.module.css';
import UserProfileModal from './Modal/UserProfileModal';


function ChatRoom() {
  
  const user = useUserStore((state) => state.user);

  const { roomId } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef();

  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);

  const [showProfile, setShowProfile] = useState(false);

  const [selectedUserInfo, setSelectedUserInfo] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    const q = query(collection(db, `rooms/${roomId}/messages`), orderBy('createAt'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [roomId]);

  useEffect(() => {
    const updateLastRead = async () => {
      if (user && roomId) {
        try {
          const lastReadRef = doc(db, 'rooms', roomId, 'lastReads', user.uid);
          await setDoc(
            lastReadRef,
            { lastRead: serverTimestamp() },
            { merge: true }
          );
        } catch (error) {
          console.error('lastRead 업데이트 실패:', error);
        }
      }
    };

    updateLastRead();
  }, [roomId, user]);

  useEffect(() => {
    if (!roomId) return;
    const roomRef = doc(db, 'rooms', roomId);
    getDoc(roomRef).then(docSnap => {
      if (docSnap.exists()) {
        setRoomInfo(docSnap.data());
      }
    });
  }, [roomId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const trimmed = newMessage.trim();
    if (!trimmed) return;

    try {
      const { uid, displayName, photoURL } = auth.currentUser;

      // 메시지 추가
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: trimmed,
        createAt: serverTimestamp(),
        uid,
        displayName: displayName || '익명',
        photoURL: photoURL || '/img/default-profile.png',
      });

      // 방 정보 업데이트 (마지막 메시지/시간)
      await updateDoc(doc(db, 'rooms', roomId), {
        lastMessage: trimmed,
        lastTimestamp: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패', error);
      alert('메시지 전송 중 문제가 발생했습니다.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const handleBack = () => {
    navigate('/chatList');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {user && (
          <>
            <div className={styles.leftSection}>
              <button onClick={handleBack} className={styles.backButton}>
                <FaArrowAltCircleLeft size={30} />
              </button>
              <div className={styles.roomTitle}>{roomInfo?.name || '채팅방'}</div>
            </div>

            <div className={styles.rightSection}>
              <img
                src={user.photoURL || '/img/default-profile.png'}
                alt="프로필"
                className={styles.profileImg}
                onClick={() => setShowProfile(true)}
              />
              <span className={styles.displayName}>{user.displayName || '익명'}</span>
              <button onClick={handleLogout} className={styles.logoutButton}>로그아웃</button>
            </div>

            {showProfile && <ProfileModal user={user} onClose={() => setShowProfile(false)} />}
          </>
        )}
      </header>

      <div className={styles.chatBox}>
        {messages.map((msg, index) => {
          const isMyMessage = msg.uid === user?.uid;

          // 이전 메시지와 비교
          const prevMsg = messages[index - 1];
          const isSameSenderAsPrev = prevMsg && prevMsg.uid === msg.uid;

          // 타임스탬프 비교
          const TIME_DIFF = 5 * 60 * 1000; // 5분
          let showTimestamp = true;

          if (prevMsg && msg.createAt && prevMsg.createAt) {
            const currTime = msg.createAt.toDate();
            const prevTime = prevMsg.createAt.toDate();
            const diff = currTime - prevTime;
            if (diff < TIME_DIFF) {
              showTimestamp = false;
            }
          }

          return (
            <div
              key={msg.id}
              className={`${styles.messageWrapper} ${
                isMyMessage ? styles.myWrapper : styles.otherWrapper
              }`}
            >
              {/* 연속 메시지 아니면 프로필 노출 */}
              {!isSameSenderAsPrev && !isMyMessage && (
                <img
                  src={msg.photoURL || '/img/default-profile.png'}
                  alt="프로필"
                  className={styles.profileImgInMessage}
                  onClick={() => setSelectedUserInfo({
                    displayName: msg.displayName,
                    photoURL: msg.photoURL || '/img/default-profile.png',
                    email: msg.email || '이메일 비공개',
                  })}
                />
              )}
              <div className={styles.bubbleArea}>
                {/* 연속 메시지 아니면 보낸 사람 이름 표시 */}
                {!isSameSenderAsPrev && (
                  <div className={styles.senderName}>{msg.displayName || '익명'}</div>
                )}
                <div
                  className={`${styles.messageBubble} ${
                    isMyMessage ? styles.myBubble : styles.otherBubble
                  }`}
                >
                  {msg.text}
                </div>
                {/* 타임스탬프는 5분 이상 차이 있을 때만 표시 */}
                {showTimestamp && (
                  <div className={styles.timestamp}>
                    {msg.createAt?.toDate().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={chatEndRef} />
        {selectedUserInfo && (
          <UserProfileModal 
            userInfo={selectedUserInfo}
            onClose={() => setSelectedUserInfo(null)}
          />
        )}
      </div>

      <form onSubmit={sendMessage} className={styles.form}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          className={styles.input}
        />
        <button type="submit" className={styles.button} disabled={!newMessage.trim()}>
          보내기
        </button>
      </form>
    </div>
  );
}

export default ChatRoom;
