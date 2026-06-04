import React, { useState } from 'react';
import { TARIFFS, PAY_METHODS } from '../utils/mockData';

export default function PaymentPage({ onBack, onSuccess }) {
  const [selected, setSelected] = useState(1);
  const [method, setMethod] = useState("card");
  const [paid, setPaid] = useState(false);

  const plan = TARIFFS[selected];
  const prices = ["720 000", "990 000", "1 490 000"];

  if (paid) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 24px",
          textAlign: "center"
        }}
      >
        <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
        <div
          style={{
            fontFamily: "'Fraunces',serif",
            fontSize: 28,
            color: "#18281A",
            marginBottom: 10
          }}
        >
          Подписка оформлена!
        </div>
        <div
          style={{
            fontSize: 15,
            color: "#7A8A7A",
            lineHeight: 1.6,
            fontWeight: 300,
            marginBottom: 32
          }}
        >
          Тариф <strong style={{ color: "#18281A" }}>{plan.name}</strong> активирован.
          <br />
          Первый визит мы запланируем в ближайшее время.
        </div>
        <button
          className="ob-btn-main"
          onClick={() => {
            if (onSuccess) onSuccess();
            onBack();
          }}
        >
          Отлично!
        </button>
      </div>
    );
  }

  const numericPrice = parseInt(prices[selected].replace(/\s/g, ""), 10);
  const discountedPrice = Math.round(numericPrice * 0.8);

  return (
    <div>
      <button className="rd-back" onClick={onBack}>
        ← Назад
      </button>
      <div className="page-hdr">
        <div className="page-h1">Оформление</div>
        <div className="page-sub">Выберите тариф и способ оплаты</div>
      </div>
      <div className="pay-page">
        {TARIFFS.map((t, i) => (
          <div
            key={i}
            className={`pay-plan-card ${selected === i ? "ppc-selected" : "ppc-default"}`}
            onClick={() => setSelected(i)}
          >
            {selected === i && <div className="ppc-check">✓</div>}
            <div className="ppc-name">{t.name}</div>
            <div className="ppc-price">
              {prices[i]} <span className="ppc-mo">₽ / мес</span>
            </div>
            <div className="ppc-feats">
              {t.feats.slice(0, 3).map((f, j) => (
                <div key={j} className="ppc-feat">
                  <div className="ppc-chk">✓</div>
                  {f}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="pay-method-title">Способ оплаты</div>

        {PAY_METHODS.map((m) => (
          <div
            key={m.id}
            className={`pay-method-card ${method === m.id ? "selected" : ""}`}
            onClick={() => setMethod(m.id)}
          >
            <div className="pmc-icon" style={{ background: m.bg }}>
              {m.icon}
            </div>
            <div>
              <div className="pmc-name">{m.name}</div>
              <div className="pmc-desc">{m.desc}</div>
            </div>
            <div className={`pmc-radio ${method === m.id ? "on" : ""}`}>
              {method === m.id && <div className="pmc-dot" />}
            </div>
          </div>
        ))}

        <div className="pay-summary" style={{ marginTop: 18 }}>
          <div className="ps-row">
            <span className="ps-label">Тариф</span>
            <span className="ps-value">{plan.name}</span>
          </div>
          <div className="ps-row">
            <span className="ps-label">Период</span>
            <span className="ps-value">1 месяц</span>
          </div>
          <div className="ps-row">
            <span className="ps-label">Скидка (первый месяц)</span>
            <span className="ps-value" style={{ color: "#90CF8D" }}>
              −20%
            </span>
          </div>
          <div className="ps-divider" />
          <div className="ps-row">
            <span className="ps-total-label">Итого</span>
            <span className="ps-total-value">
              {discountedPrice.toLocaleString("ru")} 💳
            </span>
          </div>
        </div>

        <button className="pay-btn" onClick={() => setPaid(true)}>
          Оплатить и подключить
        </button>
        <div className="pay-safe">
          🔒 Безопасная оплата · SSL шифрование
        </div>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
