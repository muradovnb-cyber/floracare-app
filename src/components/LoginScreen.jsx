import React, { useState } from 'react';
import { USERS } from '../utils/mockData';

export default function LoginScreen({ onLogin, onBack }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const roles = [
    {
      id: "gardener",
      icon: "🌿",
      name: "Садовник",
      desc: "График визитов, отправка фотоотчётов"
    },
    {
      id: "admin",
      icon: "⚙️",
      name: "Администратор",
      desc: "Полный контроль, аналитика, управление"
    }
  ];

  const handleLogin = () => {
    setError("");
    const user = USERS.find(
      (u) =>
        u.login === login.trim().toLowerCase() &&
        u.password === password &&
        u.role === selectedRole
    );
    if (!user) {
      setError("Неверный логин или пароль. Попробуйте ещё раз.");
      return;
    }
    onLogin(user);
  };

  return (
    <div className="login-wrap">
      <div className="login-bg" />
      <div className="login-leaf1">🌿</div>
      <div className="login-leaf2">🍂</div>
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-text">
            Flora<span>Care</span>
          </div>
          <div className="login-logo-sub">Staff Portal</div>
        </div>
        <div className="login-divider" />
        <div className="login-role-label">Выберите вашу роль</div>
        <div className="role-selector">
          {roles.map((r) => (
            <div
              key={r.id}
              className={`role-card ${selectedRole === r.id ? "selected" : ""}`}
              onClick={() => {
                setSelectedRole(r.id);
                setLogin("");
                setPassword("");
                setError("");
              }}
            >
              <div className="role-card-icon">{r.icon}</div>
              <div className="role-card-name">{r.name}</div>
              <div className="role-card-desc">{r.desc}</div>
            </div>
          ))}
        </div>

        {selectedRole && (
          <>
            {selectedRole === "gardener" && (
              <div className="login-hint">
                <strong>Для демо:</strong> логин <strong>maria</strong>,{" "}
                <strong>dmitry</strong> или <strong>anna</strong> · пароль{" "}
                <strong>123</strong>
              </div>
            )}
            {selectedRole === "admin" && (
              <div className="login-hint">
                👑 <strong>Admin (полный доступ):</strong> логин{" "}
                <strong>admin</strong> · пароль <strong>admin</strong>
                <br />
                🔑 <strong>Admin 1 (ограниченный):</strong> логин{" "}
                <strong>admin1</strong> · пароль <strong>admin1</strong>
              </div>
            )}

            {error && <div className="login-error">⚠️ {error}</div>}

            <div className="login-field">
              <label className="login-field-label">Логин</label>
              <input
                className="login-input"
                placeholder="Введите логин"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
              />
            </div>

            <div className="login-field">
              <label className="login-field-label">Пароль</label>
              <input
                className="login-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>

            <button
              className="login-btn"
              disabled={!login || !password}
              onClick={handleLogin}
            >
              Войти как {selectedRole === "admin" ? "администратор" : "садовник"}
            </button>
          </>
        )}

        {!selectedRole && (
          <div
            style={{
              textAlign: "center",
              fontSize: 12,
              color: "#2A4A2A",
              fontWeight: 300
            }}
          >
            Выберите роль чтобы продолжить
          </div>
        )}

        {onBack && (
          <button
            onClick={onBack}
            style={{
              width: "100%",
              marginTop: 12,
              padding: "10px",
              borderRadius: 40,
              border: "1.5px solid #2D5A3D",
              background: "transparent",
              color: "#2D5A3D",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            Вернуться на сайт
          </button>
        )}
      </div>
    </div>
  );
}
