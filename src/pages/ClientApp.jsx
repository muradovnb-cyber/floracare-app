import React, { useState, useEffect } from 'react';
import Onboarding from '../components/Onboarding';
import ReportDetail from '../components/ReportDetail';
import PaymentPage from '../components/PaymentPage';
import NotifsPage from '../components/NotifsPage';
import ProfileEdit from '../components/ProfileEdit';
import { api } from '../utils/api';
import {
  SERVICES,
  TARIFFS,
  SHOP,
  NOTIFS,
  CATS,
  bdgCls,
  bdgLbl
} from '../utils/mockData';
import '../styles/client.css';

export default function ClientApp({ user, onLogout }) {
  const [onboarded, setOnboarded] = useState(false);
  const [page, setPage] = useState("home");
  const [ctab, setCtab] = useState("sch");
  const [cat, setCat] = useState("Все");
  const [cart, setCart] = useState([]);
  const [subPage, setSubPage] = useState(null); // "report-detail" | "payment" | "notifs" | "profile-edit"
  const [activeReport, setActiveReport] = useState(null);

  // Dynamic states from database
  const [schedule, setSchedule] = useState([]);
  const [reports, setReports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load user data
  useEffect(() => {
    async function loadData() {
      try {
        const vData = await api.getVisits();
        const rData = await api.getReports();
        const pData = await api.getPayments();
        setSchedule(vData);
        setReports(rData);
        setPayments(pData);
      } catch (err) {
        console.error('Failed to load cabinet data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [subPage, page]);

  const unreadCount = NOTIFS.filter((n) => n.unread).length;

  if (!onboarded) {
    return (
      <div className="shell">
        <Onboarding onDone={() => setOnboarded(true)} />
      </div>
    );
  }

  const filtered = cat === "Все" ? SHOP : SHOP.filter((i) => i.cat === cat);

  // Helper for date parsing
  const formatScheduleDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { day: '??', mon: '???' };
      const day = d.getDate().toString();
      const mon = d.toLocaleDateString('ru-RU', { month: 'short' }).toUpperCase().replace('.', '');
      return { day, mon };
    } catch (e) {
      return { day: '??', mon: '???' };
    }
  };

  const getInitials = (name) => {
    if (!name) return 'КЛ';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // sub-pages override
  if (subPage === "report-detail" && activeReport) {
    return (
      <div className="shell">
        <ReportDetail
          report={activeReport}
          onBack={() => {
            setSubPage(null);
            setActiveReport(null);
          }}
        />
      </div>
    );
  }
  if (subPage === "payment") {
    return (
      <div className="shell">
        <PaymentPage
          onBack={() => setSubPage(null)}
          onSuccess={() => setSubPage(null)}
        />
      </div>
    );
  }
  if (subPage === "notifs") {
    return (
      <div className="shell">
        <NotifsPage onBack={() => setSubPage(null)} />
      </div>
    );
  }
  if (subPage === "profile-edit") {
    return (
      <div className="shell">
        <ProfileEdit onBack={() => setSubPage(null)} />
      </div>
    );
  }

  const TABS = [
    { id: "home", icon: "🏠", lbl: "Главная" },
    { id: "tariffs", icon: "⭐", lbl: "Тарифы" },
    { id: "shop", icon: "🛍", lbl: "Магазин" },
    { id: "cabinet", icon: "👤", lbl: "Кабинет" }
  ];

  const CTABS = [
    { id: "sch", lbl: "📅 График" },
    { id: "pay", lbl: "💳 Платежи" },
    { id: "rep", lbl: "📸 Отчёты" }
  ];

  const upcomingVisit = schedule.find(s => s.status !== 'd');

  return (
    <div className="shell">
      <div className="hdr">
        <div className="hdr-inner">
          <div className="logo" onClick={onLogout} style={{cursor:'pointer'}}>
            Flora<em>Care</em>
          </div>
          <div className="hdr-btns">
            <div style={{ position: "relative" }}>
              <button className="hdr-btn" onClick={() => setSubPage("notifs")}>
                🔔
              </button>
              {unreadCount > 0 && <div className="hdr-badge" />}
            </div>
            <button className="hdr-btn" onClick={() => alert("Поиск...")}>🔍</button>
          </div>
        </div>
      </div>

      <div className="body">
        {page === "home" && (
          <>
            <div className="hero">
              <div className="hero-glow" />
              <div className="hero-deco">🌿</div>
              <div className="hero-body">
                <div className="hero-pill">
                  <div className="hero-pip" />
                  Профессиональный уход
                </div>
                <div className="hero-h1">
                  Ваши растения
                  <br />
                  в <em>надёжных</em>
                  <br />
                  руках
                </div>
                <button className="hero-cta" onClick={() => setPage("tariffs")}>
                  Выбрать тариф
                  <div className="hero-arr">→</div>
                </button>
              </div>
            </div>

            <div className="stats">
              {[
                { n: "10к+", l: "Клиентов" },
                { n: "5 лет", l: "На рынке" },
                { n: "98%", l: "Довольных" },
                { n: "47к", l: "Визитов" }
              ].map((s, i) => (
                <div key={i} className="stat">
                  <div className="stat-n">{s.n}</div>
                  <div className="stat-l">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="row-hdr">
              <div className="row-title">Услуги</div>
              <button className="row-link" onClick={() => setPage("tariffs")}>Все →</button>
            </div>

            <div className="svcs">
              {SERVICES.map((s, i) => (
                <div key={i} className="svc-card">
                  <div className="svc-icon" style={{ background: s.bg }}>
                    {s.icon}
                  </div>
                  <div className="svc-name">{s.name}</div>
                  <div className="svc-desc">{s.desc}</div>
                </div>
              ))}
            </div>

            <div className="row-hdr">
              <div className="row-title">Следующий визит</div>
              <button
                className="row-link"
                onClick={() => {
                  setPage("cabinet");
                  setCtab("sch");
                }}
              >
                График →
              </button>
            </div>

            {upcomingVisit ? (
              <div className="nv">
                <div className="nv-top">
                  <div className="nv-tag">Ближайшее посещение</div>
                  <div className="nv-st">Скоро</div>
                </div>
                <div className="nv-date">
                  {new Date(upcomingVisit.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
                </div>
                <div className="nv-sub">
                  {upcomingVisit.service_type} · {new Date(upcomingVisit.date).toLocaleDateString('ru-RU', { weekday: 'long' })}
                </div>
                <div className="nv-foot">
                  <div className="nv-av">🌿</div>
                  <div className="nv-emp">{upcomingVisit.gardener_name || 'Не назначен'}</div>
                  <div className="nv-time">{upcomingVisit.time}</div>
                </div>
              </div>
            ) : (
              <div style={{ margin: '0 14px', background: '#fff', borderRadius: '26px', padding: '24px', textAlign: 'center', color: '#A09888' }}>
                Нет запланированных визитов
              </div>
            )}

            <div className="row-hdr">
              <div className="row-title">Магазин</div>
              <button className="row-link" onClick={() => setPage("shop")}>
                Все →
              </button>
            </div>

            <div className="shop-row">
              {SHOP.slice(0, 4).map((item) => (
                <div key={item.id} className="shop-card">
                  {item.hot && <div className="shop-hot">{item.hot}</div>}
                  <div className="shop-ico" style={{ background: item.bg }}>
                    {item.ico}
                  </div>
                  <div className="shop-name">{item.name}</div>
                  <div className="shop-cat">{item.cat}</div>
                  <div className="shop-foot">
                    <div className="shop-price">{item.price}</div>
                    <button
                      className="shop-plus"
                      onClick={() =>
                        setCart((c) =>
                          c.includes(item.id) ? c : [...c, item.id]
                        )
                      }
                    >
                      {cart.includes(item.id) ? "✓" : "+"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 8 }} />
          </>
        )}

        {page === "tariffs" && (
          <>
            <div className="page-hdr">
              <div className="page-h1">Тарифы</div>
              <div className="page-sub">Выберите подходящий план ухода</div>
            </div>

            <div className="tariff-list">
              {TARIFFS.map((t, i) => (
                <div key={i} className={`tc ${t.cls}`}>
                  {t.pop && <div className="tc-pop">Популярный</div>}
                  <div className="tc-name">{t.name}</div>
                  <div className="tc-freq">{t.freq}</div>
                  <div className="tc-price">
                    {t.price} <span className="tc-mo">{t.mo}</span>
                  </div>
                  <div className="tc-sep" />
                  <div className="tc-feats">
                    {t.feats.map((f, j) => (
                      <div key={j} className="tc-feat">
                        <div className="tc-chk">✓</div>
                        {f}
                      </div>
                    ))}
                  </div>
                  <button className="tc-btn" onClick={() => setSubPage("payment")}>
                    {t.btn}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {page === "shop" && (
          <>
            <div className="page-hdr">
              <div className="page-h1">Магазин</div>
              <div className="page-sub">Растения, горшки, уход</div>
            </div>

            <div className="cat-row">
              {CATS.map((c) => (
                <button
                  key={c}
                  className={`cat-btn ${cat === c ? "cat-on" : "cat-off"}`}
                  onClick={() => setCat(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="shop-grid">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="shop-card"
                  style={{ width: "auto" }}
                >
                  {item.hot && <div className="shop-hot">{item.hot}</div>}
                  <div
                    className="shop-ico"
                    style={{
                      background: item.bg,
                      width: 52,
                      height: 52,
                      borderRadius: 18
                    }}
                  >
                    {item.ico}
                  </div>
                  <div className="shop-name">{item.name}</div>
                  <div className="shop-cat">{item.cat}</div>
                  <div className="shop-foot">
                    <div className="shop-price">{item.price}</div>
                    <button
                      className="shop-plus"
                      onClick={() =>
                        setCart((c) =>
                          c.includes(item.id) ? c : [...c, item.id]
                        )
                      }
                    >
                      {cart.includes(item.id) ? "✓" : "+"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ height: 8 }} />
          </>
        )}

        {page === "cabinet" && (
          <>
            <div className="cab-wrap">
              <div className="profile-card">
                <div className="pc-top">
                  <div className="pc-av">{getInitials(user?.name)}</div>
                  <div>
                    <div className="pc-name">{user?.name || 'Клиент'}</div>
                    <div className="pc-since">
                      С нами с {new Date(user?.created_at || Date.now()).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div className="pc-plan">Стандарт</div>
                </div>
                <div className="pc-nums">
                  <div className="pcn">
                    <div className="pcn-n">8</div>
                    <div className="pcn-l">Растений</div>
                  </div>
                  <div className="pcn">
                    <div className="pcn-n">{schedule.length}</div>
                    <div className="pcn-l">Визитов</div>
                  </div>
                  <div className="pcn">
                    <div className="pcn-n">{reports.length}</div>
                    <div className="pcn-l">Отчётов</div>
                  </div>
                </div>
              </div>

              <div className="cab-tabs">
                {CTABS.map((t) => (
                  <button
                    key={t.id}
                    className={`cab-tab ${ctab === t.id ? "ct-on" : "ct-off"}`}
                    onClick={() => setCtab(t.id)}
                  >
                    {t.lbl}
                  </button>
                ))}
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#A09888' }}>Загрузка данных...</div>
              ) : (
                <>
                  {ctab === "sch" && (
                    schedule.length > 0 ? (
                      schedule.map((s) => {
                        const { day, mon } = formatScheduleDate(s.date);
                        return (
                          <div key={s.id} className="srow">
                            <div className="srow-date">
                              <div className="srow-d">{day}</div>
                              <div className="srow-m">{mon}</div>
                            </div>
                            <div className="srow-vl" />
                            <div className="srow-inf">
                              <div className="srow-svc">{s.service_type}</div>
                              <div className="srow-emp">{s.gardener_name || 'Не назначен'} · {s.time}</div>
                            </div>
                            <div className={`srow-bdg ${bdgCls(s.status)}`}>
                              {bdgLbl(s.status)}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#A09888' }}>График визитов пуст</div>
                    )
                  )}

                  {ctab === "pay" && (
                    <>
                      {payments.length > 0 ? (
                        payments.map((p, i) => (
                          <div key={i} className="prow">
                            <div>
                              <div className="prow-per">{p.period}</div>
                              <div className="prow-dt">{p.date}</div>
                            </div>
                            <div>
                              <div className="prow-amt">{p.amount}</div>
                              <div className={`prow-st ${p.ok ? "ps-ok" : "ps-due"}`}>
                                {p.ok ? "✓ Оплачено" : "⏳ Предстоит"}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#A09888' }}>История платежей пуста</div>
                      )}
                      <button
                        className="pay-btn"
                        style={{ marginTop: 6 }}
                        onClick={() => setSubPage("payment")}
                      >
                        Управление подпиской
                      </button>
                    </>
                  )}

                  {ctab === "rep" && (
                    reports.length > 0 ? (
                      reports.map((r) => (
                        <div
                          key={r.id}
                          className="rcard"
                          onClick={() => {
                            setActiveReport(r);
                            setSubPage("report-detail");
                          }}
                        >
                          <div className="rc-head">
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10
                              }}
                            >
                              <div className="rc-ico">🌿</div>
                              <div>
                                <div className="rc-ttl">{r.date}</div>
                                <div className="rc-by">{r.gardener_name}</div>
                              </div>
                            </div>
                            <div className="rc-phbdg">📸 {r.photos?.length || 0}</div>
                          </div>
                          <div className="rc-txt">{r.text.slice(0, 100)}…</div>
                          <div className="chips">
                            {r.plants?.map((p, i) => (
                              <div key={i} className="chip">
                                {p.name}: {p.status}
                              </div>
                            ))}
                          </div>
                          <div
                            style={{
                              marginTop: 10,
                              fontSize: 12,
                              color: "#4D9149",
                              fontWeight: 500
                            }}
                          >
                            Читать полностью →
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#A09888' }}>Отчёты отсутствуют</div>
                    )
                  )}
                </>
              )}

              <div className="mlist">
                {[
                  {
                    ico: "✏️",
                    bg: "#EAF3EA",
                    lbl: "Редактировать профиль",
                    action: () => setSubPage("profile-edit")
                  },
                  {
                    ico: "🔔",
                    bg: "#DDEEF8",
                    lbl: "Уведомления",
                    action: () => setSubPage("notifs")
                  },
                  {
                    ico: "💳",
                    bg: "#F0EBE2",
                    lbl: "Управление подпиской",
                    action: () => setSubPage("payment")
                  },
                  {
                    ico: "💬",
                    bg: "#DDEEF8",
                    lbl: "Поддержка",
                    action: () => alert("Поддержка откроется в Telegram")
                  },
                  {
                    ico: "⚙️",
                    bg: "#F5F2EC",
                    lbl: "Настройки",
                    action: () => alert("Настройки")
                  },
                  {
                    ico: "🚪",
                    bg: "#FFEEDD",
                    lbl: "Выйти",
                    action: onLogout || (() => alert("Выход из системы"))
                  }
                ].map((m, i) => (
                  <div
                    key={i}
                    className="mitem"
                    onClick={m.action}
                  >
                    <div
                      className="mitem-ico"
                      style={{ background: m.bg }}
                    >
                      {m.ico}
                    </div>
                    <div className="mitem-lbl">{m.lbl}</div>
                    <div className="mitem-arr">›</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      <div className="bnav">
        {TABS.map((t) => (
          <button
            key={t.id}
            className="nbtn"
            onClick={() => setPage(t.id)}
          >
            <div className={`nbtn-ic ${page === t.id ? "nic-on" : "nic-off"}`}>
              <span style={{ fontSize: 19 }}>{t.icon}</span>
            </div>
            <div className={`nbtn-lbl ${page === t.id ? "nlbl-on" : "nlbl-off"}`}>
              {t.lbl}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
