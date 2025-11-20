export type Role = 'admin' | 'employee';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
}

export interface Shift {
  id: string;
  title: string;
  start: string;
  end: string;
  assigneeId: string;
  location?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'annual' | 'sick' | 'unpaid';
  from: string;
  to: string;
  status: 'pending' | 'approved' | 'rejected';
  approverId?: string;
  reason?: string;
}

export interface PayrollComponent {
  label: string;
  amount: number;
  type: 'earning' | 'deduction';
}

export interface PayrollRun {
  id: string;
  employeeId: string;
  baseSalary: number;
  overtimeHours: number;
  proratedDays: number;
  thrEligible: boolean;
  components: PayrollComponent[];
  month: string;
}

export interface ClockEvent {
  id: string;
  userId: string;
  timestamp: string;
  type: 'in' | 'out';
  lat?: number;
  lng?: number;
  selfieUrl?: string;
  validated: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: Role[];
}

export interface PipelineStage {
  id: string;
  title: string;
  candidates: { name: string; role: string; status: string }[];
}
