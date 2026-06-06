const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');

const isPostgres = !!process.env.DATABASE_URL;
let dbConn = null;

// Connect to the database
function connect() {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      console.log('🔌 Подключение к базе данных PostgreSQL...');
      const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      });
      client.connect(err => {
        if (err) return reject(err);
        dbConn = client;
        resolve(dbConn);
      });
    } else {
      console.log('🔌 Подключение к базе данных SQLite...');
      const dbPath = path.join(__dirname, 'database.sqlite');
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) return reject(err);
        dbConn = db;
        resolve(dbConn);
      });
    }
  });
}

// Run SQL query helper (handles both pg and sqlite3 interfaces)
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (isPostgres) {
      // Replace ? placeholders with $1, $2... for postgres
      let pgSql = sql;
      let paramCount = 1;
      while (pgSql.includes('?')) {
        pgSql = pgSql.replace('?', `$${paramCount++}`);
      }
      dbConn.query(pgSql, params, (err, res) => {
        if (err) return reject(err);
        resolve(res.rows);
      });
    } else {
      // For SQLite
      const upperSql = sql.trim().toUpperCase();
      if (upperSql.startsWith('SELECT')) {
        dbConn.all(sql, params, (err, rows) => {
          if (err) return reject(err);
          resolve(rows);
        });
      } else {
        dbConn.run(sql, params, function (err) {
          if (err) return reject(err);
          resolve({ insertId: this.lastID, changes: this.changes });
        });
      }
    }
  });
}

