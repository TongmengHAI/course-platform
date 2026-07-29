import React from "react";
import RegisterPage from "./pages/RegisterPage";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <>
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    </>
  );
}

export default App;
