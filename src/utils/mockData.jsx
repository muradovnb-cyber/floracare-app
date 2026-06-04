import React from 'react';

export const SERVICES = [
  {
    icon: "💧",
    bg: "#DCF0DC",
    name: "Полив",
    desc: "По сезону и виду"
  },
  {
    icon: "✂️",
    bg: "#FFF0DC",
    name: "Обрезка",
    desc: "Формирование кроны"
  },
  {
    icon: "🪴",
    bg: "#FFE8D8",
    name: "Пересадка",
    desc: "В нужный горшок"
  },
  {
    icon: "🔬",
    bg: "#EDD8FF",
    name: "Диагностика",
    desc: "Болезни, вредители"
  },
  {
    icon: "📸",
    bg: "#FFEDD8",
    name: "Фотоотчёт",
    desc: "После каждого визита"
  }
];

export const TARIFFS = [
  {
    cls: "tc-l",
    name: "Лайт",
    freq: "1 визит в месяц",
    price: "720 000",
    mo: "сум / мес",
    pop: false,
    feats: ["Осмотр растений", "Базовый полив", "Консультация", "Фотоотчёт"],
    btn: "Подключить Лайт"
  },
  {
    cls: "tc-s",
    name: "Стандарт",
    freq: "2 визита в месяц",
    price: "990 000",
    mo: "сум / мес",
    pop: true,
    feats: ["Осмотр и диагностика", "Полив и удобрение", "Пересадка при необходимости", "Консультация 24/7", "Фотоотчёт"],
    btn: "Подключить Стандарт"
  },
  {
    cls: "tc-m",
    name: "Макс",
    freq: "4 визита в месяц",
    price: "1 490 000",
    mo: "сум / мес",
    pop: false,
    feats: ["Полный уход и мониторинг", "Пересадка включена", "Лечение болезней", "Персональный агроном", "Приоритетный фотоотчёт"],
    btn: "Подключить Макс"
  }
];

export const SHOP = [
  {
    id: 1,
    ico: "🌿",
    bg: "#DCF0DC",
    name: "Monstera Deliciosa",
    cat: "Растения",
    price: "2 800 ₽",
    hot: "Хит"
  },
  {
    id: 2,
    ico: "🏺",
    bg: "#FFF0DC",
    name: "Горшок керамика 20 см",
    cat: "Горшки",
    price: "890 ₽",
    hot: ""
  },
  {
    id: 3,
    ico: "💧",
    bg: "#DDEEF8",
    name: "Капельный полив 5 л",
    cat: "Полив",
    price: "1 290 ₽",
    hot: "Новинка"
  },
  {
    id: 4,
    ico: "🌱",
    bg: "#DCF0DC",
    name: "Удобрение универсал",
    cat: "Удобрения",
    price: "450 ₽",
    hot: ""
  },
  {
    id: 5,
    ico: "🧺",
    bg: "#FFE8D8",
    name: "Кашпо плетёное",
    cat: "Горшки",
    price: "1 100 ₽",
    hot: "Хит"
  },
  {
    id: 6,
    ico: "🌻",
    bg: "#FFF0DC",
    name: "Helianthus annuus",
    cat: "Растения",
    price: "1 600 ₽",
    hot: ""
  }
];

export const SCHEDULE = [
  {
    id: 1,
    day: "15",
    mon: "МАЙ",
    svc: "Полив и осмотр",
    emp: "Мария К. · 10:00",
    status: "s"
  },
  {
    id: 2,
    day: "29",
    mon: "МАЙ",
    svc: "Удобрение",
    emp: "Мария К. · 10:00",
    status: "p"
  },
  {
    id: 3,
    day: "12",
    mon: "ИЮН",
    svc: "Полив и осмотр",
    emp: "Дмитрий В. · 11:00",
    status: "p"
  },
  {
    id: 4,
    day: "26",
    mon: "ИЮН",
    svc: "Комплексный уход",
    emp: "Мария К. · 09:30",
    status: "p"
  }
];

export const PAYMENTS = [
  {
    period: "Апрель 2025",
    date: "1 апр 2025",
    amt: "990 000 сум",
    ok: true
  },
  {
    period: "Май 2025",
    date: "1 мая 2025",
    amt: "990 000 сум",
    ok: true
  },
  {
    period: "Июнь 2025",
    date: "1 июн 2025",
    amt: "990 000 сум",
    ok: false
  }
];

