import axios from 'axios';

const uploadToCloudinary = async (file) => {
  const url = process.env.REACT_APP_CLOUDINARY_URL;
  const preset = process.env.REACT_APP_CLOUDINARY_PRESET;
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', preset);

  try {
    console.log(file);
    const response = await axios.post(url, formData);
    return response.data.secure_url;

  } catch (error) {
    console.error("Cloudinary 업로드 실패:", error);
    throw new Error('Cloudinary 업로드 실패');
  }
};

export default uploadToCloudinary;