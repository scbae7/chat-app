import React, { useState, useRef } from 'react';
import styles from './ChatRoom.module.css';
import { FaSmile, FaImage } from 'react-icons/fa';

function ChatInput({ newMessage, setNewMessage, onSend, onImageUpload, onEmojiClick }) {

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef();

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
      e.target.value = null; // 같은 파일 재선택 가능하게 초기화
    }
  }

  return (
    <form onSubmit={onSend} className={styles.form}>
      <div className={styles.inputGroup}>
        <button
          type='button'
          className={styles.iconButton}
          onClick={onEmojiClick}
          aria-label='이모지 선택'
        >
          <FaSmile />
        </button>

        <button
          type='button'
          className={styles.iconButton}
          onClick={handleImageButtonClick}
          aria-label='이미지 업로드'
        >
          <FaImage />
        </button>

        <input 
          type="file" 
          accept='image/*'
          ref={fileInputRef}
          onChange={handleFileChange}
          className={styles.hiddenFileInput}
        />

        <input 
          type='text'
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder='메시지를 입력하세요'
          className={styles.input}
          autoComplete='off'
          autoCorrect='off'
          spellCheck={false}
        />
      </div>

      <button
        type='submit'
        className={styles.button}
        disabled={!newMessage.trim()}
      >
        보내기
      </button>

    </form>
  )
};

export default ChatInput;