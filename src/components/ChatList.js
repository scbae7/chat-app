import { useState, useEffect } from 'react';

import { useUserStore } from '../store/userStore';

import { useNavigate } from 'react-router-dom';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot,
  getDoc,
  where,
  getDocs,
  doc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

import Header from './Header';
import styles from './ChatList.module.css';

function ChatList() {
  const user = useUserStore((state) => state.user);

  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState('');

  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(collection(db, 'rooms'), orderBy('createAt', 'desc'));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const roomsArr = [];
      const counts = {};

      await Promise.all(
        snapshot.docs.map(async (roomDoc) => {
          const roomId = roomDoc.id;
          const data = roomDoc.data();
          roomsArr.push({ id: roomId, ...data });

          // lastRead 불러오기
          const lastReadRef = doc(
            db,
            'rooms',
            roomId,
            'lastReads',
            auth.currentUser.uid,
          );
          const lastReadSnap = await getDoc(lastReadRef);

          let lastReadTime = null;
          if (lastReadSnap.exists()) {
            lastReadTime = lastReadSnap.data().lastRead;
          }

          // 메시지 중 lastRead 이후 생성된 메시지 수 조회
          let unreadQuery;
          if (lastReadTime) {
            unreadQuery = query(
              collection(db, 'rooms', roomId, 'messages', ''),
              where('createAt', '>', lastReadTime),
            );
          } else {
            unreadQuery = collection(db, 'rooms', roomId, 'messages', '');
          }

          const unreadSnap = await getDocs(unreadQuery);
          counts[roomId] = unreadSnap.size;
        }),
      );

      setRooms(roomsArr);
      setUnreadCounts(counts);
    });

    return () => unsubscribe();
  }, []);

  const createRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const docRef = await addDoc(collection(db, 'rooms'), {
        name: newRoomName.trim(),
        createAt: serverTimestamp(),
      });
      setNewRoomName('');
      navigate(`/chat/${docRef.id}`);
    } catch (error) {
      console.error('채팅방 생성 실패:', error);
    }
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  return (
    <div className={styles.container}>
      <Header user={user} onLogout={handleLogout} />

      <form onSubmit={createRoom} className={styles.form}>
        <input
          type="text"
          placeholder="새 채팅방 이름"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
          className={styles.input}
        />
        <button
          type="submit"
          className={styles.button}
          disabled={!newRoomName.trim()}
        >
          생성
        </button>
      </form>
      <ul className={styles.roomList}>
        {rooms.map((room) => (
          <li
            key={room.id}
            className={styles.roomItem}
            onClick={() => navigate(`/chat/${room.id}`)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                navigate(`/chat/${room.id}`);
              }
            }}
          >
            <div className={styles.roomName}>
              {room.name}
              {unreadCounts[room.id] > 0 && (
                <span className={styles.unreadBadge}>
                  {unreadCounts[room.id]}
                </span>
              )}
            </div>

            {room.lastMessage && (
              <div className={styles.lastMessage}>{room.lastMessage}</div>
            )}

            {room.lastTimestamp && (
              <div className={styles.time}>
                {new Date(room.lastTimestamp.toDate()).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ChatList;
