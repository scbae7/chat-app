import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useUserStore } from '../store/userStore';
import Header from '../components/Header';
import ConfirmModal from '../components/Modal/ConfirmModal';
import { FaUserCircle } from 'react-icons/fa';
import styles from './UserList.module.css';
import { auth } from '../firebase';

function UserList() {
  const [users, setUsers] = useState([]);
  const [targetUser, setTargetUser] = useState(null);
  const currentUser = useUserStore((state) => state.user);
  const navigate = useNavigate();

  // 1. Firestore에서 사용자 리스트 가져오기
  useEffect(() => {
    const fetchUsers = async () => {
      const q = query(
        collection(db, 'users'),
        where('uid', '!=', currentUser.uid),
      );
      const snapshot = await getDocs(q);

      const userList = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          displayName: data.nickname || '익명', // nickname 통일
          photoURL: data.photoURL || null, // 없으면 null
        };
      });

      setUsers(userList);
    };

    fetchUsers();
  }, [currentUser]);

  // 2. 1:1 채팅 시작
  const startPrivateChat = async (otherUser) => {
    // 기존 1:1 채팅방 확인
    const q = query(
      collection(db, 'privateRooms'),
      where('members', 'array-contains', currentUser.uid),
    );
    const snapshot = await getDocs(q);

    const existingRoom = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .find((room) => room.members.includes(otherUser.uid));

    if (existingRoom) {
      // 이미 1:1 채팅방 있으면 이동
      navigate(`/dm/${existingRoom.id}`);
    } else {
      // 없으면 생성
      setTargetUser(otherUser);
    }
  };

  // 3. 1:1 채팅방 생성
  const handleConfirm = async () => {
    if (!targetUser) return;

    const roomRef = await addDoc(collection(db, 'privateRooms'), {
      members: [currentUser.uid, targetUser.uid],
      createdAt: new Date(),
      lastMessage: '',
      lastTimestamp: new Date(),
    });

    setTargetUser(null);
    navigate(`/dm/${roomRef.id}`);
  };

  const handleCancel = () => {
    setTargetUser(null);
  };

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  return (
    <div className={styles.container}>
      <Header user={currentUser} onLogout={handleLogout} />

      <ul className={styles.userList}>
        {users.map((user) => (
          <li
            key={user.uid}
            className={styles.userItem}
            onClick={() => startPrivateChat(user)}
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
              <span className={styles.userEmail}>{user.email}</span>
            </div>
          </li>
        ))}
      </ul>

      {targetUser && (
        <ConfirmModal
          message={`${targetUser.nickname}님과 새로운 1:1 채팅방을 생성하시겠습니까?`}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
}

export default UserList;
