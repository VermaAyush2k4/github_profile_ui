import React, { useEffect, useState } from "react";
// We'll render the grid with plain HTML/CSS - keep Plot import removed

// Contributions GraphQL usage removed — heatmap uses mocked month-grid data.

export default function Heatmap({ username }) {
  const [data, setData] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [total, setTotal] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Try to fetch server-side contributions proxy first. The proxy returns
    // { z, x, y, total, source } where source is 'github' or 'mock'.
    setData(null);

    fetch(`/api/contributions/${username}?year=${year}`)
      .then((r) => r.json())
      .then((json) => {
        if (!json || !json.z) throw new Error('No contribution data');
        setData({ z: json.z, x: json.x, y: json.y });
        setTotal(json.total ?? sumGrid(json.z));
        setIsLive(json.source === 'github');
      })
      .catch(() => {
        const mock = generateMockMonthMock();
        setData(mock);
        setTotal(sumGrid(mock.z));
        setIsLive(false);
      });
  }, [username, year]);

  if (!data) return <div className="small">Loading heatmap…</div>;

  // prepare color breaks
  const flat = data.z.flat();
  const max = Math.max(...flat, 0);
  // thresholds for 5 levels
  const thresholds = [0, Math.ceil(max * 0.2), Math.ceil(max * 0.4), Math.ceil(max * 0.6), Math.ceil(max * 0.85)];

  const getColor = (val) => {
    if (!val || val === 0) return '#f3f4f6';
    if (val <= thresholds[1]) return '#d1fadf';
    if (val <= thresholds[2]) return '#a3f0b1';
    if (val <= thresholds[3]) return '#34a853';
    return '#166534';
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{total.toLocaleString()} contributions in the last year</div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4 }}>
            Contributions on public repositories and profile activity
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>Contribution settings</div>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))} style={{ background: 'rgba(255,255,255,0.02)', color: 'inherit', border: '1px solid rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 6 }}>
            {Array.from({ length: 6 }).map((_, idx) => {
              const y = new Date().getFullYear() - idx;
              return <option key={y} value={y}>{y}</option>;
            })}
          </select>
        </div>
      </div>

      {/* months bar - align to underlying grid columns */}
      {data?.x && (
        <div style={{ display: 'grid', gridTemplateColumns: `40px repeat(${data.x.length}, 1fr)`, gap: 0, marginTop: 8 }}>
          <div />
          {data.x.map((m, i) => (
            <div key={i} style={{ padding: '2px 4px', fontSize: 12, color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>
              {i % 5 === 0 ? m : ''}
            </div>
          ))}
        </div>
      )}

      {/* grid + weekday labels (show only Mon/Wed/Fri on left like GitHub) */}
      <div style={{ display: 'grid', gridTemplateColumns: `40px 1fr`, gap: 8, marginTop: 6, alignItems: 'center' }}>
        {/* weekday column - show all 7 weekdays aligned with rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: 6 }}>
          {data.y.map((label, idx) => (
            <div key={label + idx} style={{ height: 14, display: 'flex', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{label}</div>
          ))}
        </div>

        {/* scrollable grid */}
        <div style={{ overflowX: 'auto', paddingBottom: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {data.z.map((row, rIdx) => (
              <div key={`row-${rIdx}`} style={{ display: 'flex', gap: '6px' }}>
                {row.map((val, cIdx) => {
                  const color = getColor(val);
                  const title = `${val} contributions`;
                  return (
                    <div key={`${rIdx}-${cIdx}`} title={title} style={{ width: 14, height: 14, borderRadius: 3, background: color, border: '1px solid rgba(0,0,0,0.06)' }} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
        <span>Mocked contributions — live GraphQL integration removed in this build</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Less</div>
          <div style={{ height: 14, width: 64, borderRadius: 8, background: 'linear-gradient(90deg, #071224 0%, #d1fadf 50%, #16a34a 100%)' }} />
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>More</div>
        </div>
      </div>
    </div>
  );
}

function sumGrid(z) {
  if (!z) return 0;
  return z.reduce((acc, row) => acc + row.reduce((a, v) => a + (v || 0), 0), 0);
}

function renderMonthHeaders(xDates) {
  // xDates are strings like '2025-10-11' (from week start). We render month label only when it changes
  if (!xDates || xDates.length === 0) return null;

  const months = [];
  let last = null;

  xDates.forEach((dStr, idx) => {
    try {
      const d = new Date(dStr);
      const short = d.toLocaleString('default', { month: 'short' });
      if (short !== last) {
        months.push({ label: short, pos: idx });
        last = short;
      }
    } catch {
      // ignore
    }
  });

  // create an array with empty cells except at month positions where we place labels
  const cells = Array.from({ length: xDates.length }).map((_, i) => {
    const m = months.find((mm) => mm.pos === i);
    return (
      <div key={i} style={{ padding: '2px 2px', fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'left' }}>{m ? m.label : ''}</div>
    );
  });

  return cells;
}

function convertWeeksToGrid(weeks) {
  const cols = weeks.length;
  const rows = 7;

  const z = Array.from({ length: rows }, () =>
    Array(cols).fill(0)
  );

  const x = [];
  const y = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  weeks.forEach((week, colIdx) => {
    x.push(week.contributionDays[0].date);

    week.contributionDays.forEach((day, rowIdx) => {
      z[rowIdx][colIdx] = day.contributionCount;
    });
  });

  return { z, x, y };
}

function generateMockHeatmap() {
  const rows = 7;
  const cols = 26;

  const z = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => Math.floor(Math.random() * 8))
  );

  const x = Array.from({ length: cols }, (_, i) => `W${i + 1}`);
  const y = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return { z, x, y };
}

function generateMockMonthMock() {
  // produce a 7x(12*5=60) grid: rows=days-of-week, cols=5 weeks per month x 12 months
  const rows = 7;
  const cols = 12 * 5;

  const z = Array.from({ length: rows }, () => Array.from({ length: cols }, () => Math.floor(Math.random() * 15)));

  // stub x labels: Repeat month short name for each of 5 columns per month (e.g "Jan Jan Jan Jan Jan Feb ...")
  const x = Array.from({ length: cols }, (_, i) => {
    const monthIdx = Math.floor(i / 5);
    return new Date(0, monthIdx).toLocaleString('default', { month: 'short' });
  });

  const y = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return { z, x, y };
}

function convertWeeksToMonthGrid(weeks, year) {
  // Convert contributions to a 7 x 60 grid (7 days x 5 columns per month x 12 months)
  const rows = 7;
  const cols = 12 * 5; // 5 week-slots per month

  const z = Array.from({ length: rows }, () => Array(cols).fill(0));

  // x labels: month short names repeated 5 times each
  const x = Array.from({ length: cols }, (_, i) => {
    const m = Math.floor(i / 5);
    return new Date(0, m).toLocaleString('default', { month: 'short' });
  });

  const y = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  weeks.forEach((week) => {
    week.contributionDays.forEach((day) => {
      try {
        const d = new Date(day.date + 'T00:00:00Z');
        if (d.getFullYear() !== year) return;

        const monthIdx = d.getMonth(); // 0..11
        const weekOfMonth = Math.floor((d.getDate() - 1) / 7); // 0..4
        const colIdx = monthIdx * 5 + weekOfMonth; // 0..59

        const rowIdx = d.getDay(); // 0..6 Sunday..Saturday (matches our y)

        if (rowIdx >= 0 && rowIdx < rows && colIdx >= 0 && colIdx < cols) {
          z[rowIdx][colIdx] += day.contributionCount || 0;
        }
      } catch (e) {
        // ignore parse errors
      }
    });
  });

  return { z, x, y };
}
