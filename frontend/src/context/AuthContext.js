import { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first (Remember Me), then sessionStorage (current session only)
    let token = localStorage.getItem('token');
    let userData = localStorage.getItem('user');

    if (!token) {
      token = sessionStorage.getItem('token');
      userData = sessionStorage.getItem('user');
    }

    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const login = async (email, password, rememberMe = true) => {
    const { data } = await api.post('/auth/login', { email, password });
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', data.token);
    storage.setItem('user', JSON.stringify(data));
    // Clear the other storage to avoid conflicts
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem('token');
    otherStorage.removeItem('user');
    setUser(data);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return data;
  };

  const verifyEmail = async (email, otp) => {
    const { data } = await api.post('/auth/verify-email', { email, otp });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  const resendOtp = async (email) => {
    const { data } = await api.post('/auth/resend-otp', { email });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
    setUser(null);
  };

  const updateProfile = async (userData) => {
    const { data } = await api.put('/auth/profile', userData);
    localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
    setUser({ ...user, ...data });
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, verifyEmail, resendOtp, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};