import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { scoreAPI, assessmentAPI } from "../utils/api";
import { StatCard, BestScoreCard, RecentResultCard, TimeCard } from "../components/Cards/Cards";
import { TrendChart, MonthlyAvgChart, DistributionChart } from "../components/Charts/Charts";
import "./DashboardPage.css";

const Section = ({ title, subtitle, children, action }) => (
  <div className="dash-section">
    <div className="section-header">
      <div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-sub">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
    {children}
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [recent, setRecent] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, trendsRes, recentRes, assessRes] = await Promise.all([
          scoreAPI.getStats(),
          scoreAPI.getTrends(),
          scoreAPI.getRecent(),
          assessmentAPI.getAll("available"),
        ]);
        setStats(statsRes.data);
        setTrends(trendsRes.data);
        setRecent(recentRes.data);
        setAssessments(assessRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) {
    return (
      <div className="dash-loading">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-header fade-up">
        <div>
          <p className="dash-greeting">{greeting} </p>
          <h1 className="dash-title">
            Rahul's <span className="title-accent">Performance</span>
          </h1>
        </div>
        <div className="dash-date">
          {now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </div>
      </header>

      {/* Stat Grid */}
      <div className="stats-grid">
        <StatCard
          label="Average Score"
          value={stats?.avgScore || 70}
          suffix="%"
          icon="◎"
          color="#00d4ff"
          sublabel={`${stats?.totalTests || 3} assessments taken`}
          delay={0}
        />
        <StatCard
          label="Improvement"
          value={`+${stats?.improvement || 70}`}
          suffix="%"
          icon="↗"
          color="#00e5a0"
          sublabel="vs your starting score"
          delay={100}
        />
        <StatCard
          label="Total Tests"
          value={stats?.totalTests || 7}
          icon="◈"
          color="#7c6cfc"
          sublabel="assessments completed"
          delay={200}
        />
        <TimeCard hours={stats?.totalTimeSpent} studyHours={user?.totalStudyHours} />
      </div>

      {/* Best Score + Distribution */}
      <div className="mid-grid">
        <BestScoreCard stats={stats} />
        <div className="dist-card fade-up-delay-3">
          <h3 className="card-title">Performance Distribution</h3>
          <DistributionChart distribution={stats?.distribution} />
        </div>
      </div>

      {/* Score Trends */}
      <Section
        title="Score Trends"
        subtitle="Performance across all subjects over time"
      >
        <div className="chart-card fade-up-delay-2">
          <TrendChart trends={trends?.trends} months={trends?.months} />
        </div>
      </Section>

      {/* Monthly Average */}
      <div className="bottom-grid">
        <Section title="Monthly Average" subtitle="Overall score per month">
          <div className="chart-card-sm">
            <MonthlyAvgChart monthlyAvg={trends?.monthlyAvg} />
          </div>
        </Section>

        {/* Recent Results */}
        <Section title="Recent Results" subtitle="Last 5 assessments">
          <div className="recent-list">
            {recent.length ? (
              recent.map((r) => <RecentResultCard key={r._id} result={r} />)
            ) : (
              <p className="empty-state">No results yet. Take an assessment!</p>
            )}
          </div>
        </Section>
      </div>

      {/* Available Assessments */}
      {assessments.length > 0 && (
        <Section title="Available Assessments" subtitle="Ready to take now">
          <div className="assess-grid">
            {assessments.map((a) => (
              <div key={a._id} className="assess-card fade-up">
                <div className="assess-top">
                  <span className={`badge badge-${a.difficulty}`}>{a.difficulty}</span>
                  <span className="assess-duration">⏱ {a.duration}m</span>
                </div>
                <h4 className="assess-title">{a.title}</h4>
                <p className="assess-subject">{a.subject}</p>
                <div className="assess-footer">
                  <span className="assess-max">Max: {a.maxScore} pts</span>
                  <button className="assess-btn">Start →</button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
