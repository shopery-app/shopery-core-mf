import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { apiURL } from '../../Backend/Api/api';
import './AdminLogin.css';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch(error) {
    return null;
  }
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${apiURL}/auth/admin/login`, {
        email: formData.email,
        password: formData.password
      }, { meta: { skipAuth: true } });

      const data = response.data.data || response.data;

      if (data && data.accessToken) {
        const { accessToken, refreshToken } = data;
        const decodedToken = parseJwt(accessToken);
        const authorities = decodedToken?.authorities || [];
        const isAdmin = authorities.includes('ADMIN');

        if (isAdmin) {
          localStorage.setItem('adminAccessToken', accessToken);
          localStorage.setItem('adminRefreshToken', refreshToken);
          localStorage.setItem('adminUser', JSON.stringify({
            email: decodedToken.sub,
            authorities: authorities
          }));
          window.location.href = '/admins/dashboard';
        } else {
          setError('Access denied. Admin privileges required.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="glass-login-card">
        <div className="login-branding">
          <div className="brand-logo">S</div>
          <h1>Shopery <span>Admin</span></h1>
          <p>Admin Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="modern-form">
          {error && (
            <div className="glass-error">
              <i className="fa-solid fa-triangle-exclamation"></i>
              {error}
            </div>
          )}

          <div className="input-group">
            <label>Admin Email</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-envelope"></i>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="name@shopery.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div className="input-wrapper">
              <i className="fa-solid fa-lock"></i>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="glow-login-btn" disabled={loading}>
            {loading ? (
              <span className="loader-dots">Authenticating...</span>
            ) : (
              <>
                Sign In <i className="fa-solid fa-arrow-right-to-bracket"></i>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>© 2026 Shopery</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;