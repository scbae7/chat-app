// 1. React, React Router
import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

// 2. 외부 라이브러리
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
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
import { FaArrowAltCircleLeft } from 'react-icons/fa';

// 3. 상태관리(store)
import { useUserStore } from '../../store/userStore';

// 4. 커스텀 훅
import usePreviewImage from '../../hooks/usePreviewImage';

// 5. 유틸 함수
import uploadToCloudinary from '../../utils/Cloudinary/uploadToCloudinary';

// 6. 컴포넌트
import ProfileMenu from '../Common/ProfileMenu';
import ChatInput from './ChatInput';
import ProfileModal from '../Modal/ProfileModal';
import UserProfileModal from '../Modal/UserProfileModal';
import EmojiPickerModal from '../Common/EmojiPickerModal';
import ImageModal from '../Modal/ImageModal';

// 7. 스타일
import styles from './ChatRoom.module.css';

function ChatRoom() {
  // state: 사용자 정보
  const user = useUserStore((state) => state.user);

  // state: URL 파라미터(roomId)와 라우터 내비게이션
  const { roomId } = useParams();
  const navigate = useNavigate();

  // ref: 채팅 스크롤 끝 위치
  const chatEndRef = useRef();

  // state: 새 메시지 입력, 메시지 목록, 방 정보
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);

  // state: 프로필 모달 관련 상태
  const [showProfile, setShowProfile] = useState(false);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);

  // state: 이모지 모달 표시 여부
  const [showEmojiModal, setShowEmojiModal] = useState(false);

  // state: 이미지 모달 상태
  const [modalImage, setModalImage] = useState(null);

  // state: 이미지 미리보기 및 에러 상태
  const [selectedImage, setSelectedImage] = useState(null);
  const { previewURL: imagePreviewUrl, error: imageError } =
    usePreviewImage(selectedImage);

  // function: 프로필 모달 열기
  const openProfileModal = () => setShowProfile(true);

  // effect: 메시지 실시간 구독 및 업데이트
  useEffect(() => {
    if (!roomId) return;

    const q = query(
      collection(db, `rooms/${roomId}/messages`),
      orderBy('createAt'),
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = [];
      querySnapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() });
      });
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [roomId]);

  // effect: 마지막 읽은 시간 업데이트
  useEffect(() => {
    if (!user || !roomId) return;

    const updateLastRead = async () => {
      try {
        const lastReadRef = doc(db, 'rooms', roomId, 'lastReads', user.uid);
        await setDoc(
          lastReadRef,
          { lastRead: serverTimestamp() },
          { merge: true },
        );
      } catch (error) {
        console.error('lastRead 업데이트 실패:', error);
      }
    };

    updateLastRead();
  }, [roomId, user]);

  // effect: 채팅방 정보 조회
  useEffect(() => {
    if (!roomId) return;

    const roomRef = doc(db, 'rooms', roomId);

    const fetchRoomInfo = async () => {
      try {
        const docSnap = await getDoc(roomRef);
        if (docSnap.exists()) {
          setRoomInfo(docSnap.data());
        }
      } catch (error) {
        console.error('채팅방 정보 조회 실패:', error);
      }
    };

    fetchRoomInfo();
  }, [roomId]);

  // effect: 메시지 업데이트 시 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // event handler: 텍스트 메시지 전송 처리
  const sendMessage = async (e) => {
    e.preventDefault();

    const trimmed = newMessage.trim();

    if (!trimmed && !selectedImage) return;
    if (trimmed && selectedImage) return;

    try {
      const { uid, displayName, photoURL } = auth.currentUser;
      let imageUrl = null;

      if (selectedImage) {
        imageUrl = await uploadToCloudinary(selectedImage);
      }

      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: imageUrl ? '' : trimmed, // 이미지만 있으면 텍스트는 비워두기
        imageUrl: imageUrl || null,
        createAt: serverTimestamp(),
        uid,
        displayName: displayName || '익명',
        photoURL: photoURL || '/img/default-profile.png',
      });

      await updateDoc(doc(db, 'rooms', roomId), {
        lastMessage: trimmed || (imageUrl ? '사진' : ''),
        lastTimestamp: serverTimestamp(),
      });

      // 전송 후 초기화
      setNewMessage('');
      setSelectedImage(null);
    } catch (error) {
      console.error('메시지 전송 실패', error);
      alert('메시지 전송 중 문제가 발생했습니다.');
    }
  };

  // event handler: 이미지 업로드 핸들러
  const handleImageUpload = (file) => {
    setSelectedImage(file);
    setNewMessage('');
  };

  // function: 이미지 미리보기 리셋
  const resetImagePreview = () => {
    setSelectedImage(null);
  };

  // event handler: 이모지 클릭 처리
  const handleEmojiClick = (emoji) => {
    setNewMessage((prev) => prev + emoji);
  };

  // event handler: 이모지 모달 토글
  const toggleEmojiModal = () => {
    setShowEmojiModal((prev) => !prev);
  };

  // event handler: 로그아웃 처리
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error('로그아웃 실패:', error);
      alert('로그아웃 중 문제가 발생했습니다.');
    }
  };

  // event handler: 이전 페이지(채팅 목록)로 이동
  const handleBack = () => {
    navigate('/chatList');
  };

  // function: 메시지 렌더링 함수 분리 (가독성 향상)
  const renderMessage = (msg, index) => {
    const isMyMessage = msg.uid === user?.uid;

    // 이전 메시지와 발신자 비교
    const prevMsg = messages[index - 1];
    const isSameSenderAsPrev = prevMsg && prevMsg.uid === msg.uid;

    // 타임스탬프 표시 조건 (5분 이상 차이 시)
    const TIME_DIFF = 5 * 60 * 1000;
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
        {/* 연속 메시지가 아니고 내 메시지가 아닐 때 프로필 노출 */}
        {!isSameSenderAsPrev && !isMyMessage && (
          <img
            src={msg.photoURL || '/img/default-profile.png'}
            alt="프로필"
            className={styles.profileImgInMessage}
            onClick={() =>
              setSelectedUserInfo({
                displayName: msg.displayName,
                photoURL: msg.photoURL || '/img/default-profile.png',
                email: msg.email || '이메일 비공개',
              })
            }
          />
        )}

        <div className={styles.bubbleArea}>
          {/* 연속 메시지가 아니면 보낸 사람 이름 표시 */}
          {!isSameSenderAsPrev && (
            <div className={styles.senderName}>{msg.displayName || '익명'}</div>
          )}

          <div
            className={`${styles.messageBubble} ${
              isMyMessage ? styles.myBubble : styles.otherBubble
            } ${msg.text ? '' : styles.imageOnly}`}
          >
            {msg.text && <div>{msg.text}</div>}
            {msg.imageUrl && (
              <img
                src={msg.imageUrl}
                alt="전송된 이미지"
                className={styles.chatImage}
                onClick={() => setModalImage(msg.imageUrl)} // ✅ 클릭하면 확대 모달
                style={{ cursor: 'pointer' }}
              />
            )}
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
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        {user && (
          <>
            <div className={styles.leftSection}>
              <button
                onClick={handleBack}
                className={styles.backButton}
                aria-label="뒤로가기"
              >
                <FaArrowAltCircleLeft size={30} />
              </button>
            </div>

            <div className={styles.centerSection}>
              <div className={styles.roomTitle}>
                {roomInfo?.name || '채팅방'}
              </div>
            </div>

            <div className={styles.rightSection}>
              <ProfileMenu
                user={user}
                onLogout={handleLogout}
                onProfileClick={openProfileModal}
              />
            </div>

            {showProfile && (
              <ProfileModal
                user={user}
                onClose={() => setShowProfile(false)}
                onAvatarClick={() => setModalImage(user.photoURL)}
              />
            )}
          </>
        )}
      </header>

      <div className={styles.chatBox}>
        {messages.map(renderMessage)}

        <div ref={chatEndRef} />

        {/* 사용자 프로필 모달 */}
        {selectedUserInfo && (
          <UserProfileModal
            userInfo={selectedUserInfo}
            onClose={() => setSelectedUserInfo(null)}
            onAvatarClick={() => setModalImage(selectedUserInfo.photoURL)}
          />
        )}
      </div>

      {/* 입력 컴포넌트 */}
      <ChatInput
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        onSend={sendMessage}
        onImageUpload={handleImageUpload}
        onEmojiClick={toggleEmojiModal}
        imagePreviewUrl={imagePreviewUrl}
        onCancelImage={resetImagePreview}
        imageError={imageError}
      />

      {/* 이모지 선택 모달 */}
      {showEmojiModal && (
        <EmojiPickerModal
          onEmojiClick={handleEmojiClick}
          onClose={() => setShowEmojiModal(false)}
        />
      )}

      {/* 이미지 확대 모달 */}
      <ImageModal imageUrl={modalImage} onClose={() => setModalImage(null)} />
    </div>
  );
}

export default ChatRoom;
