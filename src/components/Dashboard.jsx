import { useEffect, useRef, useState } from "react";
import { apiRoutes } from "../data.js";
import { getStats } from "../api.js";
import { Topbar, Kpi, FunnelRow, ActivityItem, JourneyStrip, Panel } from "./ui.jsx";

export default function Dashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const mounted = useRef(false);

  function refreshStats() {
    setLoading(true);
    return getStats().then(data => {
      if (!mounted.current) return;
      setStats(data);
      setLastUpdated(new Date());
      setLoading(false);
    });
  }

  useEffect(() => {
    mounted.current = true;
    function tick() {
      refreshStats().catch(() => {
        if (mounted.current) setLoading(false);
      });
    }
    tick();
    const interval = window.setInterval(tick, 60000);
    return () => {
      mounted.current = false;
      window.clearInterval(interval);
    };
  }, []);

  const refreshAction = (
    <button type="button" className="primary" onClick={refreshStats} disabled={loading}>
      {loading ? "Refreshing..." : "Refresh"}
    </button>
  );

  if (!stats) {
    return (
      <>
        <Topbar title={`Welcome back, ${user.name.split(" ")[0]}`} subtitle="Loading collections performance..." action={refreshAction} />
        <div className="panel skeleton-panel" />
      </>
    );
  }

  return (
    <>
      <Topbar
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        subtitle={`Metrics, funnel, channel health and today's exceptions.${lastUpdated ? ` Last updated ${lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}.` : ""}`}
        action={refreshAction}
      />
      <section className="grid kpis">
        {stats.kpis.map(item => <Kpi key={item.label} {...item} />)}
      </section>
      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Collections vs target, 30D" meta={`polls ${apiRoutes.stats}`}>
          <div className="chart">
            {stats.chartBars.map((h, i) => <div key={i} className="bar" style={{ height: `${h}%` }} />)}
          </div>
        </Panel>
        <Panel title="Funnel by stage" meta="Stage 4 highlighted">
          {stats.funnelStages.map(stage => <FunnelRow key={stage.label} {...stage} />)}
        </Panel>
      </section>
      <section className="grid dashboard-grid" style={{ marginTop: 16 }}>
        <Panel title="Journey spine" meta="Reusable JourneyStrip">
          <JourneyStrip activeIndex={1} />
        </Panel>
        <Panel title="Needs attention" meta="today" bodyClassName="panel-body activity">
          {stats.attention.map(item => <ActivityItem key={item.time} {...item} />)}
        </Panel>
      </section>
    </>
  );
}
