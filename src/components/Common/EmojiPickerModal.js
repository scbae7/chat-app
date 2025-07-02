import React from 'react';
import EmojiPicker from 'emoji-picker-react';
import styles from './EmojiPickerModal.module.css';


function EmojiPickerModal({ onEmojiClick, onClose}) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <EmojiPicker  onEmojiClick={(emojiData) => {
          onEmojiClick(emojiData.emoji);
          onClose();
        }} />
      </div>
    </div>
  )
}

export default EmojiPickerModal;