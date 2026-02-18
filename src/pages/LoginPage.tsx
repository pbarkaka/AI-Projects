import React, { useState } from 'react';
import {
  Brandvisual,
  Button,
  Input,
  Link,
  Password,
  Text,
} from '@momentum-design/components/react';
import './loginpage.css';

interface LoginPageProps {
  onSignIn?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onSignIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn?.();
  };

  return (
    <div className="login-page">
      <div className="login-page-background" />
      <div className="login-page-card-wrapper">
        <div className="login-page-card">
          <div className="login-page-logo">
            <Brandvisual name="webex-logo-lockup-dark-bw-gradient-horizontal" />
          </div>
          <Text type="heading-large-bold" tagname="h1" className="login-page-title">
            Sign in
          </Text>
          <Text type="body-midsize-regular" tagname="p" className="login-page-subtitle">
            Webex LIS and Intrado
          </Text>
          <form className="login-page-form" onSubmit={handleSubmit}>
            <div className="login-page-field">
              <Input
                label="Username"
                placeholder="Enter your username"
                value={username}
                onInput={(e: InputEvent & { target: { value: string } }) =>
                  setUsername(e.target?.value ?? '')
                }
                trailingButton={false}
                data-aria-label="Username"
              />
            </div>
            <div className="login-page-field">
              <Password
                label="Password"
                placeholder="Enter your password"
                value={password}
                onInput={(e: InputEvent & { target: { value: string } }) =>
                  setPassword(e.target?.value ?? '')
                }
                showHideButtonAriaLabel="Show or hide password"
                data-aria-label="Password"
              />
            </div>
            <div className="login-page-actions">
              <Button variant="primary" color="accent" type="submit" size={40}>
                Sign in
              </Button>
            </div>
            <div className="login-page-footer">
              <Link href="#" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
