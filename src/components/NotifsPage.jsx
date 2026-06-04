import React, { useState } from 'react';
import { NOTIFS } from '../utils/mockData';

export default function NotifsPage({ onBack }) {
  const [notifs, setNotifs] = useState(NOTIFS);

  const readAll = () => {
    setNotifs((ns) => ns.map((x) => ({ ...x, unread: false })));
  };

  const unread = notifs.filter((n) => n.unread).length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px 0"
        }}
      >
        <button className="rd-back" style={{ padding: 0 }} onClick={onBack}>
          ← Назад
        </button>
        {unread > 0 && (
          <button
            style={{
              background: "none",
              border: "none",
              color: "#4D9149",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer"
            }}
            onClick={readAll}
          >
            Прочитать все
          </button>
        )}
      </div>

      <div className="page-hdr">
        <div className="page-h1">Уведомления</div>
        <div className="page-sub">
          {unread > 0 ? `${unread} непрочитанных` : "Всё прочитано"}
        </div>
      </div>

      <div className="notif-page">
        {["Новые", "Ранее"].map((label, li) => {
          const items =
            li === 0
              ? notifs.filter((n) => n.unread)
              : notifs.filter((n) => !n.unread);

          if (!items.length) return null;

          return (
            <div key={label}>
              <div className="notif-section-label">{label}</div>
              {items.map((n) => (
                <div
                  key={n.id}
                  className={`notif-card ${n.unread ? "unread" : ""}`}
                  onClick={() => {
                    setNotifs((ns) =>
                      ns.map((x) => (x.id === n.id ? { ...x, unread: false } : x))
                    );
                  }}
                >
                  <div className="nc-icon" style={{ background: n.bg }}>
                    {n.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="nc-title">{n.title}</div>
                    <div className="nc-text">{n.text}</div>
                    <div className="nc-time">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
