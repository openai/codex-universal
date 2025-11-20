import { FormEvent, useEffect, useState } from 'react';
import { Shift } from '../models/types';
import { fetchShifts, saveShift } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { seedUsers } from '../data/seeds';

export function SchedulePage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [title, setTitle] = useState('New shift');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [assignee, setAssignee] = useState(seedUsers[1].id);
  const { user } = useAuth();

  useEffect(() => {
    fetchShifts().then(setShifts);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const shift: Shift = {
      id: `shift-${Date.now()}`,
      title,
      start,
      end,
      assigneeId: assignee,
    };
    await saveShift(shift);
    setShifts([...shifts, shift]);
    setTitle('New shift');
    setStart('');
    setEnd('');
  }

  return (
    <div className="card-grid">
      <div className="card">
        <div className="section-title">Shift scheduling</div>
        <form onSubmit={submit}>
          <div className="form-control">
            <label>Title</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Front desk" required />
          </div>
          <div className="form-control">
            <label>Start</label>
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} required />
          </div>
          <div className="form-control">
            <label>End</label>
            <input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} required />
          </div>
          <div className="form-control">
            <label>Assignee</label>
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
              {seedUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <button className="btn" type="submit" disabled={user?.role !== 'admin'}>
            Save shift
          </button>
          {user?.role !== 'admin' && <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>Admin only</div>}
        </form>
      </div>

      <div className="card">
        <div className="section-title">Calendar view</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          {shifts.map((shift) => (
            <div key={shift.id} className="card" style={{ background: '#f8fafc' }}>
              <div style={{ fontWeight: 700 }}>{shift.title}</div>
              <div style={{ color: '#475569' }}>{new Date(shift.start).toLocaleString()} → {new Date(shift.end).toLocaleString()}</div>
              <div className="badge">Assigned to {seedUsers.find((u) => u.id === shift.assigneeId)?.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
