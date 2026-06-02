import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import { getSubjectColor } from "../../utils/helpers";
import "./Charts.css";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <p className="tooltip-label">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="tooltip-row">
          <span className="tooltip-dot" style={{ background: p.color }} />
          <span className="tooltip-name">{p.dataKey}:</span>
          <span className="tooltip-val" style={{ color: p.color }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

export const TrendChart = ({ trends, months }) => {
  if (!trends?.length) return <div className="chart-empty">No trend data</div>;

  const data = months?.map((month) => {
    const entry = { month };
    trends.forEach((t) => {
      const found = t.data.find((d) => d.month === month);
      if (found?.score != null) entry[t.subject] = found.score;
    });
    return entry;
  });

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            {trends.map((t) => (
              <linearGradient key={t.subject} id={`grad-${t.subject}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getSubjectColor(t.subject)} stopOpacity={0.2} />
                <stop offset="95%" stopColor={getSubjectColor(t.subject)} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis dataKey="month" tick={{ fill: "#8892b0", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis domain={[40, 100]} tick={{ fill: "#8892b0", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: "16px" }}
            formatter={(val) => <span style={{ color: "#8892b0", fontSize: 12 }}>{val}</span>}
          />
          {trends.map((t) => (
            <Area
              key={t.subject}
              type="monotone"
              dataKey={t.subject}
              stroke={getSubjectColor(t.subject)}
              strokeWidth={2}
              fill={`url(#grad-${t.subject})`}
              dot={{ r: 3, fill: getSubjectColor(t.subject), strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MonthlyAvgChart = ({ monthlyAvg }) => {
  if (!monthlyAvg?.length) return <div className="chart-empty">No data</div>;

  return (
    <div className="chart-wrapper">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={monthlyAvg} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis dataKey="month" tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis domain={[50, 100]} tick={{ fill: "#8892b0", fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="chart-tooltip">
                  <p className="tooltip-label">{label}</p>
                  <span style={{ color: "#00d4ff" }}>Avg: {payload[0].value}</span>
                </div>
              ) : null
            }
          />
          <Bar dataKey="average" fill="url(#barGrad)" radius={[4, 4, 0, 0]}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#7c6cfc" stopOpacity={0.6} />
              </linearGradient>
            </defs>
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const DistributionChart = ({ distribution }) => {
  if (!distribution) return null;
  const total = distribution.excellent + distribution.good + distribution.average || 1;

  return (
    <div className="dist-chart">
      {[
        { key: "excellent", label: "Excellent", color: "#00e5a0", count: distribution.excellent },
        { key: "good", label: "Good", color: "#00d4ff", count: distribution.good },
        { key: "average", label: "Average", color: "#ffb800", count: distribution.average },
      ].map((item) => (
        <div key={item.key} className="dist-row">
          <span className="dist-label">{item.label}</span>
          <div className="dist-bar-track">
            <div
              className="dist-bar-fill"
              style={{
                width: `${(item.count / total) * 100}%`,
                background: item.color,
                boxShadow: `0 0 8px ${item.color}40`,
              }}
            />
          </div>
          <span className="dist-count" style={{ color: item.color }}>{item.count}</span>
        </div>
      ))}
    </div>
  );
};
