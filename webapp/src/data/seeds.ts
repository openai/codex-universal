import { Announcement, LeaveRequest, PayrollRun, PipelineStage, Shift, User } from '../models/types';

export const seedUsers: User[] = [
  {
    id: 'admin-1',
    name: 'Ariana Admin',
    email: 'admin@example.com',
    role: 'admin',
    department: 'People Ops',
  },
  {
    id: 'emp-1',
    name: 'Eko Employee',
    email: 'employee@example.com',
    role: 'employee',
    department: 'Engineering',
  },
];

export const seedShifts: Shift[] = [
  {
    id: 'shift-1',
    title: 'Morning Front Desk',
    start: new Date().toISOString(),
    end: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    assigneeId: 'emp-1',
    location: 'HQ Lobby',
  },
  {
    id: 'shift-2',
    title: 'Evening DevOps',
    start: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    end: new Date(Date.now() + 28 * 60 * 60 * 1000).toISOString(),
    assigneeId: 'emp-1',
    location: 'Remote',
  },
];

export const seedLeaves: LeaveRequest[] = [
  {
    id: 'leave-1',
    employeeId: 'emp-1',
    type: 'annual',
    from: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    to: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'pending',
    reason: 'Family errand',
  },
];

export const seedPayroll: PayrollRun[] = [
  {
    id: 'pr-1',
    employeeId: 'emp-1',
    month: '2024-11',
    baseSalary: 12000000,
    overtimeHours: 12,
    proratedDays: 28,
    thrEligible: true,
    components: [
      { label: 'Overtime (1.5x)', amount: 1500000, type: 'earning' },
      { label: 'Meal Allowance', amount: 500000, type: 'earning' },
      { label: 'Tax (PPH21)', amount: -850000, type: 'deduction' },
      { label: 'BPJS Kesehatan', amount: -600000, type: 'deduction' },
    ],
  },
];

export const seedAnnouncements: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Welcome to Universal Workforce Hub',
    body: 'Clock-in with GPS + selfie, request leave, and track payroll in one place.',
    audience: ['admin', 'employee'],
  },
];

export const seedPipeline: PipelineStage[] = [
  {
    id: 'stage-1',
    title: 'Screening',
    candidates: [
      { name: 'Raka R', role: 'Backend Engineer', status: 'Phone Interview' },
      { name: 'Maya M', role: 'UI Designer', status: 'Portfolio Review' },
    ],
  },
  {
    id: 'stage-2',
    title: 'Offer',
    candidates: [
      { name: 'Dito D', role: 'Mobile Engineer', status: 'Negotiation' },
    ],
  },
];
