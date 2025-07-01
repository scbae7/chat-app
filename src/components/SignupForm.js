import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';

import { FiEye, FiEyeOff } from 'react-icons/fi';
import styles from "../styles/Login.module.css";


function SignupForm({ switchToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async (e) => {

    e.preventDefault();
    setError('');
    setLoading(true);

    try {

      // 1. 이메일/비밀번호로 계정 생성
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. 생성된 사용자에 닉네임 설정 ( Firebase Auth의 displayName )
      await updateProfile(user, {
        displayName: nickname,
      });

      // 3. Firestore에 사용자 정보 저장
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        nickname: nickname,
        createdAt: new Date()
      });

      alert("회원가입 성공!");
      navigate('/login');

    } catch (error) {

      setError('회원가입 실패: ' + error.message);
      console.error(error);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSignup} className={styles.form}>
        <h2>회원가입</h2>

        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          className={styles.input}
        />

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={styles.input}
        />

        <div className={styles.passwordWrapper}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          <span
            className={styles.toggle}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button type="submit" className={styles.button} disabled={loading}>
          {loading ? '가입 중...' : '회원가입'}
        </button>

        <p className={styles.linkText}>
          이미 계정이 있으신가요?{' '}
          <span className={styles.link} onClick={switchToLogin}>
            로그인
          </span>
        </p>
      </form>
    </div>
  );
}

export default SignupForm;
