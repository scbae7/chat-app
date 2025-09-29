import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useUserStore } from '../store/userStore';
import Header from '../components/Header';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { FaUserCircle } from 'react-icons/fa';
import styles from './UserList.module.css';

function PrivateChatList() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);

  const currentUser = useUserStore((state) => state.user);
  const navigate = useNavigate();

  const [targetUser, setTargetUser] = useState(null);

  // 채팅 유저 분리
  const [chattedUsers, setChattedUsers] = useState([]);
  const [unchattedUsers, setUnchattedUsers] = useState([]);

  // 검색어 필터링
  const [searchTerm, setSearchTerm] = useState('');

  // 1. 모든 사용자 가져오기 (실시간)
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'users'),
      where('uid', '!=', currentUser.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          uid: data.uid,
          displayName: data.displayName || data.nickname || '익명',
          email: data.email || '',
          photoURL: data.photoURL || null,
        };
      });
      setUsers(userList);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 2. 현재 사용자가 참여 중인 채팅방 가져오기 (실시간)
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'privateRooms'),
      where('members', 'array-contains', currentUser.uid),
      orderBy('lastTimestamp', 'desc'),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomList);

      const chatted = roomList
        .filter((room) => room.lastMessage) // 메시지가 있을 때만
        .map((room) => {
          const otherUid = room.members.find((uid) => uid !== currentUser.uid);
          const userInfo = users.find((u) => u.uid === otherUid);
          return userInfo
            ? {
                ...userInfo,
                roomId: room.id,
                lastMessage: room.lastMessage,
                lastTimestamp: room.lastTimestamp,
                memberKey: [currentUser.uid, otherUid].sort().join('_'),
              }
            : null;
        })
        .filter(Boolean)
        // memberKey 기준 중복 제거
        .filter(
          (v, i, a) => a.findIndex((t) => t.memberKey === v.memberKey) === i,
        );
      setChattedUsers(chatted);
    });
    return () => unsubscribe();
  }, [currentUser, users]);

  // 3. 채팅 시작/이동
  const handleSelect = (user) => {
    if (user.roomId) {
      navigate(`/dm/${user.roomId}`);
    } else {
      setTargetUser(user);
    }
  };

  // 4. 새 채팅방 생성
  const handleConfirm = async () => {
    if (!targetUser) return;

    // 멤버 정렬 후 중복 방 체크
    const members = [currentUser.uid, targetUser.uid].sort();
    const existingRoom = rooms.find((room) => {
      const roomMembers = [...room.members].sort();
      return roomMembers[0] === members[0] && roomMembers[1] === members[1];
    });

    if (existingRoom) {
      // 이미 방이 있으면 해당 방으로 이동
      navigate(`/dm/${existingRoom.id}`);
    } else {
      // 새 방은 생성하지 않고, dm 페이지로 이동
      // URL에 상대 uid만 전달
      navigate(`/dm?uid=${targetUser.uid}`);
    }

    setTargetUser(null);
  };

  const handleCancel = () => {
    setTargetUser(null);
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  // 검색어 필터 적용
  const filteredUsers = chattedUsers.filter((user) =>
    user.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onSearch={(term) => setSearchTerm(term)}
      />

      {/* 채팅한 사용자 목록 */}
      <h3 className={styles.sectionTitle}>최근 대화</h3>
      <ul className={styles.userList}>
        {filteredUsers.map((user) => {
          const formattedTime = user.lastTimestamp
            ? user.lastTimestamp.toDate().toLocaleString('ko-KR', {
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric',
                hour12: true, // 오전/오후 표시 유지
              })
            : '';

          return (
            <li
              key={user.roomId} // room.id 로 키 고유하게
              className={`${styles.userItem} ${styles.chatted}`}
              onClick={() => handleSelect(user)}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="profile"
                  className={styles.profileImg}
                />
              ) : (
                <FaUserCircle className={styles.profileIcon} />
              )}
              <div className={styles.userInfo}>
                <span className={styles.userName}>{user.displayName}</span>
                <span className={styles.lastMessage}>
                  {user.lastMessage
                    ? user.lastMessage.length > 20
                      ? user.lastMessage.slice(0, 20) + '…'
                      : user.lastMessage
                    : '메시지가 없습니다'}
                </span>
              </div>
              {formattedTime && (
                <span className={styles.lastMessageTime}>{formattedTime}</span>
              )}
            </li>
          );
        })}
      </ul>

      {targetUser && (
        <ConfirmModal
          message={`${targetUser.displayName}님과 새로운 1:1 채팅방을 생성하시겠습니까?`}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default PrivateChatList;
