import { useState, useMemo } from "react";

const FONT_URL = "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;500;700;900&display=swap";

function injectFont() {
  if (!document.querySelector(`link[href="${FONT_URL}"]`)) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONT_URL;
    document.head.appendChild(link);
  }
}

injectFont();

export default function CompoundInterest() {
  const [principal, setPrincipal] = useState(100000);
  const [rate, setRate] = useState(2);
  const [days, setDays] = useState(90);
  const [expandedMonth, setExpandedMonth] = useState(null);

  const data = useMemo(() => {
    const rows = [];
    let amount = principal;
    for (let d = 1; d <= days; d++) {
      const interest = amount * (rate / 100);
      const newAmount = amount + interest;
      rows.push({
        day: d,
        before: amount,
        interest,
        after: newAmount,
      });
      amount = newAmount;
    }
    return rows;
  }, [principal, rate, days]);

  const finalAmount = data.length > 0 ? data[data.length - 1].after : principal;
  const totalProfit = finalAmount - principal;
  const multiplier = finalAmount / principal;

  const months = useMemo(() => {
    const m = [];
    for (let i = 0; i < data.length; i += 30) {
      const chunk = data.slice(i, i + 30);
      const monthNum = Math.floor(i / 30) + 1;
      const startAmount = chunk[0].before;
      const endAmount = chunk[chunk.length - 1].after;
      m.push({ monthNum, days: chunk, startAmount, endAmount });
    }
    return m;
  }, [data]);

  const fmt = (n) =>
    n.toLocaleString("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const fmtShort = (n) =>
    n >= 1000000
      ? (n / 1000000).toFixed(1) + "M"
      : n >= 1000
      ? Math.round(n).toLocaleString("ru-RU")
      : n.toFixed(2);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Сложный процент</h1>
        <p style={styles.subtitle}>Калькулятор с ежедневной разбивкой</p>
      </div>

      <div style={styles.controls}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Начальная сумма</label>
          <div style={styles.inputWrap}>
            <input
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
              style={styles.input}
            />
            <span style={styles.inputSuffix}>₽</span>
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Процент в день</label>
          <div style={styles.inputWrap}>
            <input
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value) || 0)}
              style={styles.input}
              step="0.1"
            />
            <span style={styles.inputSuffix}>%</span>
          </div>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Количество дней</label>
          <div style={styles.inputWrap}>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(Math.min(Number(e.target.value) || 0, 365))}
              style={styles.input}
            />
            <span style={styles.inputSuffix}>дн</span>
          </div>
        </div>
      </div>

      <div style={styles.summaryRow}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Итого</div>
          <div style={styles.summaryValue}>{fmt(finalAmount)} ₽</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Прибыль</div>
          <div style={{ ...styles.summaryValue, color: "#34d399" }}>
            +{fmt(totalProfit)} ₽
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Множитель</div>
          <div style={{ ...styles.summaryValue, color: "#fbbf24" }}>
            ×{multiplier.toFixed(2)}
          </div>
        </div>
      </div>

      <div style={styles.progressBar}>
        <div
          style={{
            ...styles.progressFill,
            width: `${Math.min((principal / finalAmount) * 100, 100)}%`,
          }}
        />
        <div style={styles.progressLabels}>
          <span>Вложено: {fmtShort(principal)}</span>
          <span>Прибыль: {fmtShort(totalProfit)}</span>
        </div>
      </div>

      <div style={styles.tableSection}>
        <h2 style={styles.sectionTitle}>Расчёт по дням</h2>

        {months.map((month) => (
          <div key={month.monthNum} style={styles.monthBlock}>
            <button
              onClick={() =>
                setExpandedMonth(
                  expandedMonth === month.monthNum ? null : month.monthNum
                )
              }
              style={styles.monthHeader}
            >
              <div style={styles.monthLeft}>
                <span style={styles.monthArrow}>
                  {expandedMonth === month.monthNum ? "▼" : "▶"}
                </span>
                <span style={styles.monthName}>
                  {month.days.length === 30
                    ? `Месяц ${month.monthNum}`
                    : `Дни ${month.days[0].day}–${month.days[month.days.length - 1].day}`}
                </span>
              </div>
              <div style={styles.monthRight}>
                <span style={styles.monthRange}>
                  {fmtShort(month.startAmount)} → {fmtShort(month.endAmount)} ₽
                </span>
                <span style={styles.monthGrowth}>
                  +{fmt(month.endAmount - month.startAmount)} ₽
                </span>
              </div>
            </button>

            {expandedMonth === month.monthNum && (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={{ ...styles.th, width: "50px" }}>День</th>
                      <th style={styles.th}>Было</th>
                      <th style={styles.th}>× {rate / 100}</th>
                      <th style={styles.th}>+Прибавка</th>
                      <th style={styles.th}>Стало</th>
                    </tr>
                  </thead>
                  <tbody>
                    {month.days.map((row, i) => (
                      <tr
                        key={row.day}
                        style={i % 2 === 0 ? styles.trEven : styles.trOdd}
                      >
                        <td style={styles.tdDay}>{row.day}</td>
                        <td style={styles.td}>{fmt(row.before)}</td>
                        <td style={styles.tdCalc}>
                          {fmt(row.before)} × {rate / 100}
                        </td>
                        <td style={styles.tdProfit}>+{fmt(row.interest)}</td>
                        <td style={styles.tdResult}>{fmt(row.after)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    fontFamily: "'Outfit', sans-serif",
    minHeight: "100vh",
    background: "linear-gradient(160deg, #0a0a0f 0%, #111827 40%, #0f172a 100%)",
    color: "#e2e8f0",
    padding: "24px 16px",
    maxWidth: "100%",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  title: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 900,
    fontSize: "28px",
    margin: 0,
    background: "linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    letterSpacing: "-0.5px",
  },
  subtitle: {
    fontWeight: 300,
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0",
  },
  controls: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  inputGroup: {
    flex: "1 1 140px",
  },
  label: {
    display: "block",
    fontSize: "11px",
    fontWeight: 500,
    color: "#94a3b8",
    marginBottom: "6px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  inputWrap: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px 36px 10px 14px",
    fontSize: "16px",
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 600,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    color: "#f1f5f9",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  inputSuffix: {
    position: "absolute",
    right: "12px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: 500,
    pointerEvents: "none",
  },
  summaryRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    flexWrap: "wrap",
  },
  summaryCard: {
    flex: "1 1 100px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "12px",
    padding: "14px",
    textAlign: "center",
  },
  summaryLabel: {
    fontSize: "11px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  summaryValue: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 700,
    fontSize: "15px",
    color: "#f1f5f9",
  },
  progressBar: {
    position: "relative",
    height: "32px",
    background: "rgba(52,211,153,0.15)",
    borderRadius: "8px",
    overflow: "hidden",
    marginBottom: "28px",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
    borderRadius: "8px",
    transition: "width 0.5s ease",
  },
  progressLabels: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 12px",
    fontSize: "11px",
    fontWeight: 600,
    color: "#e2e8f0",
  },
  tableSection: {
    marginTop: "8px",
  },
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 700,
    fontSize: "18px",
    marginBottom: "14px",
    color: "#cbd5e1",
  },
  monthBlock: {
    marginBottom: "8px",
    borderRadius: "10px",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.06)",
  },
  monthHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    padding: "14px 16px",
    background: "rgba(255,255,255,0.04)",
    border: "none",
    color: "#e2e8f0",
    cursor: "pointer",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "14px",
    textAlign: "left",
    transition: "background 0.2s",
  },
  monthLeft: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  monthArrow: {
    fontSize: "10px",
    color: "#64748b",
  },
  monthName: {
    fontWeight: 600,
  },
  monthRight: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "2px",
  },
  monthRange: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    color: "#94a3b8",
  },
  monthGrowth: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
    color: "#34d399",
    fontWeight: 600,
  },
  tableWrap: {
    overflowX: "auto",
    background: "rgba(0,0,0,0.2)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: "12px",
  },
  th: {
    padding: "10px 8px",
    textAlign: "right",
    fontSize: "10px",
    fontWeight: 600,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    whiteSpace: "nowrap",
  },
  trEven: {
    background: "transparent",
  },
  trOdd: {
    background: "rgba(255,255,255,0.02)",
  },
  tdDay: {
    padding: "8px",
    textAlign: "center",
    color: "#64748b",
    fontWeight: 600,
    fontSize: "11px",
  },
  td: {
    padding: "8px",
    textAlign: "right",
    color: "#cbd5e1",
    whiteSpace: "nowrap",
  },
  tdCalc: {
    padding: "8px",
    textAlign: "right",
    color: "#94a3b8",
    fontSize: "11px",
    whiteSpace: "nowrap",
  },
  tdProfit: {
    padding: "8px",
    textAlign: "right",
    color: "#34d399",
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
  tdResult: {
    padding: "8px",
    textAlign: "right",
    color: "#f1f5f9",
    fontWeight: 700,
    whiteSpace: "nowrap",
  },
};
