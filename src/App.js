import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import MeasurementForm from "./components/MeasurementForm";
import "./App.css";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="app-header">
      <h1>TensioTrack</h1>
      {user && (
        <div className="user-info">
          <span>Bonjour, {user.firstName}</span>
          <button onClick={logout} className="logout-btn">
            Déconnexion
          </button>
        </div>
      )}
    </header>
  );
};

const MainApp = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <div className="home-layout">
                  <div className="form-section">
                    <MeasurementForm />
                  </div>
                  <div className="dashboard-section">
                    <Dashboard />
                  </div>
                </div>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
