import React, { useEffect } from 'react';
import axios from 'axios';
import { createRoot } from 'react-dom/client';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, RequireAuth } from 'react-auth-utils';
import { AuthState } from 'react-auth-utils/src/lib/types';

import { MainScreen } from './screens/MainScreen';
import { LoginScreen } from './screens/LoginScreen';

console.log(process.env.NX_APP_API_BASE_URL);

const AppRoutes = () => (
  <HashRouter basename="/">
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth
            unauthenticated={<Navigate to="/login" replace={true} />}
          >
            <MainScreen />
          </RequireAuth>
        }
      />
      <Route path="/login" element={<LoginScreen />} />
    </Routes>
  </HashRouter>
);

export const App: React.FC = () => {
  const onAuthStateChange = (authState: AuthState | null) => {
    if (authState?.token) {
      axios.interceptors.request.use((config) => {
        if (!config.url?.includes('auth')) {
          config.headers['Authorization'] = `Bearer ${authState.token}`;
        }
        return config;
      });
    }
  };

  useEffect(() => {
    /*
      set base url for http client
    */
    axios.defaults.baseURL = process.env.NX_APP_API_BASE_URL;

    /*
      set request interceptor
      handle request errors
    */
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response.data.message) {
          return Promise.reject({
            ...error,
            message: error.response.data.message,
          });
        }
        return Promise.reject(error);
      },
    );
  }, []);

  return (
    <>
      <AuthProvider onAuthStateChange={onAuthStateChange}>
        <AppRoutes />
      </AuthProvider>
    </>
  );
};

const root = createRoot(document.body);
root.render(<App />);
