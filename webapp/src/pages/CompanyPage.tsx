import { useState } from 'react';
import { seedUsers } from '../data/seeds';

export function CompanyPage() {
  const [name, setName] = useState('Universal Corp');
  const [address, setAddress] = useState('Jakarta HQ, Sudirman 12');
  const [industry, setIndustry] = useState('Technology');
  const [teams, setTeams] = useState(['Engineering', 'People Ops', 'Finance']);

  function addTeam() {
    setTeams([...teams, `New Team ${teams.length + 1}`]);
  }

  return (
    <div className="card-grid">
      <div className="card">
        <div className="section-title">Company profile</div>
        <div className="form-control">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Address</label>
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Industry</label>
          <input value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </div>
        <div className="form-control">
          <label>Admins</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {seedUsers
              .filter((u) => u.role === 'admin')
              .map((u) => (
                <span key={u.id} className="badge">
                  {u.name}
                </span>
              ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Teams</div>
        <div className="summary-grid">
          {teams.map((team, idx) => (
            <div key={idx} className="card" style={{ background: '#f8fafc' }}>
              <div style={{ fontWeight: 700 }}>{team}</div>
              <div style={{ color: '#475569' }}>Members: {seedUsers.length}</div>
            </div>
          ))}
        </div>
        <button className="btn" style={{ marginTop: '1rem', width: 'auto' }} onClick={addTeam}>
          Add team
        </button>
      </div>
    </div>
  );
}
