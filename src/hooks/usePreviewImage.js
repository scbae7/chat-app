import { all } from 'axios';
import { useEffect, useState } from 'react';

const usePreviewImage = (file) => {
  const [previewURL, setPreviewURL] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!file) {
      setPreviewURL(null);
      setError('');
      return;
    }

    const allowTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowTypes.includes(file.type)) {
      setError('jpg 또는 png 형식의 이미지만 업로드 가능합니다.');
      setPreviewURL(null);
      return;
    }

    const objectURL = URL.createObjectURL(file);
    setPreviewURL(objectURL);
    setError('');

    return () => {
      URL.revokeObjectURL(objectURL);
    };
  }, [file]);

  return { previewURL, error };
};

export default usePreviewImage;