// Initialize tables and seed mock data
async function init() {
  try {
    await connect();
    
    // 1. Create tables
    const autoIncrement = isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT';
    
    console.log('🛠 Создание таблиц...');
    
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id ${autoIncrement},
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL, -- 'client', 'gardener', 'admin'
        name TEXT NOT NULL,
        phone TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS visits (
        id ${autoIncrement},
        client_id INTEGER,
        gardener_id INTEGER,
        date TEXT NOT NULL, -- e.g. '2025-05-15'
        time TEXT NOT NULL, -- e.g. '10:00'
        service_type TEXT NOT NULL,
        status TEXT NOT NULL -- 's' (soon), 'p' (pending), 'd' (done)
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS reports (
        id ${autoIncrement},
        visit_id INTEGER UNIQUE,
        text TEXT NOT NULL,
        recommendations TEXT,
        photos TEXT, -- JSON string array of emoji/urls
        plants TEXT, -- JSON string array of plant status
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS payments (
        id ${autoIncrement},
        user_id INTEGER,
        period TEXT NOT NULL,
        date TEXT NOT NULL,
        amount TEXT NOT NULL,
        ok INTEGER DEFAULT 0 -- 1 or 0
      )
    `);

    // 2. Seed mock data if database is empty
    const usersCount = await query('SELECT COUNT(*) as count FROM users');
    // БАГ #4 FIX: SQLite возвращает COUNT как строку — приводим к числу
    if (parseInt(usersCount[0].count, 10) === 0) {
      console.log('🌱 Наполнение базы данных тестовыми данными...');
      
      const salt = await bcrypt.genSalt(10);
      const passHash = await bcrypt.hash('1234', salt);
      const adminHash = await bcrypt.hash('admin', salt);
      const admin1Hash = await bcrypt.hash('admin1', salt);

      // Seed Users
      // Gardeners
      await query('INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)', 
        ['maria@floracare.uz', passHash, 'gardener', 'Мария К.', '+998901234567']);
      await query('INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)', 
        ['dmitry@floracare.uz', passHash, 'gardener', 'Дмитрий В.', '+998901234568']);
      await query('INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)', 
        ['anna@floracare.uz', passHash, 'gardener', 'Анна С.', '+998901234569']);
      
      // Admins
      await query('INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)', 
        ['admin@floracare.uz', adminHash, 'admin', 'Администратор', '+998900000001']);
      await query('INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)', 
        ['admin1@floracare.uz', admin1Hash, 'admin', 'Администратор 1', '+998900000002']);

      // Clients
      await query('INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)', 
        ['client@floracare.uz', passHash, 'client', 'Нуриддин', '+998901111111']);
      await query('INSERT INTO users (email, password_hash, role, name, phone) VALUES (?, ?, ?, ?, ?)', 
        ['client2@floracare.uz', passHash, 'client', 'Мадина', '+998902222222']);

      // Get generated IDs
      const clients = await query("SELECT id, name FROM users WHERE role = 'client'");
      const gardeners = await query("SELECT id, name FROM users WHERE role = 'gardener'");

      const clientId = clients[0].id;
      const client2Id = clients[1].id;
      const mariaId = gardeners[0].id;
      const dmitryId = gardeners[1].id;

      // Seed Visits
      await query('INSERT INTO visits (client_id, gardener_id, date, time, service_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [clientId, mariaId, '2025-05-15', '10:00', 'Полив и осмотр', 'd']); // Done
      await query('INSERT INTO visits (client_id, gardener_id, date, time, service_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [clientId, mariaId, '2025-05-29', '10:00', 'Удобрение', 'p']); // Pending
      await query('INSERT INTO visits (client_id, gardener_id, date, time, service_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [clientId, dmitryId, '2025-06-12', '11:00', 'Полив и осмотр', 'p']);
      await query('INSERT INTO visits (client_id, gardener_id, date, time, service_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [clientId, mariaId, '2025-06-26', '09:30', 'Комплексный уход', 'p']);
      await query('INSERT INTO visits (client_id, gardener_id, date, time, service_type, status) VALUES (?, ?, ?, ?, ?, ?)',
        [client2Id, mariaId, '2025-05-16', '14:00', 'Обрезка', 'd']);

      // Seed Reports
      const doneVisits = await query("SELECT id, client_id FROM visits WHERE status = 'd'");
      
      const plants1 = JSON.stringify([
        { name: "Monstera deliciosa", status: "Отлично" },
        { name: "Ficus lyrata", status: "Хорошо" },
        { name: "Pothos", status: "Отлично" }
      ]);
      const plants2 = JSON.stringify([
        { name: "Ficus lyrata", status: "Требует внимания" },
        { name: "Sansevieria", status: "Отлично" }
      ]);

      await query('INSERT INTO reports (visit_id, text, recommendations, photos, plants) VALUES (?, ?, ?, ?, ?)',
        [doneVisits[0].id, 'Все растения в отличном состоянии. Выполнен плановый полив и внесение комплексного удобрения. Monstera deliciosa показывает активный рост — появился новый лист.', 'Продолжайте текущий режим полива. Пересадка Monstera рекомендована через 2 месяца.', JSON.stringify(["🌿", "🪴", "🌱", "💧"]), plants1]);
      
      await query('INSERT INTO reports (visit_id, text, recommendations, photos, plants) VALUES (?, ?, ?, ?, ?)',
        [doneVisits[1].id, 'Выполнен плановый полив. Обнаружен лёгкий хлороз у Ficus lyrata — рекомендовано добавить железосодержащее удобрение.', 'Добавьте железосодержащее удобрение для Ficus lyrata. Следующий осмотр через 2 недели.', JSON.stringify(["🌳", "🍃", "🌾"]), plants2]);

      // Seed Payments
      await query('INSERT INTO payments (user_id, period, date, amount, ok) VALUES (?, ?, ?, ?, ?)',
        [clientId, 'Апрель 2025', '1 апр 2025', '990 000 сум', 1]);
      await query('INSERT INTO payments (user_id, period, date, amount, ok) VALUES (?, ?, ?, ?, ?)',
        [clientId, 'Май 2025', '1 мая 2025', '990 000 сум', 1]);
      await query('INSERT INTO payments (user_id, period, date, amount, ok) VALUES (?, ?, ?, ?, ?)',
        [clientId, 'Июнь 2025', '1 июн 2025', '990 000 сум', 0]);

      console.log('✅ Данные успешно импортированы!');
    }
  } catch (err) {
    console.error('✗ Ошибка инициализации базы данных:', err);
    throw err;
  }
}

module.exports = {
  init,
  query,
  isPostgres
};
