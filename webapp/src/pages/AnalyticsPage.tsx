import { useEffect, useState } from 'react';
import { fetchClockEvents, fetchLeaves, fetchPayroll, fetchShifts } from '../services/api';
import { ClockEvent, LeaveRequest, PayrollRun, Shift } from '../models/types';

export function AnalyticsPage() {
  const [clock, setClock] = useState<ClockEvent[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [payroll, setPayroll] = useState<PayrollRun[]>([]);

  useEffect(() => {
    fetchClockEvents().then(setClock);
    fetchLeaves().then(setLeaves);
    fetchShifts().then(setShifts);
    fetchPayroll().then(setPayroll);
  }, []);

  const attendanceRate = shifts.length ? Math.round((clock.length / shifts.length) * 100) : 0;
  const overtimeHours = payroll.reduce((acc, p) => acc + p.overtimeHours, 0);
  const pendingLeave = leaves.filter((l) => l.status === 'pending').length;

  return (
    <div className="card-grid">
      <div className="card">
        <div className="section-title">KPI overview</div>
        <div className="summary-grid">
          <div className="summary-box">
            <div>Attendance vs shifts</div>
            <strong>{attendanceRate}%</strong>
          </div>
          <div className="summary-box">
            <div>Pending leave</div>
            <strong>{pendingLeave}</strong>
          </div>
          <div className="summary-box">
            <div>Overtime hours</div>
            <strong>{overtimeHours}</strong>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="section-title">Compliance</div>
        <p>Placeholder rules to demonstrate BPJS & tax deductions, and selfie/GPS validations.</p>
        <ul>
          <li>BPJS deductions applied to all payroll runs.</li>
          <li>GPS + selfie validation stored on each clock event.</li>
          <li>Approvals logged with approver IDs.</li>
        </ul>
      </div>
    </div>
  );
}
