import { useState } from 'react';

import LoginForm from '../components/LoginForm';
import SignupForm from '../components/SignupForm';

import styles from '../styles/AuthPage.module.css';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [guestCredentials, setGuestCredentials] = useState(null);
  const navigate = useNavigate();

  const handleGuestAccess = () => {
    setIsLogin(true);
    setGuestCredentials({
      email: 'test01@naver.com',
      password: '11111111',
    });
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.left}>
        <h2>환영합니다!</h2>
        <p>{isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}</p>
        <button onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? '회원가입 하기' : '로그인 하기'}
        </button>

        <button onClick={handleGuestAccess}>Guest 접속하기</button>
      </div>
      <div className={styles.right}>
        {isLogin ? (
          <LoginForm
            switchToSignup={() => setIsLogin(false)}
            guestCredentials={guestCredentials}
          />
        ) : (
          <SignupForm switchToLogin={() => setIsLogin(true)} />
        )}
      </div>
    </div>
  );
}

export default AuthPage;
