import React, { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import Heatmap from "./components/Heatmap";
import ReposList from "./components/ReposList";
import "./App.css";

export default function App() {
  // username can be supplied via REACT_APP_GITHUB_USERNAME env var (see .env.example)
  const defaultUsername = process.env.REACT_APP_GITHUB_USERNAME || "shreeramk";
  const [username] = useState(defaultUsername);
  const [activeTab, setActiveTab] = useState("Repositories");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetch(`https://api.github.com/users/${username}`)
      .then((r) => r.json())
      .then((json) => setProfile(json))
      .catch((err) => console.error("Profile fetch error", err));
  }, [username]);

  return (
    <div className="app">
      <div className="left-panel card sidebar">
        <Sidebar profile={profile} />
      </div>

      <div className="card right-panel">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <h2 style={{ margin: 0 }}>{profile ? profile.name : username}</h2>
            <div className="small">@{username}</div>
          </div>

          <div className="row small">
            <strong>{profile?.followers}</strong> followers
            <div style={{ width: 12 }} />
            <strong>{profile?.following}</strong> following
          </div>
        </div>

        <div className="tabs">
          {["Repositories", "Projects", "Packages"].map((t) => (
            <div
              key={t}
              className={`tab ${activeTab === t ? "active" : ""}`}
              onClick={() => setActiveTab(t)}
            >
              {t}
            </div>
          ))}
        </div>

        {activeTab === "Repositories" ? (
          <div className="card small">
            <div style={{ marginBottom: 8, fontWeight: 600 }}>Repositories</div>
            <ReposList username={username} />
          </div>
        ) : (
          <div className="card small">Tab \"{activeTab}\" is empty as required</div>
        )}

        <div style={{ height: 20 }} />

        <div className="card heatmap-card">
          <h3>Contributions</h3>
          <Heatmap username={username} />
        </div>
      </div>
    </div>
  );
}
