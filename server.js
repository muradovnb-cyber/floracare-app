const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'floracare_secret_key';

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Authentication Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Токен отсутствует' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = decodedUser;
    next();
  });
}

// ─── AUTH ENDPOINTS ───

// Register client
app.post('/api/auth/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }

  try {
    const existing = await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await db.query(
      'INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)',
      [email.trim().toLowerCase(), passwordHash, 'client', name, phone || '']
    );

    const userId = result.insertId || (await db.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]))[0].id;
    const token = jwt.sign({ id: userId, email, role: 'client', name }, JWT_SECRET, { expiresIn: '7d' });

    res.json({ token, user: { id: userId, email, role: 'client', name, phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Введите email и пароль' });
  }

  try {
    // Also allow shortcut logins like 'maria', 'dmitry', 'admin' directly for demo ease
    let emailSearch = email.trim().toLowerCase();
    if (!emailSearch.includes('@')) {
      emailSearch = `${emailSearch}@floracare.uz`;
    }

    const users = await db.query('SELECT * FROM users WHERE email = ?', [emailSearch]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Пользователь не найден' });
    }

    const user = users[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name, phone: user.phone } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Me
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const users = await db.query('SELECT id, email, role, name, phone FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});


// ─── VISITS / SCHEDULE ENDPOINTS ───

// Get all visits for current user
app.get('/api/visits', authenticateToken, async (req, res) => {
  try {
    let sql = `
      SELECT v.*, 
             c.name as client_name, c.phone as client_phone,
             g.name as gardener_name, g.phone as gardener_phone
      FROM visits v
      LEFT JOIN users c ON v.client_id = c.id
      LEFT JOIN users g ON v.gardener_id = g.id
    `;
    let params = [];

    if (req.user.role === 'client') {
      sql += ' WHERE v.client_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'gardener') {
      sql += ' WHERE v.gardener_id = ?';
      params.push(req.user.id);
    }
    
    sql += ' ORDER BY v.date ASC, v.time ASC';
    const visits = await db.query(sql, params);
    res.json(visits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения визитов' });
  }
});

// Create visit (Admin only)
app.post('/api/visits', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ ограничен' });
  }

  const { client_id, gardener_id, date, time, service_type } = req.body;
  if (!client_id || !date || !time || !service_type) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }

  try {
    const result = await db.query(
      'INSERT INTO visits (client_id, gardener_id, date, time, service_type, status) VALUES (?, ?, ?, ?, ?, ?)',
      [client_id, gardener_id || null, date, time, service_type, 'p']
    );
    res.json({ id: result.insertId, message: 'Визит успешно создан' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка создания визита' });
  }
});

// Assign gardener or change status (Admin or Gardener depending on action)
app.patch('/api/visits/:id', authenticateToken, async (req, res) => {
  const visitId = req.params.id;
  const { gardener_id, status } = req.body;

  // БАГ #1 FIX: валидация — нельзя отправить пустое тело
  if (gardener_id === undefined && status === undefined) {
    return res.status(400).json({ error: 'Укажите хотя бы одно поле для обновления: gardener_id или status' });
  }

  try {
    const visits = await db.query('SELECT * FROM visits WHERE id = ?', [visitId]);
    if (visits.length === 0) {
      return res.status(404).json({ error: 'Визит не найден' });
    }

    const visit = visits[0];

    // Authorizations
    if (req.user.role === 'gardener' && visit.gardener_id !== req.user.id) {
      return res.status(403).json({ error: 'Вы не назначены на этот визит' });
    }
    if (req.user.role === 'client') {
      return res.status(403).json({ error: 'Клиенты не могут менять визиты' });
    }

    let sql = 'UPDATE visits SET';
    let params = [];
    if (gardener_id !== undefined && req.user.role === 'admin') {
      sql += ' gardener_id = ?,';
      params.push(gardener_id);
    }
    if (status !== undefined) {
      sql += ' status = ?,';
      params.push(status);
    }

    // Remove trailing comma
    sql = sql.slice(0, -1) + ' WHERE id = ?';
    params.push(visitId);

    await db.query(sql, params);
    res.json({ message: 'Визит обновлен' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка обновления визита' });
  }
});


// ─── REPORTS ENDPOINTS ───

// Get reports
app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    let sql = `
      SELECT r.*, v.date, v.time, v.service_type, 
             c.name as client_name,
             g.name as gardener_name
      FROM reports r
      JOIN visits v ON r.visit_id = v.id
      JOIN users c ON v.client_id = c.id
      LEFT JOIN users g ON v.gardener_id = g.id
    `;
    let params = [];

    if (req.user.role === 'client') {
      sql += ' WHERE v.client_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'gardener') {
      sql += ' WHERE v.gardener_id = ?';
      params.push(req.user.id);
    }

    sql += ' ORDER BY r.created_at DESC';
    const reports = await db.query(sql, params);
    
    // Parse JSON string fields back to objects
    const parsed = reports.map(r => ({
      ...r,
      photos: r.photos ? JSON.parse(r.photos) : [],
      plants: r.plants ? JSON.parse(r.plants) : []
    }));

    res.json(parsed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения отчётов' });
  }
});

// Submit report (Gardener only)
app.post('/api/reports', authenticateToken, async (req, res) => {
  if (req.user.role !== 'gardener') {
    return res.status(403).json({ error: 'Только садовники могут отправлять отчёты' });
  }

  const { visit_id, text, recommendations, photos, plants } = req.body;
  if (!visit_id || !text) {
    return res.status(400).json({ error: 'Заполните описание визита' });
  }

  try {
    // Verify visit belongs to gardener and is pending
    const visits = await db.query('SELECT * FROM visits WHERE id = ?', [visit_id]);
    if (visits.length === 0) return res.status(404).json({ error: 'Визит не найден' });
    
    const visit = visits[0];
    if (visit.gardener_id !== req.user.id) {
      return res.status(403).json({ error: 'Вы не назначены на этот визит' });
    }

    // Insert Report
    await db.query(
      'INSERT INTO reports (visit_id, text, recommendations, photos, plants) VALUES (?, ?, ?, ?, ?)',
      [
        visit_id, 
        text, 
        recommendations || '', 
        JSON.stringify(photos || []), 
        JSON.stringify(plants || [])
      ]
    );

    // Set visit status to 'd' (done)
    await db.query("UPDATE visits SET status = 'd' WHERE id = ?", [visit_id]);

    res.json({ message: 'Отчёт успешно отправлен' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка отправки отчёта' });
  }
});


// ─── PAYMENTS ENDPOINTS ───

app.get('/api/payments', authenticateToken, async (req, res) => {
  try {
    let sql = 'SELECT * FROM payments';
    let params = [];
    if (req.user.role === 'client') {
      sql += ' WHERE user_id = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'gardener') {
      // Садовник не имеет доступа к платежам
      return res.status(403).json({ error: 'Садовники не имеют доступа к платежам' });
    }
    // admin видит все платежи без фильтра
    sql += ' ORDER BY id DESC';
    const payments = await db.query(sql, params);
    res.json(payments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка получения платежей' });
  }
});

// БАГ #3 FIX: DELETE /api/visits/:id — только для admin
app.delete('/api/visits/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Удаление визитов доступно только администратору' });
  }
  const visitId = req.params.id;
  try {
    const visits = await db.query('SELECT id FROM visits WHERE id = ?', [visitId]);
    if (visits.length === 0) {
      return res.status(404).json({ error: 'Визит не найден' });
    }
    await db.query('DELETE FROM visits WHERE id = ?', [visitId]);
    res.json({ message: `Визит #${visitId} удалён` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка удаления визита' });
  }
});

app.post('/api/payments/:id/pay', authenticateToken, async (req, res) => {
  if (req.user.role !== 'client') {
    return res.status(403).json({ error: 'Только клиенты могут оплачивать' });
  }

  try {
    await db.query('UPDATE payments SET ok = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Оплата успешно произведена' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка оплаты' });
  }
});


// ─── SALARY ENDPOINTS (gardener only) ───

app.get('/api/salary', authenticateToken, async (req, res) => {
  if (req.user.role !== 'gardener') {
    return res.status(403).json({ error: 'Доступ только для садовников' });
  }
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    // Считаем выполненные визиты за текущий месяц
    const doneVisits = await db.query(
      `SELECT COUNT(*) as count FROM visits
       WHERE gardener_id = ? AND status = 'd'
       AND strftime('%m', date) = ? AND strftime('%Y', date) = ?`,
      [req.user.id, String(month).padStart(2, '0'), String(year)]
    );
    const doneCount = parseInt(doneVisits[0].count, 10) || 0;

    const BASE_SALARY = 2500000;
    const BONUS_PER_VISIT = 50000;
    const bonus = doneCount * BONUS_PER_VISIT;

    // Авансы — в реальном проекте берём из БД
    const advances = [];
    const advances_total = advances.reduce((s, a) => s + a.amount, 0);

    res.json({
      base_salary: BASE_SALARY,
      bonus,
      done_visits: doneCount,
      advances,
      advances_total,
      net: BASE_SALARY + bonus - advances_total,
      month: now.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка загрузки зарплаты' });
  }
});


// ─── ADMIN ONLY DATA LOADS ───

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Доступ ограничен' });
  }
  try {
    const list = await db.query('SELECT id, email, role, name, phone, created_at FROM users');
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки пользователей' });
  }
});


// ─── UNIVERSAL ROUTING ───

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', app: 'FloraCare', db: db.isPostgres ? 'postgresql' : 'sqlite' });
});

// Serve frontend SPA for all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Initialize database and start listening
db.init().then(() => {
  app.listen(PORT, () => {
    console.log(`🌿 FloraCare запущен на порту ${PORT}`);
  });
}).catch(err => {
  console.error('Не удалось запустить сервер из-за ошибки БД:', err);
});
