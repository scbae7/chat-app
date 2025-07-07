import React, { useEffect, useRef } from 'react';
import { FaSmile, FaImage } from 'react-icons/fa';

import styles from './ChatInput.module.css';

function ChatInput({
  newMessage,
  setNewMessage,
  onSend,
  onImageUpload,
  onEmojiClick,
  imagePreviewUrl,
  onCancelImage,
  imageError,
}) {
  const fileInputRef = useRef();

  // ESC 키 누르면 이미지 미리보기 취소
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && imagePreviewUrl) {
        onCancelImage();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [imagePreviewUrl, onCancelImage]);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
      e.target.value = null;
    }
  };

  return (
    <form onSubmit={onSend} className={styles.form}>
      <div
        className={`${styles.inputGroup} ${imagePreviewUrl ? styles.hidden : ''}`}
      >
        <button
          type="button"
          className={styles.iconButton}
          onClick={onEmojiClick}
          aria-label="이모지 선택"
        >
          <FaSmile />
        </button>

        <button
          type="button"
          className={styles.iconButton}
          onClick={handleImageButtonClick}
          aria-label="이미지 업로드"
        >
          <FaImage />
        </button>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className={styles.hiddenFileInput}
        />

        {!imagePreviewUrl && (
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요"
            className={styles.input}
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        )}
      </div>

      {imagePreviewUrl && (
        <div className={styles.previewBox}>
          <img
            src={imagePreviewUrl}
            alt="미리보기"
            className={styles.previewImage}
          />
          <button
            type="button"
            onClick={onCancelImage}
            className={styles.cancelPreviewBtn}
            aria-label="미리보기 취소"
          >
            X
          </button>
          <div className={styles.escInfo}>ESC 키를 눌러 취소할 수 있습니다</div>
        </div>
      )}

      {imageError && <div className={styles.errorMsg}>{imageError}</div>}

      <button
        type="submit"
        className={styles.button}
        disabled={
          (!newMessage.trim() && !imagePreviewUrl) ||
          (newMessage.trim() && imagePreviewUrl)
        }
      >
        보내기
      </button>
    </form>
  );
}

export default ChatInput;
