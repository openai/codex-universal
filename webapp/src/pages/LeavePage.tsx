import { FormEvent, useEffect, useState } from 'react';
import { LeaveRequest } from '../models/types';
import { fetchLeaves, saveLeave } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { seedUsers } from '../data/seeds';

export function LeavePage() {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [type, setType] = useState<LeaveRequest['type']>('annual');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [reason, setReason] = useState('');
  const { user, hasRole } = useAuth();

  useEffect(() => {
    fetchLeaves().then(setRequests);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const request: LeaveRequest = {
      id: `leave-${Date.now()}`,
      employeeId: user.id,
      type,
      from,
      to,
      status: 'pending',
      reason,
    };
    await saveLeave(request);
    setRequests([...requests, request]);
    setReason('');
  }

  async function updateStatus(id: string, status: LeaveRequest['status']) {
    const existing = requests.find((r) => r.id === id);
    if (!existing) return;
    const updated: LeaveRequest = { ...existing, status, approverId: user?.id };
    await saveLeave(updated);
    setRequests(requests.map((r) => (r.id === id ? updated : r)));
  }

  return (
    <div className="card-grid">
      <div className="card">
        <div className="section-title">Request leave</div>
        <form onSubmit={submit}>
          <div className="form-control">
            <label>Type</label>
            <select value={type} onChange={(e) => setType(e.target.value as LeaveRequest['type'])}>
              <option value="annual">Annual</option>
              <option value="sick">Sick</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>
          <div className="form-control">
            <label>From</label>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} required />
          </div>
          <div className="form-control">
            <label>To</label>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} required />
          </div>
          <div className="form-control">
            <label>Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Context for approver" />
          </div>
          <button className="btn" type="submit">
            Submit request
          </button>
        </form>
      </div>

      <div className="card">
        <div className="section-title">Approvals</div>
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Dates</th>
              <th>Type</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id}>
                <td>{seedUsers.find((u) => u.id === r.employeeId)?.name}</td>
                <td>
                  {r.from} → {r.to}
                </td>
                <td>{r.type}</td>
                <td>
                  <span className="badge">{r.status}</span>
                </td>
                <td>
                  {hasRole('admin') && (
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn" style={{ width: 'auto' }} onClick={() => updateStatus(r.id, 'approved')}>
                        Approve
                      </button>
                      <button
                        className="btn secondary"
                        style={{ width: 'auto' }}
                        onClick={() => updateStatus(r.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