export const REPORTS = [
  {
    id: 1,
    date: "17 апреля 2025",
    emp: "Мария К.",
    text: "Все растения в отличном состоянии. Выполнен плановый полив и внесение комплексного удобрения. Monstera deliciosa показывает активный рост — появился новый лист.",
    photos: ["🌿", "🪴", "🌱", "💧"],
    plants: [
      {
        name: "Monstera deliciosa",
        status: "Отлично"
      },
      {
        name: "Ficus lyrata",
        status: "Хорошо"
      },
      {
        name: "Pothos",
        status: "Отлично"
      }
    ],
    rec: "Продолжайте текущий режим полива. Пересадка Monstera рекомендована через 2 месяца."
  },
  {
    id: 2,
    date: "3 апреля 2025",
    emp: "Дмитрий В.",
    text: "Выполнен плановый полив. Обнаружен лёгкий хлороз у Ficus lyrata — рекомендовано добавить железосодержащее удобрение. Остальные растения в норме.",
    photos: ["🌳", "🍃", "🌺", "🌾"],
    plants: [
      {
        name: "Ficus lyrata",
        status: "Требует внимания"
      },
      {
        name: "Sansevieria",
        status: "Отлично"
      },
      {
        name: "ZZ Plant",
        status: "Хорошо"
      }
    ],
    rec: "Добавьте железосодержащее удобрение для Ficus lyrata. Следующий осмотр через 2 недели."
  }
];

export const NOTIFS = [
  {
    id: 1,
    icon: "📅",
    bg: "#EAF3EA",
    title: "Визит послезавтра",
    text: "Мария К. придёт 15 мая в 10:00. Полив и осмотр растений.",
    time: "Сегодня, 09:00",
    unread: true
  },
  {
    id: 2,
    icon: "📸",
    bg: "#F0EBE2",
    title: "Новый фотоотчёт",
    text: "Дмитрий В. отправил отчёт о визите 3 апреля. 4 фотографии.",
    time: "3 апр, 17:30",
    unread: true
  },
  {
    id: 3,
    icon: "💳",
    bg: "#DDEEF8",
    title: "Списание 1 июня",
    text: "Запланировано списание 990 000 сум за тариф Стандарт.",
    time: "1 апр, 10:00",
    unread: false
  },
  {
    id: 4,
    icon: "🌿",
    bg: "#DCF0DC",
    title: "Совет по уходу",
    text: "Сейчас самое время подкормить растения — весенний сезон активного роста.",
    time: "28 мар, 12:00",
    unread: false
  },
  {
    id: 5,
    icon: "⭐",
    bg: "#FFF0DC",
    title: "Оцените визит",
    text: "Как прошёл визит Марии К.? Оставьте оценку — это важно для нас.",
    time: "18 апр, 11:00",
    unread: false
  }
];

export const OB_SLIDES = [
  {
    bg: "linear-gradient(145deg,#18281A,#2D5020)",
    emoji: "🌿",
    step: "01 / 03",
    h: <>Добро пожаловать в <em>FloraCare</em></>,
    p: "Профессиональный уход за вашими растениями. Мы заботимся о них, пока вы занимаетесь своими делами.",
    btn: "Начать",
    pip: "Пропустить"
  },
  {
    bg: "linear-gradient(145deg,#1A1E28,#252D3A)",
    emoji: "📅",
    step: "02 / 03",
    h: <>Удобный <em>график</em> и отчёты</>,
    p: "После каждого визита наш специалист отправит вам фотоотчёт прямо в приложение. Вы всегда будете знать, как чувствуют себя растения.",
    btn: "Далее",
    pip: "Пропустить"
  },
  {
    bg: "linear-gradient(145deg,#281A18,#3A2820)",
    emoji: "⭐",
    step: "03 / 03",
    h: <>Выберите <em>тариф</em> и начните</>,
    p: "Три тарифа на любой случай — от 1 до 4 визитов в месяц. Начните сегодня и получите первый месяц со скидкой 20%.",
    btn: "Выбрать тариф",
    pip: null
  }
];

export const CATS = ["Все", "Растения", "Горшки", "Полив", "Удобрения"];

export const PAY_METHODS = [
  {
    id: "card",
    icon: "💳",
    bg: "#DDEEF8",
    name: "Банковская карта",
    desc: "Visa, Mastercard, МИР"
  },
  {
    id: "sbp",
    icon: "⚡",
    bg: "#EAF3EA",
    name: "СБП",
    desc: "Оплата по QR-коду"
  },
  {
    id: "apple",
    icon: "🍎",
    bg: "#F5F2EC",
    name: "Apple Pay",
    desc: "Touch ID или Face ID"
  }
];

