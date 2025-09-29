import { useEffect, useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

import { useUserStore } from '../store/userStore';

import { FiEye, FiEyeOff } from 'react-icons/fi';

import styles from '../styles/Login.module.css';

function LoginForm({ switchToSignup, guestCredentials }) {
  const setUser = useUserStore((state) => state.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 보기
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // 페이지 이동용

  useEffect(() => {
    if (guestCredentials) {
      setEmail(guestCredentials.email);
      setPassword(guestCredentials.password);
    }
  }, [guestCredentials]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);

      const user = auth.currentUser;

      if (user) {
        setUser(user);
        console.log('로그인한 유저 닉네임:', user.displayName);
        // alert(`환영합니다. ${user.displayName || '익명'}님!`);
      }

      navigate('/userList'); // ✅ 로그인 성공 시 채팅방으로 이동
    } catch (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleLogin} className={styles.form}>
        <h2>로그인</h2>

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
          {loading ? '로그인 중...' : '로그인'}
        </button>

        <p className={styles.linkText}>
          계정이 없으신가요?{' '}
          <span className={styles.link} onClick={switchToSignup}>
            회원가입
          </span>
        </p>
      </form>
    </div>
  );
}

export default LoginForm;
