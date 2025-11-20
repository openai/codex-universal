import { useEffect, useState } from 'react';
import { fetchAnnouncements, fetchClockEvents, fetchLeaves, fetchPayroll, fetchShifts } from '../services/api';
import { Announcement, ClockEvent, LeaveRequest, PayrollRun, Shift } from '../models/types';
import { useAuth } from '../hooks/useAuth';

export function DashboardPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [clock, setClock] = useState<ClockEvent[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [payroll, setPayroll] = useState<PayrollRun[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchAnnouncements().then(setAnnouncements);
    fetchClockEvents(user?.id).then(setClock);
    fetchLeaves().then(setLeaves);
    fetchShifts().then(setShifts);
    fetchPayroll().then(setPayroll);
  }, [user?.id]);

  return (
    <div className="card-grid">
      <div className="card">
        <div className="section-title">Shift coverage</div>
        <div className="summary-grid">
          <div className="summary-box">
            <div>Scheduled</div>
            <strong>{shifts.length}</strong>
          </div>
          <div className="summary-box">
            <div>Pending leave</div>
            <strong>{leaves.filter((l) => l.status === 'pending').length}</strong>
          </div>
          <div className="summary-box">
            <div>Clock activity</div>
            <strong>{clock.length}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Announcements</div>
        {announcements.map((a) => (
          <div key={a.id} style={{ marginBottom: '0.5rem' }}>
            <div style={{ fontWeight: 700 }}>{a.title}</div>
            <div style={{ color: '#475569' }}>{a.body}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">Recent clock events</div>
        {clock.length === 0 && <div>No clock data yet</div>}
        {clock.slice(0, 5).map((c) => (
          <div key={c.id} className="status-pill" style={{ marginBottom: '0.5rem' }}>
            <span>{c.type === 'in' ? '⬆' : '⬇'}</span>
            <span>{new Date(c.timestamp).toLocaleString()}</span>
            {c.validated && <span className="badge">GPS + selfie</span>}
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title">Payroll snapshot</div>
        <table className="table">
          <thead>
            <tr>
              <th>Month</th>
              <th>Base</th>
              <th>THR</th>
              <th>Overtime</th>
            </tr>
          </thead>
          <tbody>
            {payroll.slice(0, 3).map((p) => (
              <tr key={p.id}>
                <td>{p.month}</td>
                <td>Rp {p.baseSalary.toLocaleString()}</td>
                <td>{p.thrEligible ? 'Yes' : 'No'}</td>
                <td>{p.overtimeHours}h</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
