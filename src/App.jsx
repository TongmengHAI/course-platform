import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, App as AntdApp } from "antd"; // ⬅️ Import App
import { AuthProvider } from "./context/AuthContext";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4f46e5", // Indigo primary color
          borderRadius: 8,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
        components: {
          Button: {
            controlHeightLG: 46,
            fontWeight: 600,
          },
          Input: {
            controlHeightLG: 46,
          },
          Select: {
            controlHeightLG: 46,
          },
        },
      }}
    >
      <AntdApp> {/* ⬅️ Wrap with AntdApp for contextual notifications */}
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
