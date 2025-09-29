import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useUserStore } from '../store/userStore';
import Header from '../components/Header';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { FaUserCircle } from 'react-icons/fa';
import styles from './UserList.module.css';

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [targetUser, setTargetUser] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');

  const currentUser = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // 1. 모든 사용자 가져오기
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'users'),
      where('uid', '!=', currentUser.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.data().uid,
        displayName: doc.data().displayName || doc.data().nickname || '익명',
        photoURL: doc.data().photoURL || null,
      }));

      // 가나다/영어/숫자 순 정렬
      userList.sort((a, b) => {
        const nameA = a.displayName[0];
        const nameB = b.displayName[0];

        const getType = (char) => {
          if (/[가-힣]/.test(char)) return 1; // 한글
          if (/[a-zA-Z]/.test(char)) return 2; // 영어
          if (/[0-9]/.test(char)) return 3; // 숫자
          return 4; // 기타
        };

        const typeA = getType(nameA);
        const typeB = getType(nameB);

        if (typeA !== typeB) return typeA - typeB;

        return a.displayName.localeCompare(b.displayName, 'ko');
      });

      setUsers(userList);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 2. 현재 사용자가 참여한 채팅방 가져오기
  useEffect(() => {
    if (!currentUser) return;
    const q = query(
      collection(db, 'privateRooms'),
      where('members', 'array-contains', currentUser.uid),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRooms(roomList);
    });
    return () => unsubscribe();
  }, [currentUser]);

  // 3. 채팅 버튼 클릭
  const handleSelect = (user) => {
    setTargetUser(user);
  };

  const handleConfirm = () => {
    if (!targetUser) return;

    const existingRoom = rooms.find(
      (room) =>
        room.members.includes(currentUser.uid) &&
        room.members.includes(targetUser.uid),
    );

    if (existingRoom) {
      // 이미 방 있으면 그 방으로 이동
      navigate(`/dm/${existingRoom.id}`);
    } else {
      // 방이 없으면 uid만 들고 dm페이지로 이동
      navigate(`/dm?uid=${targetUser.uid}`);
    }

    setTargetUser(null);
  };

  const handleCancel = () => setTargetUser(null);

  const handleLogout = () => {
    auth.signOut().then(() => navigate('/login'));
  };

  /// 4. 유저가 채팅한 적 있는지 체크
  const hasChatted = (user) => {
    if (!currentUser) return false;
    return rooms.some(
      (room) =>
        room.members.includes(user.uid) &&
        room.members.includes(currentUser.uid),
    );
  };

  //  5. 검색어 필터 적용
  const filteredUsers = users.filter((u) =>
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <Header
        user={currentUser}
        onLogout={handleLogout}
        onSearch={(term) => setSearchTerm(term)}
      />

      <h3 className={styles.sectionTitle}>유저 목록</h3>
      <ul className={styles.userList}>
        {filteredUsers.map((user) => (
          <li key={user.uid} className={styles.userItem}>
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
              {hasChatted(user) && (
                <span className={styles.chattedLabel}>💬 채팅함</span>
              )}
            </div>
            <button
              className={styles.chatBtn}
              onClick={() => handleSelect(user)}
            >
              1:1 채팅
            </button>
          </li>
        ))}
      </ul>

      {targetUser && (
        <ConfirmModal
          message={`${targetUser.displayName}님과 1:1 채팅을 시작하시겠습니까?`}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}
