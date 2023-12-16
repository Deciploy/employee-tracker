import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, RequireAuth } from "react-auth-utils";

import { MainScreen } from "./screens/MainScreen";
import { LoginScreen } from "./screens/LoginScreen";

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
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const root = createRoot(document.body);
root.render(<App />);
