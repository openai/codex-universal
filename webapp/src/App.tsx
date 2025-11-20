import { NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { ClockPage } from './pages/ClockPage';
import { SchedulePage } from './pages/SchedulePage';
import { LeavePage } from './pages/LeavePage';
import { PayrollPage } from './pages/PayrollPage';
import { CompanyPage } from './pages/CompanyPage';
import { RecruitmentPage } from './pages/RecruitmentPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LoginPage } from './pages/LoginPage';
import { useAuth } from './hooks/useAuth';

function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Universal Workforce Hub</div>
            <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>People operations cockpit</div>
          </div>
          {user && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700 }}>{user.name}</div>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>{user.role}</div>
              <button
                className="btn secondary"
                style={{ marginTop: '0.4rem', width: 'auto', padding: '0.35rem 0.75rem' }}
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Sign out
              </button>
            </div>
          )}
        </div>
        {user && (
          <nav style={{ marginTop: '0.75rem' }}>
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
              Home
            </NavLink>
            <NavLink to="/clock" className={({ isActive }) => (isActive ? 'active' : '')}>
              Clock-in/out
            </NavLink>
            <NavLink to="/schedule" className={({ isActive }) => (isActive ? 'active' : '')}>
              Shifts
            </NavLink>
            <NavLink to="/leave" className={({ isActive }) => (isActive ? 'active' : '')}>
              Leave
            </NavLink>
            <NavLink to="/payroll" className={({ isActive }) => (isActive ? 'active' : '')}>
              Payroll
            </NavLink>
            <NavLink to="/company" className={({ isActive }) => (isActive ? 'active' : '')}>
              Company
            </NavLink>
            <NavLink to="/recruitment" className={({ isActive }) => (isActive ? 'active' : '')}>
              Recruitment
            </NavLink>
            <NavLink to="/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>
              Analytics
            </NavLink>
          </nav>
        )}
      </header>
      <main>{children}</main>
    </div>
  );
}

function ProtectedRoutes() {
  const { user } = useAuth();
  return user ? (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/clock" element={<ClockPage />} />
      <Route path="/schedule" element={<SchedulePage />} />
      <Route path="/leave" element={<LeavePage />} />
      <Route path="/payroll" element={<PayrollPage />} />
      <Route path="/company" element={<CompanyPage />} />
      <Route path="/recruitment" element={<RecruitmentPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="*" element={<DashboardPage />} />
    </Routes>
  ) : (
    <Routes>
      <Route path="/*" element={<LoginPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppShell>
      <ProtectedRoutes />
    </AppShell>
  );
}
