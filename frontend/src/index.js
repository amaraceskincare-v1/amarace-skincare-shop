import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import './styles/index.css';

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '955170258482-sp9iui1p55v2r5l2a8j6fr48sstm08kr.apps.googleusercontent.com';

// Log warning if we are using the fallback ID (likely to fail if not yours)
if (!process.env.REACT_APP_GOOGLE_CLIENT_ID && !GOOGLE_CLIENT_ID.startsWith('955170258482')) {
  console.warn('Google Client ID is missing or incorrect. Social login may not work.');
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <SettingsProvider>
            <LanguageProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </LanguageProvider>
          </SettingsProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  </React.StrictMode>
);