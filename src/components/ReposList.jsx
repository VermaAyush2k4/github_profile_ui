import React, { useEffect, useState } from "react";

export default function ReposList({ username }) {
  const [repos, setRepos] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!username) return;

    setLoading(true);
    setError(null);

    // Fetch public repos (no client-side token required) — fall back to mock on error.
    fetch(`https://api.github.com/users/${username}/repos?per_page=100&sort=updated`)
      .then((r) => r.json())
      .then((json) => {
        if (!Array.isArray(json)) {
          throw new Error(json?.message || "Unexpected response");
        }
        setRepos(json);
      })
      .catch((err) => {
        console.warn("Failed to fetch repos, falling back to mock:", err);
        setError(err?.message || "Failed to fetch");
        // fallback mock repos
        setRepos([
          { name: "uptime-ai", description: "Lightweight status/uptime dashboard", stargazers_count: 182, language: "TypeScript", html_url: "https://github.com/example/uptime-ai", forks_count: 12, updated_at: new Date().toISOString() },
          { name: "profile-ui", description: "Profile UI + heatmap examples", stargazers_count: 45, language: "JavaScript", html_url: "https://github.com/example/profile-ui", forks_count: 3, updated_at: new Date().toISOString() },
        ]);
      })
      .finally(() => setLoading(false));
  }, [username]);

  if (loading) return <div className="small">Loading repositories…</div>;
  if (!repos || repos.length === 0)
    return <div className="small">No repositories found.</div>;

  return (
    <div className="repositories-list">
      {repos.map((repo) => (
        <div key={repo.full_name || repo.name} className="repo-item">
          <div style={{ flex: 1 }}>
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="repo-name" style={{ color: 'inherit', textDecoration: 'none' }}>
              {repo.name}
            </a>
            <div className="small-muted">{repo.description}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
            <div className="small-muted">{repo.language || '-'}</div>
            <div className="small-muted">⭐ {repo.stargazers_count ?? 0} · 🍴 {repo.forks_count ?? 0}</div>
            <div className="small-muted" style={{ fontSize: 11 }}>{new Date(repo.updated_at).toLocaleDateString()}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
