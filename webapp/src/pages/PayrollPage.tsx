import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PayrollComponent, PayrollRun } from '../models/types';
import { fetchPayroll, savePayroll } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { seedUsers } from '../data/seeds';

export function PayrollPage() {
  const [runs, setRuns] = useState<PayrollRun[]>([]);
  const [baseSalary, setBaseSalary] = useState(12000000);
  const [month, setMonth] = useState('2024-11');
  const [overtimeHours, setOvertimeHours] = useState(10);
  const [proratedDays, setProratedDays] = useState(30);
  const [thrEligible, setThrEligible] = useState(true);
  const { user, hasRole } = useAuth();

  useEffect(() => {
    fetchPayroll().then(setRuns);
  }, []);

  const components: PayrollComponent[] = useMemo(() => {
    const overtimeRate = 75000;
    const overtime = overtimeHours * overtimeRate;
    const prorataFactor = proratedDays / 30;
    const proratedBase = Math.round(baseSalary * prorataFactor);
    return [
      { label: 'Base (pro-rata)', amount: proratedBase, type: 'earning' },
      { label: 'Overtime (OT x1.5)', amount: overtime, type: 'earning' },
      { label: 'THR', amount: thrEligible ? baseSalary : 0, type: 'earning' },
      { label: 'Tax (PPH21 est.)', amount: Math.round(-0.07 * (proratedBase + overtime)), type: 'deduction' },
      { label: 'BPJS Kesehatan', amount: -300000, type: 'deduction' },
      { label: 'BPJS Ketenagakerjaan', amount: -250000, type: 'deduction' },
    ];
  }, [baseSalary, overtimeHours, proratedDays, thrEligible]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const run: PayrollRun = {
      id: `pr-${Date.now()}`,
      employeeId: user.role === 'admin' ? seedUsers[1].id : user.id,
      month,
      baseSalary,
      overtimeHours,
      proratedDays,
      thrEligible,
      components,
    };
    await savePayroll(run);
    setRuns([run, ...runs]);
  }

  return (
    <div className="card-grid">
      <div className="card">
        <div className="section-title">Simulate payroll</div>
        <form onSubmit={submit}>
          <div className="form-control">
            <label>Month</label>
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div className="form-control">
            <label>Base salary (IDR)</label>
            <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(Number(e.target.value))} />
          </div>
          <div className="form-control">
            <label>Overtime hours</label>
            <input type="number" value={overtimeHours} onChange={(e) => setOvertimeHours(Number(e.target.value))} />
          </div>
          <div className="form-control">
            <label>Prorated days (out of 30)</label>
            <input type="number" value={proratedDays} onChange={(e) => setProratedDays(Number(e.target.value))} />
          </div>
          <div className="form-control">
            <label>THR eligibility</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" checked={thrEligible} onChange={(e) => setThrEligible(e.target.checked)} /> Eligible
            </label>
          </div>
          <button className="btn" type="submit">
            Save payroll preview
          </button>
          {!hasRole('admin') && <div style={{ color: '#ef4444', marginTop: '0.5rem' }}>Employees can preview their own data only</div>}
        </form>
      </div>

      <div className="card">
        <div className="section-title">Breakdown</div>
        <div>
          {components.map((c, idx) => (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span>{c.label}</span>
              <strong style={{ color: c.type === 'deduction' ? '#ef4444' : '#16a34a' }}>Rp {c.amount.toLocaleString()}</strong>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '0.75rem', fontWeight: 800 }}>
          Net: Rp
          {components.reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
        </div>
      </div>

      <div className="card">
        <div className="section-title">History</div>
        <table className="table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Month</th>
              <th>Net</th>
              <th>Overtime</th>
              <th>THR</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td>{seedUsers.find((u) => u.id === run.employeeId)?.name}</td>
                <td>{run.month}</td>
                <td>
                  Rp
                  {run.components.reduce((acc, c) => acc + c.amount, 0).toLocaleString()}
                </td>
                <td>{run.overtimeHours}h</td>
                <td>{run.thrEligible ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