export const USERS = [
  {
    id: 1,
    name: "Мария Козлова",
    short: "МК",
    role: "gardener",
    login: "maria",
    password: "123",
    avatar: "#4A8A5A"
  },
  {
    id: 2,
    name: "Дмитрий Волков",
    short: "ДВ",
    role: "gardener",
    login: "dmitry",
    password: "123",
    avatar: "#3A7A6A"
  },
  {
    id: 3,
    name: "Анна Сергеева",
    short: "АС",
    role: "gardener",
    login: "anna",
    password: "123",
    avatar: "#5A6A8A"
  },
  {
    id: 4,
    name: "Нуриддин",
    short: "НУ",
    role: "admin",
    login: "admin",
    password: "admin",
    avatar: "#2D5A3D",
    fullTitle: "Генеральный директор",
    email: "nuriddin@floracare.uz",
    phone: "+998 90 123-45-67",
    permissions: ["dashboard", "visits", "reports", "employees", "clients", "settings", "finance", "analytics"]
  },
  {
    id: 5,
    name: "Нуриддин (Admin 1)",
    short: "Н1",
    role: "admin",
    login: "admin1",
    password: "admin1",
    avatar: "#3A4A8A",
    fullTitle: "Операционный директор",
    email: "admin1@floracare.uz",
    phone: "+998 90 765-43-21",
    permissions: ["dashboard", "visits", "reports", "employees", "clients"]
  }
];

export const INIT_VISITS = [
  {
    id: 1,
    clientId: 1,
    clientName: "Алексей Петров",
    address: "ул. Садовая, 12, кв. 34",
    date: "15 мая",
    time: "10:00",
    assignedTo: 1,
    service: "Полив и осмотр",
    status: "pending",
    report: null,
    photos: [],
    reportApproved: false
  },
  {
    id: 2,
    clientId: 2,
    clientName: "Елена Смирнова",
    address: "пр. Ленина, 45, оф. 12",
    date: "15 мая",
    time: "12:30",
    assignedTo: 1,
    service: "Удобрение и пересадка",
    status: "pending",
    report: null,
    photos: [],
    reportApproved: false
  },
  {
    id: 3,
    clientId: 3,
    clientName: "ООО «Зелёный офис»",
    address: "БЦ Альфа, 5 этаж",
    date: "14 мая",
    time: "15:00",
    assignedTo: 2,
    service: "Комплексный уход",
    status: "done",
    report: "Все растения в отличном состоянии. Выполнен полив, удобрение. У Ficus лёгкий хлороз — рекомендую железо.",
    photos: ["🌿", "🪴", "🌱", "💧"],
    reportApproved: false
  },
  {
    id: 4,
    clientId: 4,
    clientName: "Ирина Волкова",
    address: "ул. Цветочная, 8, кв. 2",
    date: "15 мая",
    time: "09:00",
    assignedTo: 2,
    service: "Полив и диагностика",
    status: "pending",
    report: null,
    photos: [],
    reportApproved: false
  },
  {
    id: 5,
    clientId: 1,
    clientName: "Алексей Петров",
    address: "ул. Садовая, 12, кв. 34",
    date: "29 мая",
    time: "10:00",
    assignedTo: 1,
    service: "Удобрение",
    status: "scheduled",
    report: null,
    photos: [],
    reportApproved: false
  },
  {
    id: 6,
    clientId: 5,
    clientName: "Кафе «Листья»",
    address: "Невский пр., 110",
    date: "16 мая",
    time: "08:00",
    assignedTo: 3,
    service: "Еженедельный уход",
    status: "pending",
    report: null,
    photos: [],
    reportApproved: false
  }
];

export const CLIENTS = [
  {
    id: 1,
    name: "Алексей Петров",
    plan: "Стандарт",
    plants: 8,
    phone: "+7 900 123-45-67",
    since: "Март 2025"
  },
  {
    id: 2,
    name: "Елена Смирнова",
    plan: "Макс",
    plants: 22,
    phone: "+7 911 234-56-78",
    since: "Январь 2025"
  },
  {
    id: 3,
    name: "ООО «Зелёный офис»",
    plan: "Макс",
    plants: 45,
    phone: "+7 495 000-11-22",
    since: "Сентябрь 2024"
  },
  {
    id: 4,
    name: "Ирина Волкова",
    plan: "Лайт",
    plants: 4,
    phone: "+7 926 345-67-89",
    since: "Апрель 2025"
  },
  {
    id: 5,
    name: "Кафе «Листья»",
    plan: "Макс",
    plants: 30,
    phone: "+7 812 111-22-33",
    since: "Февраль 2025"
  }
];

export const EMOJIS_STAFF = ["🌿", "🪴", "🌱", "💧", "🌳", "🌺", "🍃", "🌻", "🌾", "🎋"];

export const bdgCls = (s) => {
  return {
    s: "sb-s",
    p: "sb-p",
    d: "sb-d"
  }[s] || "sb-p";
};

export const bdgLbl = (s) => {
  return {
    s: "Скоро",
    p: "Запланировано",
    d: "Выполнен"
  }[s] || "—";
};
