import { seedAnnouncements, seedLeaves, seedPayroll, seedPipeline, seedShifts, seedUsers } from '../data/seeds';
import { ClockEvent, LeaveRequest, PayrollRun, PipelineStage, Shift, User } from '../models/types';

const simulatedLatency = (duration = 150) => new Promise((resolve) => setTimeout(resolve, duration));

let clockEvents: ClockEvent[] = [];
let leaves = [...seedLeaves];
let shifts = [...seedShifts];
let payroll = [...seedPayroll];

export async function authenticate(email: string): Promise<User | null> {
  await simulatedLatency();
  return seedUsers.find((u) => u.email === email) ?? null;
}

export async function fetchAnnouncements() {
  await simulatedLatency();
  return seedAnnouncements;
}

export async function recordClockEvent(event: Omit<ClockEvent, 'id' | 'validated'> & { validated?: boolean }) {
  await simulatedLatency();
  const newEvent: ClockEvent = {
    ...event,
    id: `clock-${Date.now()}`,
    validated: event.validated ?? Boolean(event.lat && event.lng && event.selfieUrl),
  };
  clockEvents = [newEvent, ...clockEvents];
  return newEvent;
}

export async function fetchClockEvents(userId?: string) {
  await simulatedLatency();
  return userId ? clockEvents.filter((c) => c.userId === userId) : clockEvents;
}

export async function fetchShifts(): Promise<Shift[]> {
  await simulatedLatency();
  return shifts;
}

export async function saveShift(shift: Shift) {
  await simulatedLatency();
  shifts = shifts.some((s) => s.id === shift.id)
    ? shifts.map((s) => (s.id === shift.id ? shift : s))
    : [...shifts, shift];
  return shift;
}

export async function fetchLeaves(): Promise<LeaveRequest[]> {
  await simulatedLatency();
  return leaves;
}

export async function saveLeave(request: LeaveRequest) {
  await simulatedLatency();
  leaves = leaves.some((l) => l.id === request.id)
    ? leaves.map((l) => (l.id === request.id ? request : l))
    : [...leaves, request];
  return request;
}

export async function fetchPayroll(): Promise<PayrollRun[]> {
  await simulatedLatency();
  return payroll;
}

export async function savePayroll(run: PayrollRun) {
  await simulatedLatency();
  payroll = payroll.some((p) => p.id === run.id)
    ? payroll.map((p) => (p.id === run.id ? run : p))
    : [...payroll, run];
  return run;
}

export async function fetchPipeline(): Promise<PipelineStage[]> {
  await simulatedLatency();
  return seedPipeline;
}

export async function fetchUsers(): Promise<User[]> {
  await simulatedLatency();
  return seedUsers;
}
