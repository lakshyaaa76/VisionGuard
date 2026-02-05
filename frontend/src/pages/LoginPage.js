import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import './LoginPage.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await authService.login(email, password);
      const user = authService.getCurrentUser();
      if (user) {
        switch (user.role) {
          case 'CANDIDATE':
            navigate('/dashboard');
            break;
          case 'PROCTOR':
            navigate('/proctor/dashboard');
            break;
          case 'ADMIN':
            navigate('/admin/dashboard');
            break;
          default:
            navigate('/login');
        }
      } else {
        setError('Could not verify user role.');
      }
    } catch (err) {
      setError('Invalid credentials');
      console.error(err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <Card>
          <form className="login-form" onSubmit={onSubmit}>
            <div className="login-brand">
              <div className="login-brand-name">Invigilo</div>
              <div className="login-brand-subtitle">Secure online proctoring</div>
            </div>
            <h1 className="login-title">System Login</h1>
            {error && <p className="error-message">{error}</p>}
            <div className="form-group">
              <Input
                type="email"
                placeholder="Email Address"
                name="email"
                value={email}
                onChange={onChange}
                required
              />
            </div>
            <div className="form-group">
              <Input
                type="password"
                placeholder="Password"
                name="password"
                value={password}
                onChange={onChange}
                required
              />
            </div>
            <Button type="submit" variant="primary">Login</Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
