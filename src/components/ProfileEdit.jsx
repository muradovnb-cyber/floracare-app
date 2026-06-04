import React, { useState } from 'react';

export default function ProfileEdit({ onBack }) {
  const [form, setForm] = useState({
    name: "Алексей Petrov", // In index.html line 2268: "Алексей Петров"
    phone: "+7 900 123-45-67",
    email: "alex@example.com",
    address: "ул. Садовая, 12, кв. 34",
    notify: true
  });
  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onBack();
    }, 1800);
  };

  const upd = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
  };

  const fields = [
    {
      icon: "👤",
      label: "Имя и фамилия",
      key: "name",
      type: "text"
    },
    {
      icon: "📱",
      label: "Телефон",
      key: "phone",
      type: "tel"
    },
    {
      icon: "✉️",
      label: "Email",
      key: "email",
      type: "email"
    }
  ];

  const toggles = [
    { icon: "🔔", label: "Push-уведомления" },
    { icon: "📧", label: "Email-рассылка" },
    { icon: "💬", label: "SMS-напоминания" }
  ];

  return (
    <div>
      <button className="rd-back" onClick={onBack}>
        ← Назад
      </button>
      <div className="page-hdr">
        <div className="page-h1">Профиль</div>
        <div className="page-sub">Редактирование данных</div>
      </div>
      <div className="profile-edit">
        <div className="pe-avatar-wrap">
          <div className="pe-av">
            АП
            <div className="pe-av-edit">✏️</div>
          </div>
          <div className="pe-av-name">{form.name}</div>
          <div className="pe-av-plan">Тариф Стандарт</div>
        </div>

        <div className="pe-group">
          {fields.map((f) => (
            <div key={f.key} className="pe-field">
              <div className="pe-field-icon">{f.icon}</div>
              <div className="pe-field-inner">
                <div className="pe-field-label">{f.label}</div>
                <input
                  className="pe-field-input"
                  type={f.type}
                  value={form[f.key]}
                  onChange={(e) => upd(f.key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pe-group">
          <div className="pe-field">
            <div className="pe-field-icon">📍</div>
            <div className="pe-field-inner">
              <div className="pe-field-label">Адрес обслуживания</div>
              <input
                className="pe-field-input"
                value={form.address}
                onChange={(e) => upd("address", e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="pe-group">
          {toggles.map((item, i) => (
            <div
              key={i}
              className="pe-field"
              style={{ cursor: "pointer" }}
            >
              <div className="pe-field-icon">{item.icon}</div>
              <div className="pe-field-inner">
                <div className="pe-field-label">{item.label}</div>
              </div>
              <div
                style={{
                  width: 44,
                  height: 26,
                  background: i === 0 ? "#4D9149" : "#D8D0C8",
                  borderRadius: 13,
                  position: "relative",
                  cursor: "pointer",
                  flexShrink: 0
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    background: "#fff",
                    borderRadius: "50%",
                    position: "absolute",
                    top: 3,
                    left: i === 0 ? 20 : 3,
                    transition: "left .2s",
                    boxShadow: "0 1px 4px rgba(0,0,0,.2)"
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <button className="pe-save-btn" onClick={save}>
          Сохранить изменения
        </button>
        <button className="pe-cancel-btn" onClick={onBack}>
          Отмена
        </button>
        <div style={{ height: 16 }} />

        {saved && (
          <div className="pe-save-toast">
            ✓ Данные сохранены
          </div>
        )}
      </div>
    </div>
  );
}
