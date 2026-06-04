import React, { useState, useEffect, useRef } from 'react';
import '../styles/global.css';
import '../styles/website.css';
import { api } from '../utils/api';

export default function LandingPage({ onLoginSuccess }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authStep, setAuthStep] = useState('main'); // 'main' | 'tg-app' | 'phone-entry' | 'otp' | 'reg' | 'success'

  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Reg Form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');

  // Phone OTP Flow
  const [phoneNum, setPhoneNum] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(60);
  const [tgAuthStatus, setTgAuthStatus] = useState('Открыть Telegram');

  // Success details
  const [successName, setSuccessName] = useState('');
  const [successSub, setSuccessSub] = useState('');

  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef()];

  // Device detection
  useEffect(() => {
    const handleResize = () => {
      const ua = navigator.userAgent.toLowerCase();
      const w = window.innerWidth;
      const isIOS = /iphone|ipad|ipod/.test(ua);
      const isAndroid = /android/.test(ua);
      const mobileDevice = isIOS || isAndroid || w <= 900;
      setIsMobile(mobileDevice);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Timer for OTP
  useEffect(() => {
    let interval;
    if (authStep === 'otp' && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((t) => t - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [authStep, otpTimer]);

  // Scroll observer
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.style.opacity = '1';
            e.target.style.transform = 'none';
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(32px)';
      el.style.transition = `opacity .6s ${(i % 3) * 0.1}s ease, transform .6s ${(i % 3) * 0.1}s ease`;
      obs.observe(el);
    });

    return () => {
      elements.forEach((el) => obs.unobserve(el));
    };
  }, [isMobile]);

  // Navbar scrolled effect
  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('nav');
      if (nav) {
        nav.classList.toggle('scrolled', window.scrollY > 60);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
    setAuthStep('main');
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const simulateTgAuth = () => {
    setTgAuthStatus('⏳ Ожидаем подтверждения...');
    setTimeout(() => {
      setSuccessName('Добро пожаловать, Нуриддин!');
      setSuccessSub('Вход выполнен через Telegram');
      setAuthStep('success');
      setTimeout(() => {
        setIsModalOpen(false);
        onLoginSuccess('client_tg');
      }, 1000);
    }, 2000);
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      alert('Введите логин и пароль');
      return;
    }
    try {
      const data = await api.login(email, password);
      setSuccessName(`Добро пожаловать, ${data.user.name}!`);
      setSuccessSub('Вход выполнен через Email');
      setAuthStep('success');
      setTimeout(() => {
        setIsModalOpen(false);
        onLoginSuccess(data.user, data.token);
      }, 1000);
    } catch (err) {
      alert(err.message || 'Ошибка входа');
    }
  };

  const handleOtpLogin = () => {
    setSuccessName('Добро пожаловать!');
    setSuccessSub('Вход выполнен через номер телефона');
    setAuthStep('success');
    setTimeout(() => {
      setIsModalOpen(false);
      onLoginSuccess({ id: 999, name: 'Новый Клиент', role: 'client' }, 'mock_phone_token');
    }, 1000);
  };

  const handleRegister = async () => {
    if (!regEmail.trim() || !regPass.trim() || !regName.trim()) {
      alert('Заполните обязательные поля: Имя, Email и Пароль');
      return;
    }
    try {
      const data = await api.register(regEmail, regPass, regName, regPhone);
      setSuccessName(`Добро пожаловать, ${data.user.name}!`);
      setSuccessSub('Вход выполнен, аккаунт создан');
      setAuthStep('success');
      setTimeout(() => {
        setIsModalOpen(false);
        onLoginSuccess(data.user, data.token);
      }, 1000);
    } catch (err) {
      alert(err.message || 'Ошибка регистрации');
    }
  };

  const handleOtpChange = (val, i) => {
    const newOtp = [...otp];
    newOtp[i] = val.slice(-1);
    setOtp(newOtp);
    if (val && i < 4) {
      otpRefs[i + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs[i - 1].current.focus();
    }
  };

  // Render Mobile Landing View
  const renderMobileLanding = () => {
    return (
      <div className="landing">
        <div className="land-hero">
          <div className="land-glow" />
          <div className="land-grid" />
          <div className="land-deco">🌿</div>
          <div className="land-inner">
            <div className="land-logo">
              Flora<em>Care</em>
            </div>

            <div className="land-eyebrow">
              <div className="land-eyebrow-line" />
              <div className="land-eyebrow-text">Уход за растениями · Ташкент</div>
            </div>

            <h1 className="land-h1">
              Ваши растения
              <br />
              в <em>надёжных</em>
              <br />
              руках
            </h1>

            <p className="land-p">
              Профессиональный уход по подписке. Полив, удобрение, диагностика — фотоотчёт после каждого визита.
            </p>

            <button className="land-login-btn" onClick={openModal}>
              Войти в кабинет
              <span className="land-btn-arr">→</span>
            </button>

            <div className="land-services">
              <span className="land-svc-tag">💧 Полив</span>
              <span className="land-svc-tag">🌿 Удобрение</span>
              <span className="land-svc-tag">✂️ Обрезка</span>
              <span className="land-svc-tag">🔬 Диагностика</span>
              <span className="land-svc-tag">📸 Фотоотчёт</span>
            </div>

            <div className="land-stats">
              <div className="land-stat">
                <div className="land-stat-n">10к+</div>
                <div className="land-stat-l">Клиентов</div>
              </div>
              <div className="land-stat">
                <div className="land-stat-n">5 лет</div>
                <div className="land-stat-l">На рынке</div>
              </div>
              <div className="land-stat">
                <div className="land-stat-n">98%</div>
                <div className="land-stat-l">Довольных</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Desktop Website View
  const renderDesktopWebsite = () => {
    return (
      <div>
        <nav className="nav" id="nav">
          <a href="#" className="nav-logo">
            Flora<em>Care</em>
          </a>
          <div className="nav-links">
            <a href="#services">Услуги</a>
            <a href="#how">Как работает</a>
            <a href="#tariffs">Тарифы</a>
            <a href="#reviews">Отзывы</a>
          </div>
          <div className="nav-right">
            <button className="nav-login" onClick={openModal}>
              Войти
            </button>
            <button className="nav-cta-btn" onClick={openModal}>
              Начать →
            </button>
          </div>
        </nav>

        <section className="hero" id="home">
          <div className="hero-mesh" />
          <div className="hero-grid-lines" />
          <div className="hero-deco">🌿</div>

          <div className="hero-inner">
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line" />
              <div className="hero-eyebrow-text">Уход за растениями по подписке</div>
            </div>
            <h1 className="hero-h1">
              Ваши
              <br />
              растения
              <br />
              <em>процветают</em>
            </h1>
            <p className="hero-desc">
              FloraCare — команда профессиональных садовников, которые ухаживают за вашими растениями дома и в офисе. Подписка. Фотоотчёт. Результат.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={openModal}>
                Подключиться сейчас
                <span className="arr">→</span>
              </button>
              <a href="#how" className="btn-ghost">
                Как это работает
              </a>
            </div>
          </div>

          <div className="hero-scroll">
            <div className="hero-scroll-track">
              <div className="hero-scroll-dot" />
            </div>
            <div className="hero-scroll-label">Scroll</div>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-n">10 000+</div>
              <div className="hero-stat-l">Клиентов</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">98%</div>
              <div className="hero-stat-l">Довольны</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-n">47 000</div>
              <div className="hero-stat-l">Визитов</div>
            </div>
          </div>
        </section>

        <div className="marquee-wrap">
          <div className="marquee-track" id="marquee">
            {[1, 2].map((groupKey) => (
              <React.Fragment key={groupKey}>
                <div className="marquee-item">
                  <div className="marquee-dot" />
                  Профессиональный уход
                </div>
                <div className="marquee-item">
                  <div className="marquee-dot" />
                  Фотоотчёт после визита
                </div>
                <div className="marquee-item">
                  <div className="marquee-dot" />
                  Личный кабинет
                </div>
                <div className="marquee-item">
                  <div className="marquee-dot" />
                  3 тарифа
                </div>
                <div className="marquee-item">
                  <div className="marquee-dot" />
                  10 000+ клиентов
                </div>
                <div className="marquee-item">
                  <div className="marquee-dot" />
                  Магазин растений
                </div>
                <div className="marquee-item">
                  <div className="marquee-dot" />
                  Диагностика болезней
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>

        <section className="section services-section" id="services">
          <div className="services-header">
            <div>
              <div className="s-eyebrow">
                <div className="s-eyebrow-line" />
                <div className="s-eyebrow-text">Что мы делаем</div>
              </div>
              <h2 class="s-title">
                Полный комплекс
                <br />
                <em>ухода</em>
              </h2>
            </div>
            <p className="s-sub">
              Всё необходимое для здоровья и красоты ваших растений — от базового полива до диагностики болезней.
            </p>
          </div>
          <div className="services-grid" id="svcs">
            <div className="svc reveal">
              <span className="svc-num">01</span>
              <span className="svc-ico">💧</span>
              <div className="svc-name">Полив</div>
              <div className="svc-desc">
                Индивидуальный режим для каждого растения с учётом вида, сезона и условий содержания.
              </div>
            </div>
            <div className="svc reveal">
              <span className="svc-num">02</span>
              <span className="svc-ico">🌿</span>
              <div className="svc-name">Удобрение</div>
              <div className="svc-desc">
                Профессиональный подбор питания по сезону, виду и текущему состоянию растения.
              </div>
            </div>
            <div className="svc reveal">
              <span className="svc-num">03</span>
              <span className="svc-ico">✂️</span>
              <div className="svc-name">Обрезка</div>
              <div className="svc-desc">
                Формирование кроны и санитарная обрезка для здорового роста и эстетического вида.
              </div>
            </div>
            <div className="svc reveal">
              <span className="svc-num">04</span>
              <span className="svc-ico">🪴</span>
              <div className="svc-name">Пересадка</div>
              <div className="svc-desc">
                В правильный горшок с подходящим грунтом — в нужное время года.
              </div>
            </div>
            <div className="svc reveal">
              <span className="svc-num">05</span>
              <span className="svc-ico">🔬</span>
              <div className="svc-name">Диагностика</div>
              <div className="svc-desc">
                Раннее выявление болезней, вредителей и дефицита питательных веществ.
              </div>
            </div>
            <div className="svc reveal">
              <span className="svc-num">06</span>
              <span className="svc-ico">📸</span>
              <div className="svc-name">Фотоотчёт</div>
              <div className="svc-desc">
                После каждого визита — подробный отчёт с фото и рекомендациями прямо в приложение.
              </div>
            </div>
          </div>
        </section>

        <section className="section how-section" id="how">
          <div className="s-eyebrow">
            <div className="s-eyebrow-line" />
            <div className="s-eyebrow-text">Как это работает</div>
          </div>
          <h2 className="s-title">
            Четыре шага
            <br />
            до <em>результата</em>
          </h2>
          <div className="how-layout">
            <div className="how-steps">
              <div className="how-step reveal">
                <div className="how-n">01</div>
                <div>
                  <div className="how-step-h">Выберите тариф</div>
                  <div className="how-step-p">
                    Лайт, Стандарт или Макс — от 1 до 4 визитов в месяц. Подходит для квартиры, дома, офиса или кафе.
                  </div>
                </div>
              </div>
              <div className="how-step reveal">
                <div className="how-n">02</div>
                <div>
                  <div className="how-step-h">Согласуем расписание</div>
                  <div className="how-step-p">
                    Менеджер свяжется и составит удобное расписание визитов. Вы выбираете удобное время.
                  </div>
                </div>
              </div>
              <div className="how-step reveal">
                <div className="how-n">03</div>
                <div>
                  <div className="how-step-h">Специалист приедет</div>
                  <div className="how-step-p">
                    Наш сертифицированный садовник выполнит все работы по уходу профессиональным оборудованием.
                  </div>
                </div>
              </div>
              <div className="how-step reveal">
                <div className="how-n">04</div>
                <div>
                  <div className="how-step-h">Получите фотоотчёт</div>
                  <div className="how-step-p">
                    Подробный отчёт с фото и рекомендациями — прямо в приложении, сразу после визита.
                  </div>
                </div>
              </div>
            </div>
            <div className="how-phone">
              <div className="phone-frame">
                <div className="phone-inner">
                  <div className="p-status">
                    <div className="p-logo">
                      Flora<em>Care</em>
                    </div>
                    <span style={{ fontSize: 15 }}>🔔</span>
                  </div>
                  <div style={{ padding: '8px 8px 0' }}>
                    <div className="p-hero-block">
                      <div className="p-hero-eyebrow">Следующий визит</div>
                      <div className="p-hero-h">
                        Ваши растения
                        <br />в <em>надёжных</em> руках
                      </div>
                      <div className="p-cta-pill">
                        Смотреть график <span>→</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-cards">
                    <div className="p-card">
                      <div className="p-card-ico" style={{ background: '#152415' }}>
                        📅
                      </div>
                      <div>
                        <div className="p-card-title">15 мая · 10:00</div>
                        <div className="p-card-sub">Полив и осмотр · Мария К.</div>
                      </div>
                      <div className="p-card-badge">Скоро</div>
                    </div>
                    <div className="p-card">
                      <div className="p-card-ico" style={{ background: '#151520' }}>
                        📸
                      </div>
                      <div>
                        <div className="p-card-title">Новый фотоотчёт</div>
                        <div className="p-card-sub">4 фото · 17 апреля</div>
                      </div>
                      <div className="p-card-badge">Новый</div>
                    </div>
                    <div className="p-card">
                      <div className="p-card-ico" style={{ background: '#201515' }}>
                        💳
                      </div>
                      <div>
                        <div className="p-card-title">Июнь 2025</div>
                        <div className="p-card-sub">990 000 сум · 1 июня</div>
                      </div>
                      <div
                        style={{
                          marginLeft: 'auto',
                          background: 'rgba(201,151,62,.12)',
                          color: '#C4973E',
                          fontSize: 8,
                          fontWeight: 600,
                          padding: '3px 9px',
                          borderRadius: 12,
                          flexShrink: 0
                        }}
                      >
                        Скоро
                      </div>
                    </div>
                  </div>
                  <div className="p-nav">
                    <div className="p-nav-item on">
                      <div className="p-nav-ic on">🏠</div>
                      <div className="p-nav-label" style={{ color: '#4E9E4A' }}>
                        Главная
                      </div>
                    </div>
                    <div className="p-nav-item off">
                      <div className="p-nav-ic">⭐</div>
                      <div className="p-nav-label" style={{ color: '#2A4A2A' }}>
                        Тарифы
                      </div>
                    </div>
                    <div className="p-nav-item off">
                      <div className="p-nav-ic">🛍</div>
                      <div className="p-nav-label" style={{ color: '#2A4A2A' }}>
                        Магазин
                      </div>
                    </div>
                    <div className="p-nav-item off">
                      <div className="p-nav-ic">👤</div>
                      <div className="p-nav-label" style={{ color: '#2A4A2A' }}>
                        Кабинет
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section tariffs-section" id="tariffs">
          <div className="s-eyebrow">
            <div className="s-eyebrow-line" />
            <div className="s-eyebrow-text">Тарифы</div>
          </div>
          <h2 className="s-title">
            Выберите свой
            <br />
            <em>план ухода</em>
          </h2>
          <p className="s-sub">Первый месяц — скидка 20% при онлайн-оплате. Отменить можно в любое время.</p>
          <div className="tariffs-grid">
            <div className="tc tc-a reveal">
              <div className="tc-name">Лайт</div>
              <div className="tc-freq">1 визит в месяц · до 5 растений</div>
              <div className="tc-price">
                720 000 <span className="tc-mo">сум/мес</span>
              </div>
              <div className="tc-div" />
              <div className="tc-feats">
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Осмотр растений
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Базовый полив
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Консультация
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Фотоотчёт
                </div>
              </div>
              <button className="tc-btn" onClick={openModal}>
                Подключить Лайт
              </button>
            </div>
            <div className="tc tc-b reveal">
              <div className="tc-pop-tag">Популярный</div>
              <div className="tc-name">Стандарт</div>
              <div className="tc-freq">2 визита в месяц · до 15 растений</div>
              <div className="tc-price">
                990 000 <span className="tc-mo">сум/мес</span>
              </div>
              <div className="tc-div" />
              <div className="tc-feats">
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Осмотр и диагностика
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Полив и удобрение
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Пересадка при необходимости
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Консультация 24/7
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Фотоотчёт
                </div>
              </div>
              <button className="tc-btn" onClick={openModal}>
                Подключить Стандарт
              </button>
            </div>
            <div className="tc tc-c reveal">
              <div className="tc-name">Макс</div>
              <div className="tc-freq">4 визита в месяц · без ограничений</div>
              <div className="tc-price">
                1 490 000 <span className="tc-mo">сум/мес</span>
              </div>
              <div className="tc-div" />
              <div className="tc-feats">
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Полный уход и мониторинг
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Пересадка включена
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Лечение болезней
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Персональный агроном
                </div>
                <div className="tc-feat">
                  <div className="tc-chk">✓</div>Приоритетный фотоотчёт
                </div>
              </div>
              <button className="tc-btn" onClick={openModal}>
                Подключить Макс
              </button>
            </div>
          </div>
        </section>

        <section className="section proof-section" id="reviews">
          <div className="s-eyebrow">
            <div className="s-eyebrow-line" />
            <div className="s-eyebrow-text">Отзывы</div>
          </div>
          <h2 className="s-title">
            Нам доверяют
            <br />
            <em>10 000+</em> клиентов
          </h2>
          <div className="proof-grid">
            <div className="proof-card reveal">
              <div className="proof-stars">★★★★★</div>
              <div className="proof-text">
                «После каждого визита приходит <strong>подробный фотоотчёт</strong> — видно как чувствует себя каждое растение. Наконец-то спокоен за своих зелёных питомцев.»
              </div>
              <div className="proof-author">
                <div className="proof-av" style={{ background: '#1A3020' }}>
                  АП
                </div>
                <div>
                  <div className="proof-name">Алексей Петров</div>
                  <div className="proof-plan">Тариф Стандарт · Москва</div>
                </div>
              </div>
            </div>
            <div className="proof-card reveal">
              <div className="proof-stars">★★★★★</div>
              <div className="proof-text">
                «Мария — <strong>настоящий профессионал</strong>. Monstera расцвела буквально за месяц. До FloraCare я уже была готова её выбросить. Теперь советую всем!»
              </div>
              <div className="proof-author">
                <div className="proof-av" style={{ background: '#1A2040' }}>
                  ЕС
                </div>
                <div>
                  <div className="proof-name">Елена Смирнова</div>
                  <div className="proof-plan">Тариф Макс · Санкт-Петербург</div>
                </div>
              </div>
            </div>
            <div className="proof-card reveal">
              <div className="proof-stars">★★★★★</div>
              <div className="proof-text">
                «Подключили для нашего офиса — 45 растений. <strong>Коллеги в восторге</strong>, гости замечают разницу. Приложение удобное, всегда знаем что происходит.»
              </div>
              <div className="proof-author">
                <div className="proof-av" style={{ background: '#2A1A10' }}>
                  ЗО
                </div>
                <div>
                  <div className="proof-name">ООО «Зелёный офис»</div>
                  <div className="proof-plan">Тариф Макс · Корпоративный</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="cta-section">
          <div className="cta-glow" />
          <div className="cta-deco-l">🌿</div>
          <div className="cta-deco-r">🌿</div>
          <div className="cta-eyebrow">
            <div className="s-eyebrow-line" />
            <div className="s-eyebrow-text">Начните сегодня</div>
          </div>
          <h2 className="cta-h">
            Первый месяц
            <br />
            со скидкой <em>20%</em>
          </h2>
          <p className="cta-sub">Подключитесь сейчас — специалист приедет уже на этой неделе. Отменить можно в любое время.</p>
          <div className="cta-btns">
            <button className="btn-primary" onClick={openModal} style={{ fontSize: 15, padding: '18px 40px' }}>
              Подключиться со скидкой
              <span className="arr" style={{ width: 30, height: 30 }}>
                →
              </span>
            </button>
            <a href="tel:+78001234567" className="btn-ghost" style={{ fontSize: 15 }}>
              📞 +7 800 123-45-67
            </a>
          </div>
        </div>

        <footer className="footer">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">
                Flora<em>Care</em>
              </div>
              <p className="footer-brand-desc">
                Профессиональный уход за растениями по подписке. Работаем с 2020 года. Более 10 000 довольных клиентов по всей России.
              </p>
              <div className="footer-social">
                <a href="#" className="footer-social-btn">
                  📱
                </a>
                <a href="#" className="footer-social-btn">
                  ✈️
                </a>
                <a href="#" className="footer-social-btn">
                  📸
                </a>
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Компания</div>
              <a href="#">О нас</a>
              <a href="#">Команда</a>
              <a href="#">Вакансии</a>
              <a href="#">Блог</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Услуги</div>
              <a href="#">Полив</a>
              <a href="#">Удобрение</a>
              <a href="#">Пересадка</a>
              <a href="#">Диагностика</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Контакты</div>
              <a href="tel:+78001234567">+7 800 123-45-67</a>
              <a href="mailto:hi@floracare.ru">hi@floracare.ru</a>
              <a href="#">Telegram</a>
              <a href="#">Instagram</a>
            </div>
          </div>
          <div className="footer-bottom">
            <div className="footer-copy">© 2025 FloraCare. Все права защищены.</div>
            <div className="footer-legal">
              <a href="#">Конфиденциальность</a>
              <a href="#">Оферта</a>
            </div>
          </div>
        </footer>
      </div>
    );
  };

  return (
    <div className={isMobile ? 'mode-mobile' : 'mode-desktop'}>
      {isMobile ? renderMobileLanding() : renderDesktopWebsite()}

      {isModalOpen && (
        <div
          className="overlay"
          style={{ display: 'flex' }}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="modal" style={{ padding: 36, maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="modal-x" onClick={closeModal}>
              ✕
            </button>

            {authStep === 'main' && (
              <div className="tg-step active">
                <div className="modal-logo">
                  Flora<em>Care</em>
                </div>
                <div className="modal-tagline">Войдите или зарегистрируйтесь</div>
                <button className="modal-tg" onClick={() => setAuthStep('tg-app')}>
                  <span className="tg-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.246l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.83.947-.001.001-.001.002-.002.003-.001 0-.001 0 0 0l-.53.363z" />
                    </svg>
                  </span>
                  Войти через Telegram
                </button>
                <button className="modal-tg-phone" onClick={() => setAuthStep('phone-entry')}>
                  📱 &nbsp;Войти по номеру телефона
                </button>
                <div className="divider-text">или</div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@mail.ru"
                  />
                </div>
                <div className="field">
                  <label>Пароль</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
                <button className="modal-submit" onClick={handleLogin}>
                  Войти
                </button>
                <div style={{ textAlign: 'center', marginTop: 14 }}>
                  <span style={{ fontSize: 12, color: 'var(--cream-muted)' }}>Нет аккаунта? </span>
                  <span
                    style={{ fontSize: 12, color: 'var(--green-light)', cursor: 'pointer', fontWeight: 500 }}
                    onClick={() => setAuthStep('reg')}
                  >
                    Зарегистрироваться →
                  </span>
                </div>
              </div>
            )}

            {authStep === 'tg-app' && (
              <div className="tg-step active">
                <button className="tg-back" onClick={() => setAuthStep('main')}>
                  ← Назад
                </button>
                <div className="tg-big-icon">✈️</div>
                <div className="tg-title">Войти через Telegram</div>
                <div className="tg-desc">
                  Нажмите кнопку ниже — откроется Telegram.
                  <br />
                  Бот <strong>@FloraCareBot</strong> пришлёт вам код подтверждения.
                </div>
                <div className="tg-widget-wrap">
                  <div className="tg-widget-title">Нажмите кнопку и подтвердите в Telegram — это займёт 10 секунд</div>
                  <button className="tg-open-btn" onClick={simulateTgAuth}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.246l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.83.947l-.53.363z" />
                    </svg>
                    {tgAuthStatus}
                  </button>
                  <div className="tg-bot-name">@FloraCareBot</div>
                </div>
                <div className="modal-hint">
                  <strong>Как это работает:</strong> Telegram подтверждает вашу личность без пароля. Безопасно и быстро. Ваш аккаунт создаётся автоматически.
                </div>
              </div>
            )}

            {authStep === 'phone-entry' && (
              <div className="tg-step active">
                <button className="tg-back" onClick={() => setAuthStep('main')}>
                  ← Назад
                </button>
                <div className="tg-big-icon">📱</div>
                <div className="tg-title">Номер телефона</div>
                <div className="tg-desc">
                  Введите номер — мы отправим код
                  <br />в SMS или через <strong>Telegram</strong>
                </div>
                <div className="phone-input-wrap">
                  <div className="phone-flag">🇺🇿</div>
                  <div className="phone-code">+998</div>
                  <input
                    className="phone-field"
                    type="tel"
                    value={phoneNum}
                    onChange={(e) => setPhoneNum(e.target.value)}
                    placeholder="90 123 45 67"
                    maxLength={12}
                  />
                </div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <button className="modal-tg" style={{ flex: 1, padding: 12 }} onClick={() => setAuthStep('otp')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.246l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.83.947l-.53.363z" />
                    </svg>
                    Telegram
                  </button>
                  <button className="modal-tg-phone" style={{ flex: 1, padding: 12, marginTop: 0 }} onClick={() => setAuthStep('otp')}>
                    💬 SMS
                  </button>
                </div>
                <div className="modal-hint">
                  <strong>Совет:</strong> Если у вас есть Telegram, код придёт туда мгновенно и бесплатно.
                </div>
              </div>
            )}

            {authStep === 'otp' && (
              <div className="tg-step active">
                <button className="tg-back" onClick={() => setAuthStep('phone-entry')}>
                  ← Назад
                </button>
                <div className="tg-big-icon">🔐</div>
                <div className="tg-title">Код подтверждения</div>
                <div className="tg-desc">
                  Введите 5-значный код,
                  <br />
                  отправленный на <strong>+998 {phoneNum || '•• ••• •• ••'}</strong>
                </div>
                <div className="otp-row">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      className="otp-box"
                      maxLength={1}
                      value={otp[i]}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    />
                  ))}
                </div>
                <div className="otp-resend">
                  Не получили код?{' '}
                  <span onClick={() => setOtpTimer(60)}>Отправить снова</span>{' '}
                  <span id="otp-timer">{otpTimer > 0 ? `(через ${otpTimer} сек)` : ''}</span>
                </div>
                <button className="modal-submit" onClick={handleOtpLogin}>
                  Подтвердить
                </button>
              </div>
            )}

            {authStep === 'reg' && (
              <div className="tg-step active">
                <button className="tg-back" onClick={() => setAuthStep('main')}>
                  ← Назад
                </button>
                <div className="tg-title" style={{ textAlign: 'center', marginBottom: 6 }}>
                  Регистрация
                </div>
                <div className="tg-desc">Создайте аккаунт FloraCare</div>
                <button className="modal-tg" onClick={() => setAuthStep('tg-app')} style={{ marginBottom: 10 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.88 13.246l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.83.947l-.53.363z" />
                  </svg>
                  Зарегистрироваться через Telegram
                </button>
                <button className="modal-tg-phone" onClick={() => setAuthStep('phone-entry')}>
                  📱 Через номер телефона
                </button>
                <div className="divider-text">или вручную</div>
                <div className="field">
                  <label>Имя и фамилия</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Нуриддин Хасанов"
                  />
                </div>
                <div className="field">
                  <label>Телефон</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+998 90 123 45 67"
                  />
                </div>
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="example@mail.ru"
                  />
                </div>
                <div className="field">
                  <label>Пароль</label>
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Минимум 8 символов"
                  />
                </div>
                <button className="modal-submit" onClick={handleRegister}>
                  Создать аккаунт
                </button>
              </div>
            )}

            {authStep === 'success' && (
              <div className="tg-step active">
                <div className="tg-success">
                  <div className="tg-success-icon">🎉</div>
                  <div className="tg-success-name">{successName}</div>
                  <div className="tg-success-sub">{successSub}</div>
                  <button className="tg-continue-btn" onClick={closeModal}>
                    Перейти в кабинет →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
