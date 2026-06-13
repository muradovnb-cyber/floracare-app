import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { bdgCls, bdgLbl } from '../utils/mockData';
import '../styles/staff.css';

export default function AdminApp({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [modalVisit, setModalVisit] = useState(null);
  const [assignVisitId, setAssignVisitId] = useState(null);
  const [assignEmpId, setAssignEmpId] = useState("");
  const [toast, setToast] = useState("");

  // API states
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const vData = await api.getVisits();
      const uData = await api.getUsers();
      const rData = await api.getReports();
      setVisits(vData);
      setUsers(uData);
      setReports(rData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const hasPermission = (perm) => {
    return !user.permissions || user.permissions.includes(perm);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2400);
  };

  const employees = users.filter(u => u.role === 'gardener').map(u => ({
    id: u.id,
    name: u.name,
    short: u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    active: true, // Mock online status
    avatar: '#2D5A3D'
  }));

  const clients = users.filter(u => u.role === 'client');

  const doneVisits = visits.filter((v) => v.status === "d");
  const pendingVisits = visits.filter((v) => v.status === "p" || v.status === "s");

  const unapprovedCount = reports.length; // Active reports on review

  const mrr = clients.length * 990000;

  const approveReport = (visitId) => {
    // Simply acknowledge approval in state for demo
    showToast("✓ Отчёт одобрен");
    setModalVisit(null);
  };

  const saveAssign = async (visitId) => {
    if (!assignEmpId) return;
    try {
      await api.updateVisit(visitId, { gardener_id: Number(assignEmpId) });
      setAssignVisitId(null);
      setAssignEmpId("");
      showToast("✓ Сотрудник назначен");
      loadData();
    } catch (err) {
      alert(err.message || 'Ошибка назначения');
    }
  };

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Сводка" },
    { id: "visits", icon: "📅", label: "Визиты" },
    { id: "reports", icon: "📸", label: "Отчёты" },
    { id: "employees", icon: "👥", label: "Команда" },
    { id: "clients", icon: "🌿", label: "Клиенты" }
  ].filter((n) => hasPermission(n.id));

  const bdg = (s) => {
    return (
      {
        p: "badge-pending-a",
        s: "badge-pending-a",
        d: "badge-done-a"
      }[s] || "badge-scheduled-a"
    );
  };

  const lbl = (s) => {
    return (
      {
        p: "Сегодня",
        s: "Скоро",
        d: "Выполнен"
      }[s] || s
    );
  };

  const isFullAdmin = user.role === 'admin';

  return (
    <div className="app app-a">
      {toast && (
        <div className="admin-toast">{toast}</div>
      )}

      {/* ── HEADER ── */}
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-logo">Flora<em>Care</em></div>
          <nav className="admin-nav">
            {navItems.map(n => (
              <button
                key={n.id}
                className={`admin-nav-btn ${page === n.id ? 'active' : ''}`}
                onClick={() => setPage(n.id)}
              >
                <span className="admin-nav-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="admin-header-right">
            <div className="admin-role-chip">{isFullAdmin ? "Гл. Админ" : "Админ"}</div>
            <button className="admin-logout-btn" onClick={onLogout}>Выйти</button>
          </div>
        </div>
      </header>

      <div className="content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: '#1A3A1A' }}>Загрузка панели...</div>
        ) : (
          <>
            {page === "dashboard" && (
              <>
                <div className="sec-title-a">Добрый день, {user.name.split(" ")[0]}!</div>
                <div className="sec-sub-a">Панель оперативного контроля</div>

                <div className="kpi-row">
                  <div className="kpi-card">
                    <div className="kpi-n">{visits.length}</div>
                    <div className="kpi-l">Визитов всего</div>
                    <div className="kpi-tag kpi-up">↑ Активно</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-n">{doneVisits.length}</div>
                    <div className="kpi-l">Выполнено</div>
                    <div className="kpi-tag kpi-up">✓ С отчётами</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-n">{pendingVisits.length}</div>
                    <div className="kpi-l">Предстоит</div>
                    <div className="kpi-tag kpi-warn">⏳ Ожидают</div>
                  </div>
                  <div className="kpi-card">
                    <div className="kpi-n">{unapprovedCount}</div>
                    <div className="kpi-l">Всего отчётов</div>
                    <div className="kpi-tag kpi-up">✓ Сохранено в БД</div>
                  </div>
                </div>

                {isFullAdmin && (
                  <div className="card-a" style={{ marginBottom: 12 }}>
                    <div className="card-title-a">💰 Финансы месяца</div>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12
                      }}
                    >
                      <div
                        style={{
                          background: "#F0EBE2",
                          borderRadius: 14,
                          padding: 14,
                          textAlign: "center"
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Fraunces',serif",
                            fontSize: 22,
                            color: "#18281A",
                            fontWeight: 500
                          }}
                        >
                          {(mrr / 1000000).toFixed(2)} млн
                        </div>
                        <div style={{ fontSize: 11, color: "#7A9A7A", marginTop: 3 }}>
                          MRR (выручка сум)
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#EAF3EA",
                          borderRadius: 14,
                          padding: 14,
                          textAlign: "center"
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Fraunces',serif",
                            fontSize: 22,
                            color: "#2D5A3D",
                            fontWeight: 500
                          }}
                        >
                          {((mrr - 500000) / 1000000).toFixed(2)} млн
                        </div>
                        <div style={{ fontSize: 11, color: "#7A9A7A", marginTop: 3 }}>
                          Прибыль
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#F5F2EC",
                          borderRadius: 14,
                          padding: 14,
                          textAlign: "center"
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Fraunces',serif",
                            fontSize: 22,
                            color: "#18281A",
                            fontWeight: 500
                          }}
                        >
                          0.5 млн
                        </div>
                        <div style={{ fontSize: 11, color: "#7A9A7A", marginTop: 3 }}>
                          ФОТ садовников
                        </div>
                      </div>
                      <div
                        style={{
                          background: "#F5F2EC",
                          borderRadius: 14,
                          padding: 14,
                          textAlign: "center"
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "'Fraunces',serif",
                            fontSize: 22,
                            color: "#C9A84C",
                            fontWeight: 500
                          }}
                        >
                          {clients.length}
                        </div>
                        <div style={{ fontSize: 11, color: "#7A9A7A", marginTop: 3 }}>
                          Активных клиентов
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="card-a" style={{ marginBottom: 12 }}>
                  <div className="card-title-a">👥 Команда сейчас</div>
                  {employees.map((e) => {
                    const eVisits = visits.filter(
                      (v) => v.gardener_id === e.id
                    );
                    const eDone = eVisits.filter((v) => v.status === "d").length;
                    return (
                      <div key={e.id} className="emp-row-a">
                        <div
                          className="emp-av"
                          style={{ background: e.avatar || "#2D5A3D" }}
                        >
                          {e.short}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="emp-name-a">{e.name}</div>
                          <div className="emp-stats-a">
                            Всего задач: {eVisits.length} визитов · выполнено {eDone}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 4
                          }}
                        >
                          <div
                            className={`emp-dot ${e.active ? "emp-online" : "emp-offline"}`}
                          />
                          <div
                            style={{
                              fontSize: 10,
                              color: e.active ? "#5DB85A" : "#AAAAAA"
                            }}
                          >
                            Онлайн
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {page === "visits" && (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between"
                  }}
                >
                  <div>
                    <div className="sec-title-a">Все визиты</div>
                    <div className="sec-sub-a">Расписание и назначения</div>
                  </div>
                </div>

                <div className="card-a" style={{ marginTop: 12 }}>
                  {visits.map((v) => {
                    const emp = employees.find((e) => e.id === v.gardener_id);
                    return (
                      <div key={v.id}>
                        <div className="visit-row-a">
                          <div>
                            <div className="vra-time">{v.time}</div>
                            <div style={{ fontSize: 10, color: "#9A9A9A" }}>
                              {new Date(v.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                            </div>
                          </div>
                          <div className="vra-client" style={{ flex: 1 }}>
                            <div className="vra-name">{v.client_name}</div>
                            <div className="vra-emp">
                              {emp?.name || "Не назначен"}
                            </div>
                            <div className="vra-svc">{v.service_type}</div>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-end",
                              gap: 5
                            }}
                          >
                            <span className={`badge ${bdg(v.status)}`}>
                              {lbl(v.status)}
                            </span>
                            {v.status !== "d" && (
                              <button
                                onClick={() => {
                                  setAssignVisitId(v.id);
                                  setAssignEmpId(String(v.gardener_id || ""));
                                }}
                                style={{
                                  background: "#2D5A3D",
                                  color: "#8ACBA0",
                                  border: "none",
                                  borderRadius: 20,
                                  padding: "4px 10px",
                                  fontSize: 9,
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                Назначить
                              </button>
                            )}
                          </div>
                        </div>

                        {assignVisitId === v.id && (
                          <div
                            style={{
                              background: "#F8F5F0",
                              borderRadius: 14,
                              padding: 14,
                              marginBottom: 8
                            }}
                          >
                            <div
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                color: "#7A9A7A",
                                marginBottom: 8,
                                letterSpacing: "0.5px",
                                textTransform: "uppercase"
                              }}
                            >
                              Назначить сотрудника
                            </div>
                            <select
                              style={{
                                width: "100%",
                                background: "#F5F2EC",
                                border: "1.5px solid #E0DCD4",
                                borderRadius: 10,
                                padding: "10px 12px",
                                fontSize: 14,
                                color: "#1A3A1A",
                                marginBottom: 10,
                                fontFamily: "inherit"
                              }}
                              value={assignEmpId}
                              onChange={(e) => setAssignEmpId(e.target.value)}
                            >
                              <option value="">— выберите садовника —</option>
                              {employees.map((e) => (
                                <option key={e.id} value={e.id}>
                                  {e.name}
                                </option>
                              ))}
                            </select>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button
                                onClick={() => saveAssign(v.id)}
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  background: "#2D5A3D",
                                  color: "#fff",
                                  border: "none",
                                  borderRadius: 30,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                Сохранить
                              </button>
                              <button
                                onClick={() => setAssignVisitId(null)}
                                style={{
                                  flex: 1,
                                  padding: "10px",
                                  background: "#F0ECE4",
                                  color: "#7A9A7A",
                                  border: "none",
                                  borderRadius: 30,
                                  fontSize: 12,
                                  cursor: "pointer"
                                }}
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {page === "reports" && (
              <>
                <div className="sec-title-a">Фотоотчёты</div>
                <div className="sec-sub-a">Просмотр загруженных в систему отчетов</div>

                {reports.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      color: "#7A9A7A",
                      fontSize: 14,
                      fontWeight: 300
                    }}
                  >
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                    Отчётов пока нет.
                  </div>
                )}

                <div className="card-a">
                  {reports.map((r) => {
                    return (
                      <div
                        key={r.id}
                        className="rep-row"
                        onClick={() => setModalVisit(r)}
                      >
                        <div className="rep-emoji">🌿</div>
                        <div className="rep-info">
                          <div className="rep-client">{r.client_name}</div>
                          <div className="rep-meta">
                            {r.gardener_name} · {new Date(r.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} · 📸 {r.photos?.length || 0} фото
                          </div>
                        </div>
                        <span className="badge badge-approved">✓ OK</span>
                        <span className="rep-arrow">›</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {page === "employees" && (
              <>
                <div className="sec-title-a">Команда</div>
                <div className="sec-sub-a">Список садовников системы</div>

                <div className="card-a" style={{ marginTop: 12 }}>
                  {employees.map((e) => {
                    const total = visits.filter(
                      (v) => v.gardener_id === e.id
                    ).length;
                    const doneE = visits.filter(
                      (v) => v.gardener_id === e.id && v.status === "d"
                    ).length;
                    return (
                      <div
                        key={e.id}
                        className="emp-row-a"
                        style={{ padding: "14px 0" }}
                      >
                        <div
                          className="emp-av"
                          style={{
                            width: 44,
                            height: 44,
                            fontSize: 14,
                            background: e.avatar || "#2D5A3D"
                          }}
                        >
                          {e.short}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="emp-name-a" style={{ fontSize: 15 }}>
                            {e.name}
                          </div>
                          <div className="emp-stats-a">
                            Всего визитов: {total} · Выполнено: {doneE}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {page === "clients" && (
              <>
                <div className="sec-title-a">Клиенты</div>
                <div className="sec-sub-a">База клиентов с подпиской</div>

                <div className="card-a" style={{ marginTop: 12 }}>
                  {clients.map((c) => (
                    <div
                      key={c.id}
                      className="client-row"
                      style={{ padding: '14px 0' }}
                    >
                      <div style={{ flex: 1 }}>
                        <div className="client-name">{c.name}</div>
                        <div className="client-plan">
                          Email: {c.email} · Телефон: {c.phone || 'не указан'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="badge badge-pending-a">Активен</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>


      {modalVisit && (
        <div className="overlay" onClick={() => setModalVisit(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Отчёт о визите</div>
            <div className="modal-sub">
              Клиент: {modalVisit.client_name} · Исполнитель: {modalVisit.gardener_name}
            </div>
            <div className="modal-report-box">{modalVisit.text}</div>
            
            {modalVisit.recommendations && (
              <div className="modal-report-box" style={{ background: '#E8F5E9', borderColor: '#C8E6C9', color: '#2E7D32', marginTop: 10 }}>
                <strong>Рекомендация садовника:</strong><br />
                {modalVisit.recommendations}
              </div>
            )}

            {modalVisit.photos && modalVisit.photos.length > 0 && (
              <div className="modal-photos" style={{ marginTop: 15 }}>
                {modalVisit.photos.map((p, i) => (
                  <div key={i} className="modal-photo">
                    {p}
                  </div>
                ))}
              </div>
            )}
            
            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button
                className="modal-btn btn-green"
                onClick={() => approveReport(modalVisit.visit_id)}
              >
                Утвердить отчёт
              </button>
              <button
                className="modal-btn btn-gray-a"
                onClick={() => setModalVisit(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
