import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import '../styles/admin.css';

export default function AdminApp({ user, onLogout }) {
  const [page, setPage] = useState("dashboard");
  const [modalVisit, setModalVisit] = useState(null);
  const [assignVisitId, setAssignVisitId] = useState(null);
  const [assignEmpId, setAssignEmpId] = useState("");
  const [toast, setToast] = useState("");
  const [visits, setVisits] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vData, uData, rData] = await Promise.all([
        api.getVisits(), api.getUsers(), api.getReports()
      ]);
      setVisits(vData); setUsers(uData); setReports(rData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [page]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(""), 2400); };

  const hasPermission = (perm) => !user.permissions || user.permissions.includes(perm);
  const isFullAdmin = user.role === 'admin';

  const employees = users.filter(u => u.role === 'gardener').map(u => ({
    id: u.id, name: u.name,
    short: u.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
    color: ['#1B4D3E','#2D5A3D','#1A3A5A','#3D2B1F','#2A2D5A'][u.id % 5]
  }));
  const clients = users.filter(u => u.role === 'client');
  const doneVisits = visits.filter(v => v.status === 'd');
  const pendingVisits = visits.filter(v => v.status === 'p' || v.status === 's');
  const mrr = clients.length * 990000;

  const navItems = [
    { id: "dashboard", icon: "📊", label: "Сводка" },
    { id: "visits",    icon: "📅", label: "Визиты" },
    { id: "reports",   icon: "📸", label: "Отчёты" },
    { id: "employees", icon: "👥", label: "Команда" },
    { id: "clients",   icon: "🌿", label: "Клиенты" }
  ].filter(n => hasPermission(n.id));

  const statusBadge = (s) => ({ p:'badge-p', s:'badge-p', d:'badge-d' }[s] || 'badge-s');
  const statusLabel = (s) => ({ p:'Сегодня', s:'Скоро', d:'Выполнен' }[s] || s);

  const saveAssign = async (visitId) => {
    if (!assignEmpId) return;
    try {
      await api.updateVisit(visitId, { gardener_id: Number(assignEmpId) });
      setAssignVisitId(null); setAssignEmpId("");
      showToast("✓ Сотрудник назначен"); loadData();
    } catch (err) { alert(err.message); }
  };

  return (
    <div className="adm">
      {toast && <div className="adm-toast">{toast}</div>}

      <header className="adm-header">
        <div className="adm-header-in">
          <div className="adm-logo">Flora<em>Care</em></div>
          <nav className="adm-nav">
            {navItems.map(n => (
              <button key={n.id} className={`adm-nav-btn${page===n.id?' active':''}`} onClick={() => setPage(n.id)}>
                <span>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div className="adm-header-r">
            <span className="adm-chip">{isFullAdmin ? 'Гл. Админ' : 'Админ'}</span>
            <button className="adm-logout" onClick={onLogout}>Выйти</button>
          </div>
        </div>
      </header>

      <main className="adm-main">
        {loading ? (
          <div className="adm-loading">
            <div className="adm-spinner" />
          </div>
        ) : (
          <>
            {page === "dashboard" && (
              <div className="adm-page">
                <div className="adm-page-head">
                  <div>
                    <h1 className="adm-title">Добрый день, {user.name.split(' ')[0]}</h1>
                    <p className="adm-sub">Панель оперативного контроля · {new Date().toLocaleDateString('ru-RU', {weekday:'long', day:'numeric', month:'long'})}</p>
                  </div>
                  <button className="adm-refresh-btn" onClick={loadData}>↻ Обновить</button>
                </div>

                <div className="adm-kpi">
                  <div className="adm-kpi-card">
                    <div className="adm-kpi-icon">📅</div>
                    <div className="adm-kpi-val">{visits.length}</div>
                    <div className="adm-kpi-lbl">Визитов всего</div>
                    <div className="adm-kpi-tag green">Активно</div>
                  </div>
                  <div className="adm-kpi-card">
                    <div className="adm-kpi-icon">✅</div>
                    <div className="adm-kpi-val">{doneVisits.length}</div>
                    <div className="adm-kpi-lbl">Выполнено</div>
                    <div className="adm-kpi-tag green">С отчётами</div>
                  </div>
                  <div className="adm-kpi-card">
                    <div className="adm-kpi-icon">⏳</div>
                    <div className="adm-kpi-val">{pendingVisits.length}</div>
                    <div className="adm-kpi-lbl">Предстоит</div>
                    <div className="adm-kpi-tag amber">Ожидают</div>
                  </div>
                  <div className="adm-kpi-card">
                    <div className="adm-kpi-icon">📸</div>
                    <div className="adm-kpi-val">{reports.length}</div>
                    <div className="adm-kpi-lbl">Отчётов</div>
                    <div className="adm-kpi-tag green">В базе</div>
                  </div>
                </div>

                <div className="adm-grid2">
                  {isFullAdmin && (
                    <div className="adm-card">
                      <div className="adm-card-hd">Финансы месяца</div>
                      <div className="adm-fin-grid">
                        <div className="adm-fin-item">
                          <div className="adm-fin-val">{(mrr/1000000).toFixed(2)} млн</div>
                          <div className="adm-fin-lbl">MRR выручка</div>
                        </div>
                        <div className="adm-fin-item accent">
                          <div className="adm-fin-val">{((mrr-500000)/1000000).toFixed(2)} млн</div>
                          <div className="adm-fin-lbl">Прибыль</div>
                        </div>
                        <div className="adm-fin-item">
                          <div className="adm-fin-val">0.5 млн</div>
                          <div className="adm-fin-lbl">ФОТ садовников</div>
                        </div>
                        <div className="adm-fin-item">
                          <div className="adm-fin-val amber">{clients.length}</div>
                          <div className="adm-fin-lbl">Активных клиентов</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="adm-card">
                    <div className="adm-card-hd">Команда сейчас</div>
                    {employees.map(e => {
                      const eVisits = visits.filter(v => v.gardener_id === e.id);
                      const eDone = eVisits.filter(v => v.status === 'd').length;
                      const pct = eVisits.length ? Math.round(eDone/eVisits.length*100) : 0;
                      return (
                        <div key={e.id} className="adm-emp-row">
                          <div className="adm-emp-av" style={{background:e.color}}>{e.short}</div>
                          <div className="adm-emp-info">
                            <div className="adm-emp-name">{e.name}</div>
                            <div className="adm-emp-stat">{eVisits.length} визитов · {eDone} выполнено</div>
                            <div className="adm-emp-bar"><div className="adm-emp-fill" style={{width:`${pct}%`}}/></div>
                          </div>
                          <div className="adm-emp-dot" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {page === "visits" && (
              <div className="adm-page">
                <div className="adm-page-head">
                  <div>
                    <h1 className="adm-title">Все визиты</h1>
                    <p className="adm-sub">Расписание и назначения · {visits.length} записей</p>
                  </div>
                </div>
                <div className="adm-card">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Время / Дата</th>
                        <th>Клиент</th>
                        <th>Садовник</th>
                        <th>Услуга</th>
                        <th>Статус</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {visits.map(v => {
                        const emp = employees.find(e => e.id === v.gardener_id);
                        return (
                          <React.Fragment key={v.id}>
                            <tr>
                              <td>
                                <div className="adm-td-time">{v.time}</div>
                                <div className="adm-td-date">{new Date(v.date).toLocaleDateString('ru-RU',{day:'numeric',month:'short'})}</div>
                              </td>
                              <td className="adm-td-main">{v.client_name}</td>
                              <td className="adm-td-muted">{emp?.name || <span className="adm-unassigned">Не назначен</span>}</td>
                              <td className="adm-td-muted">{v.service_type}</td>
                              <td><span className={`adm-badge ${statusBadge(v.status)}`}>{statusLabel(v.status)}</span></td>
                              <td>
                                {v.status !== 'd' && (
                                  <button className="adm-assign-btn" onClick={() => { setAssignVisitId(v.id); setAssignEmpId(String(v.gardener_id||'')); }}>
                                    Назначить
                                  </button>
                                )}
                              </td>
                            </tr>
                            {assignVisitId === v.id && (
                              <tr>
                                <td colSpan={6}>
                                  <div className="adm-assign-form">
                                    <select className="adm-select" value={assignEmpId} onChange={e => setAssignEmpId(e.target.value)}>
                                      <option value="">— выберите садовника —</option>
                                      {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                                    </select>
                                    <button className="adm-btn-save" onClick={() => saveAssign(v.id)}>Сохранить</button>
                                    <button className="adm-btn-cancel" onClick={() => setAssignVisitId(null)}>Отмена</button>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {page === "reports" && (
              <div className="adm-page">
                <div className="adm-page-head">
                  <div>
                    <h1 className="adm-title">Фотоотчёты</h1>
                    <p className="adm-sub">Отчёты садовников по визитам</p>
                  </div>
                </div>
                {reports.length === 0 ? (
                  <div className="adm-empty">
                    <div className="adm-empty-icon">📸</div>
                    <div className="adm-empty-txt">Отчётов пока нет</div>
                  </div>
                ) : (
                  <div className="adm-reports-grid">
                    {reports.map(r => (
                      <div key={r.id} className="adm-report-card" onClick={() => setModalVisit(r)}>
                        <div className="adm-rc-top">
                          <div className="adm-rc-icon">🌿</div>
                          <span className="adm-badge badge-d">✓ OK</span>
                        </div>
                        <div className="adm-rc-client">{r.client_name}</div>
                        <div className="adm-rc-meta">{r.gardener_name}</div>
                        <div className="adm-rc-date">{new Date(r.date).toLocaleDateString('ru-RU',{day:'numeric',month:'long'})}</div>
                        {r.photos?.length > 0 && <div className="adm-rc-photos">📷 {r.photos.length} фото</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {page === "employees" && (
              <div className="adm-page">
                <div className="adm-page-head">
                  <div>
                    <h1 className="adm-title">Команда</h1>
                    <p className="adm-sub">Список садовников · {employees.length} человек</p>
                  </div>
                </div>
                <div className="adm-emp-grid">
                  {employees.map(e => {
                    const total = visits.filter(v => v.gardener_id === e.id).length;
                    const done = visits.filter(v => v.gardener_id === e.id && v.status === 'd').length;
                    const pct = total ? Math.round(done/total*100) : 0;
                    return (
                      <div key={e.id} className="adm-emp-card">
                        <div className="adm-emp-card-av" style={{background:e.color}}>{e.short}</div>
                        <div className="adm-emp-card-name">{e.name}</div>
                        <div className="adm-emp-card-role">Садовник</div>
                        <div className="adm-emp-card-stats">
                          <div className="adm-emp-stat-item">
                            <div className="adm-emp-stat-val">{total}</div>
                            <div className="adm-emp-stat-lbl">Визитов</div>
                          </div>
                          <div className="adm-emp-stat-item">
                            <div className="adm-emp-stat-val green">{done}</div>
                            <div className="adm-emp-stat-lbl">Выполнено</div>
                          </div>
                          <div className="adm-emp-stat-item">
                            <div className="adm-emp-stat-val">{pct}%</div>
                            <div className="adm-emp-stat-lbl">Прогресс</div>
                          </div>
                        </div>
                        <div className="adm-emp-bar" style={{marginTop:12}}>
                          <div className="adm-emp-fill" style={{width:`${pct}%`}}/>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {page === "clients" && (
              <div className="adm-page">
                <div className="adm-page-head">
                  <div>
                    <h1 className="adm-title">Клиенты</h1>
                    <p className="adm-sub">База клиентов · {clients.length} человек</p>
                  </div>
                </div>
                <div className="adm-card">
                  <table className="adm-table">
                    <thead>
                      <tr><th>Клиент</th><th>Email</th><th>Телефон</th><th>Статус</th></tr>
                    </thead>
                    <tbody>
                      {clients.map(c => (
                        <tr key={c.id}>
                          <td className="adm-td-main">{c.name}</td>
                          <td className="adm-td-muted">{c.email}</td>
                          <td className="adm-td-muted">{c.phone || '—'}</td>
                          <td><span className="adm-badge badge-p">Активен</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {modalVisit && (
        <div className="adm-overlay" onClick={() => setModalVisit(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-modal-head">
              <div>
                <div className="adm-modal-title">Отчёт о визите</div>
                <div className="adm-modal-sub">{modalVisit.client_name} · {modalVisit.gardener_name}</div>
              </div>
              <button className="adm-modal-close" onClick={() => setModalVisit(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <div className="adm-modal-box">{modalVisit.text}</div>
              {modalVisit.recommendations && (
                <div className="adm-modal-box green">{modalVisit.recommendations}</div>
              )}
            </div>
            <div className="adm-modal-foot">
              <button className="adm-btn-save" onClick={() => { showToast("✓ Отчёт одобрен"); setModalVisit(null); }}>Утвердить отчёт</button>
              <button className="adm-btn-cancel" onClick={() => setModalVisit(null)}>Закрыть</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
