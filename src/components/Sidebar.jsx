import React from "react";

export default function Sidebar({ profile }) {
  // Loading state
  if (!profile) {
    return (
      <div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div className="avatar" style={{ background: 'rgba(255,255,255,0.03)', width: 88, height: 88, borderRadius: 12 }} />
          <div>
            <div style={{ width: 160, height: 18, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }} />
            <div style={{ marginTop: 8, width: 120, height: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 6 }} />
          </div>
        </div>
        <div style={{ marginTop: 14 }} className="small">Loading profile…</div>
      </div>
    );
  }

  // Not found / error
  if (profile.message === "Not Found") {
    return <div className="small">Profile not found for this username.</div>;
  }

  return (
    <div>
      {/* Avatar + Name Section */}
      <div style={{ display: "flex", gap: 12 }}>
        <img
          src={profile.avatar_url || ""}
          alt="avatar"
          className="avatar"
        />

        <div>
          <div className="name">
            {profile.name || profile.login || "User"}
          </div>
          <div className="small">@{profile.login}</div>
        </div>
      </div>

      {/* Bio + Extra Info */}
      <div className="small" style={{ marginTop: 16 }}>
        {profile.bio && <div>{profile.bio}</div>}

        <div style={{ marginTop: 12 }}>
          <strong>{profile.public_repos ?? 0}</strong> public repos
        </div>

        {profile.location && (
          <div style={{ marginTop: 8 }}>📍 {profile.location}</div>
        )}

        <div style={{ marginTop: 8 }}>
          🔗{" "}
          {profile.blog ? (
            <a href={profile.blog} target="_blank" rel="noreferrer">
              {profile.blog}
            </a>
          ) : (
            "No website"
          )}
        </div>
      </div>
    </div>
  );
}
