import React from 'react';

export default function ReportDetail({ report, onBack }) {
  return (
    <div style={{ paddingBottom: 100 }}>
      <button className="rd-back" onClick={onBack}>
        ← Назад к отчётам
      </button>
      <div className="rd-hero">
        <div className="rd-hero-tag">Фотоотчёт о визите</div>
        <div className="rd-hero-date">{report.date}</div>
        <div className="rd-hero-meta">
          Специалист: {report.emp} · {report.photos.length} фото
        </div>
      </div>
      <div className="rd-section" style={{ marginTop: 18 }}>
        <div className="rd-section-title">Заключение</div>
        <div className="rd-text-box">{report.text}</div>
      </div>
      <div className="rd-section">
        <div className="rd-section-title">Фотографии</div>
        <div className="rd-photo-grid">
          {report.photos.map((p, i) => (
            <div
              key={i}
              className="rd-photo"
              style={{
                background: ["#DCF0DC", "#EAF3EA", "#DDEEF8", "#FFF0DC"][i % 4]
              }}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
      <div className="rd-section">
        <div className="rd-section-title">Состояние растений</div>
        {report.plants.map((pl, i) => (
          <div key={i} className="rd-plant-row">
            <div className="rd-plant-ico">🌿</div>
            <div className="rd-plant-name">{pl.name}</div>
            <div className="rd-plant-status">{pl.status}</div>
          </div>
        ))}
      </div>
      <div className="rd-section">
        <div className="rd-section-title">Рекомендации</div>
        <div className="rd-rec">
          <div className="rd-rec-title">От специалиста</div>
          <div className="rd-rec-text">{report.rec}</div>
        </div>
      </div>
    </div>
  );
}
