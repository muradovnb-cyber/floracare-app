import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { EMOJIS_STAFF } from '../utils/mockData';
import '../styles/staff.css';

export default function GardenerApp({ user, onLogout }) {
  const [page, setPage] = useState("today");
  const [reportVisit, setReportVisit] = useState(null);
  const [reportText, setReportText] = useState("");
  const [photos, setPhotos] = useState([]);
  const [sent, setSent] = useState(false);

  const [myVisits, setMyVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salary, setSalary] = useState(null);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const data = await api.getVisits();
      setMyVisits(data);
    } catch (err) {
      console.error('Failed to load visits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
    if (page === 'salary') loadSalary();
  }, [page]);

  const loadSalary = async () => {
    try {
      const res = await fetch('/api/salary', {
        headers: { Authorization: `Bearer ${localStorage.getItem('floracare_token')}` }
      });
      if (res.ok) setSalary(await res.json());
    } catch (e) {}
  };

  const todayVisits = myVisits.filter((v) => v.status === "p" || v.status === "s");
  const doneVisits = myVisits.filter((v) => v.status === "d");
  
  const doneCount = doneVisits.length;
  const pendingCount = todayVisits.length;

  const openReport = (visit) => {
    setReportVisit(visit);
    setReportText("");
    setPhotos([]);
    setSent(false);
    setPage("report");
  };

  const addPhoto = () => {
    if (photos.length < 8) {
      const randomEmoji = EMOJIS_STAFF[Math.floor(Math.random() * EMOJIS_STAFF.length)];
      setPhotos((p) => [...p, randomEmoji]);
    }
  };

  const removePhoto = (i) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
  };

  const sendReport = async () => {
    try {
      const mockPlants = [
        { name: "Monstera deliciosa", status: "Отлично" },
        { name: "Ficus lyrata", status: "Хорошо" }
      ];
      await api.submitReport(
        reportVisit.id,
        reportText,
        "Полив регулярный, опрыскивание кроны.",
        photos,
        mockPlants
      );
      setSent(true);
    } catch (err) {
      alert(err.message || 'Ошибка отправки отчёта');
    }
  };

  const navItems = [
    { id: "today", icon: "📋", label: "Сегодня" },
    { id: "schedule", icon: "📅", label: "График" },
    { id: "history", icon: "📚", label: "История" },
    { id: "salary", icon: "💰", label: "Зарплата" }
  ];

  const statusLabel = (s) => {
    return (
      {
        p: "Сегодня",
        s: "Сегодня",
        d: "Выполнен",
        scheduled: "Запланировано"
      }[s] || s
    );
  };

  const statusBadge = (s) => {
    return (
      {
        p: "badge-pending",
        s: "badge-pending",
        d: "badge-done",
        scheduled: "badge-scheduled"
      }[s] || "badge-scheduled"
    );
  };

  return (
    <div className="app app-g">
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <div className="topbar-logo" onClick={onLogout} style={{cursor:'pointer'}}>
              Flora<em>Care</em>
            </div>
            <div className="topbar-user">🌿 {user.name}</div>
          </div>
          <button className="topbar-logout" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </div>

      <div className="content">
        {loading && page !== "report" ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#8ACBA0' }}>Загрузка...</div>
        ) : (
          <>
            {page === "today" && (
              <>
                <div className="today-hero">
                  <div className="today-greet">
                    Добрый день,
                    <br />
                    {user.name.split(" ")[0]}!
                  </div>
                  <div className="today-date">
                    {new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div className="today-stats">
                    <div className="today-stat">
                      <div className="today-stat-n">{myVisits.length}</div>
                      <div className="today-stat-n" style={{ fontSize: 10, color: '#3A6A4A' }}>визитов всего</div>
                    </div>
                    <div className="today-stat">
                      <div className="today-stat-n">{doneCount}</div>
                      <div className="today-stat-l">Готово</div>
                    </div>
                    <div className="today-stat">
                      <div className="today-stat-n">{pendingCount}</div>
                      <div className="today-stat-l">Активно</div>
                    </div>
                  </div>
                </div>

                {todayVisits.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">🌙</div>
                    <div className="empty-text">
                      На сегодня визитов нет.
                      <br />
                      Хорошего отдыха!
                    </div>
                  </div>
                )}

                {todayVisits.map((v) => (
                  <div
                    key={v.id}
                    className="visit-card-g urgent"
                  >
                    <div className="vc-top">
                      <div>
                        <div className="vc-time">{v.time}</div>
                        <div className="vc-svc">{v.service_type}</div>
                      </div>
                      <span className={`badge ${statusBadge(v.status)}`}>
                        {statusLabel(v.status)}
                      </span>
                    </div>
                    <div className="vc-client">{v.client_name}</div>
                    <div className="vc-addr">📍 Ташкент (аккаунт {v.client_name})</div>
                    <div className="vc-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => alert("Открыть маршрут на карте")}
                      >
                        🗺️ Маршрут
                      </button>
                      <button
                        className="btn btn-green"
                        onClick={() => openReport(v)}
                      >
                        📷 Отправить отчёт
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {page === "schedule" && (
              <>
                <div className="sec-title-g">Мой график</div>
                <div className="sec-sub-g">Все назначенные визиты</div>

                {myVisits.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">📅</div>
                    <div className="empty-text">Визитов не назначено</div>
                  </div>
                )}

                {myVisits.map((v) => (
                  <div key={v.id} className="visit-card-g">
                    <div className="vc-top">
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#5DB85A" }}>
                          {new Date(v.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {v.time}
                        </div>
                        <div className="vc-svc">{v.service_type}</div>
                      </div>
                      <span className={`badge ${statusBadge(v.status)}`}>
                        {statusLabel(v.status)}
                      </span>
                    </div>
                    <div className="vc-client">{v.client_name}</div>
                    <div className="vc-addr">📍 Аккаунт: {v.client_name}</div>
                  </div>
                ))}
              </>
            )}

            {page === "history" && (
              <>
                <div className="sec-title-g">История</div>
                <div className="sec-sub-g">Выполненные визиты и отчёты</div>

                {doneVisits.length === 0 && (
                  <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <div className="empty-text">Выполненных визитов пока нет</div>
                  </div>
                )}

                {doneVisits.map((v) => (
                  <div key={v.id} className="card-g">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 10
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#C0E0C0" }}>
                          {v.client_name}
                        </div>
                        <div style={{ fontSize: 11, color: "#4A7A5A", marginTop: 2 }}>
                          {new Date(v.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {v.service_type}
                        </div>
                      </div>
                      <span className="badge badge-done">Выполнен</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#3A6A4A" }}>
                      ✓ Отчет сохранен в системе и отправлен клиенту
                    </div>
                  </div>
                ))}
              </>
            )}

            {page === "salary" && (
              <>
                <div className="sec-title-g">Зарплата</div>
                <div className="sec-sub-g">Текущий месяц — {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</div>

                {/* Итог месяца */}
                <div className="card-g" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: '#8ACBA0', fontWeight: 600 }}>Оклад за месяц</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#5DB85A' }}>
                      {salary ? salary.base_salary.toLocaleString('ru-RU') : '2 500 000'} сум
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 13, color: '#8ACBA0' }}>Бонус (визитов: {doneCount})</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#7DC97A' }}>
                      + {salary ? salary.bonus.toLocaleString('ru-RU') : (doneCount * 50000).toLocaleString('ru-RU')} сум
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid #1A2A1A', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#E8E0D0' }}>Итого к выплате</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: '#5DB85A' }}>
                      {salary
                        ? (salary.base_salary + salary.bonus - salary.advances_total).toLocaleString('ru-RU')
                        : (2500000 + doneCount * 50000).toLocaleString('ru-RU')} сум
                    </div>
                  </div>
                </div>

                {/* Авансы */}
                <div className="sec-title-g" style={{ fontSize: 14, marginTop: 20, marginBottom: 8 }}>Авансы</div>
                {salary && salary.advances && salary.advances.length > 0 ? (
                  salary.advances.map((a, i) => (
                    <div key={i} className="card-g" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: 13, color: '#C0E0C0', fontWeight: 600 }}>{a.date}</div>
                        <div style={{ fontSize: 11, color: '#4A7A5A', marginTop: 2 }}>{a.note}</div>
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#E0A060' }}>- {a.amount.toLocaleString('ru-RU')} сум</div>
                    </div>
                  ))
                ) : (
                  <div className="card-g" style={{ marginBottom: 8 }}>
                    {salary && salary.advances && salary.advances.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#3A6A4A', fontSize: 13 }}>Авансов в этом месяце нет</div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                          <div>
                            <div style={{ fontSize: 13, color: '#C0E0C0', fontWeight: 600 }}>1 июня 2025</div>
                            <div style={{ fontSize: 11, color: '#4A7A5A', marginTop: 2 }}>Аванс по запросу</div>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#E0A060' }}>- 500 000 сум</div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: 13, color: '#C0E0C0', fontWeight: 600 }}>15 июня 2025</div>
                            <div style={{ fontSize: 11, color: '#4A7A5A', marginTop: 2 }}>Аванс по запросу</div>
                          </div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: '#E0A060' }}>- 300 000 сум</div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* История выплат */}
                <div className="sec-title-g" style={{ fontSize: 14, marginTop: 20, marginBottom: 8 }}>История выплат</div>
                {[
                  { period: 'Май 2025', amount: '2 850 000', date: '31 мая 2025', status: 'Выплачено' },
                  { period: 'Апрель 2025', amount: '2 700 000', date: '30 апр 2025', status: 'Выплачено' },
                  { period: 'Март 2025', amount: '2 500 000', date: '31 мар 2025', status: 'Выплачено' },
                ].map((p, i) => (
                  <div key={i} className="card-g" style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#C0E0C0', fontWeight: 600 }}>{p.period}</div>
                      <div style={{ fontSize: 11, color: '#4A7A5A', marginTop: 2 }}>{p.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#5DB85A' }}>{p.amount} сум</div>
                      <div style={{ fontSize: 10, color: '#3A6A4A', marginTop: 2 }}>✓ {p.status}</div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {page === "report" && reportVisit && (
              <div className="report-wrap">
                <button className="report-back" onClick={() => setPage("today")}>
                  ← Назад к задачам
                </button>
                {!sent ? (
                  <>
                    <div className="report-client-card">
                      <div className="rcc-name">{reportVisit.client_name}</div>
                      <div className="rcc-info">🕒 {new Date(reportVisit.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · {reportVisit.time} · {reportVisit.service_type}</div>
                    </div>

                    <label className="form-label">Текст отчёта *</label>
                    <textarea
                      className="form-textarea"
                      rows={5}
                      placeholder="Опишите состояние растений, выполненные работы, рекомендации для клиента..."
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                    />

                    <label className="form-label" style={{ marginTop: 16 }}>
                      Фотографии * ({photos.length}/8)
                    </label>

                    {photos.length > 0 && (
                      <div className="photos-grid">
                        {photos.map((p, i) => (
                          <div key={i} className="photo-thumb">
                            {p}
                            <button className="photo-del" onClick={() => removePhoto(i)}>
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="photo-upload" onClick={addPhoto}>
                      <div className="photo-upload-icon">📸</div>
                      <div className="photo-upload-text">
                        Нажмите чтобы добавить фото
                        <br />
                        <span style={{ fontSize: 10, color: "#2A4A2A" }}>
                          (в реальном приложении откроется камера)
                        </span>
                      </div>
                    </div>

                    <button
                      className="btn btn-full btn-send"
                      disabled={!reportText.trim() || photos.length === 0}
                      onClick={sendReport}
                    >
                      Отправить клиенту и администратору
                    </button>
                    {(!reportText.trim() || photos.length === 0) && (
                      <div
                        style={{
                          textAlign: "center",
                          fontSize: 11,
                          color: "#2A4A3A",
                          marginTop: 10
                        }}
                      >
                        Заполните текст и добавьте хотя бы одно фото
                      </div>
                    )}
                  </>
                ) : (
                  <div className="send-success">
                    <div className="success-icon">✅</div>
                    <div className="success-title">Отчёт отправлен!</div>
                    <div className="success-text">
                      Клиент{" "}
                      <strong style={{ color: "#5DB85A" }}>
                        {reportVisit.client_name}
                      </strong>{" "}
                      получил уведомление.
                      <br />
                      Администратор видит отчёт в панели управления и проверит его.
                    </div>
                    <button
                      className="btn btn-green"
                      style={{ marginTop: 24 }}
                      onClick={() => setPage("today")}
                    >
                      Вернуться к задачам
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {page !== "report" && (
        <div className="bottom-nav">
          {navItems.map((n) => (
            <button
              key={n.id}
              className={`nav-btn ${page === n.id ? "nav-btn-active" : "nav-btn-inactive"}`}
              onClick={() => setPage(n.id)}
            >
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-lbl">{n.label}</span>
              {page === n.id && <div className="nav-dot" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
