import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { seedUsers } from '../data/seeds';

export function LoginPage() {
  const [email, setEmail] = useState(seedUsers[0].email);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const ok = await login(email);
    if (!ok) {
      setError('User not found. Try one of the seeded accounts.');
      return;
    }
    navigate('/');
  }

  return (
    <div className="card" style={{ maxWidth: 420, margin: '2rem auto' }}>
      <h2>Sign in</h2>
      <p style={{ color: '#475569' }}>
        Use seeded accounts: <strong>{seedUsers[0].email}</strong> (admin) or{' '}
        <strong>{seedUsers[1].email}</strong> (employee).
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-control">
          <label htmlFor="email">Email</label>
          <select id="email" value={email} onChange={(e) => setEmail(e.target.value)}>
            {seedUsers.map((user) => (
              <option key={user.id} value={user.email}>
                {user.name} — {user.role}
              </option>
            ))}
          </select>
        </div>
        {error && <div style={{ color: '#ef4444', marginBottom: '0.5rem' }}>{error}</div>}
        <button className="btn" type="submit">
          Enter app
        </button>
      </form>
    </div>
  );
}
