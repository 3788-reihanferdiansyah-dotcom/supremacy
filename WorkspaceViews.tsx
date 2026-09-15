import {
  Activity,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  ExternalLink,
  FileBarChart,
  MapPin,
  Search,
  ShieldAlert,
  TimerOff,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export type WorkspaceKey =
  | 'home'
  | 'attendance'
  | 'employees'
  | 'facilities'
  | 'shifts'
  | 'hours'
  | 'reports'
  | 'settings';

type EmployeeStat = {
  id: string;
  name: string;
  role: string;
  records: number;
  valid: number;
  noCheckIn: number;
  noCheckout: number;
  invalid: number;
  averageHours: number;
};

type GroupStat = {
  name: string;
  records: number;
  valid: number;
  noCheckout: number;
  averageHours: number;
};

type Props = {
  activeWorkspace: WorkspaceKey;
  recordCount: number;
  counts: {
    valid: number;
    noCheckout: number;
    invalid: number;
    noCheckIn: number;
  };
  averageHours: number;
  completionRate: number;
  trend: Array<{ date: string; total: number; valid: number }>;
  statusData: Array<{ name: string; value: number }>;
  employees: EmployeeStat[];
  facilities: GroupStat[];
  shifts: GroupStat[];
  generatedAt: string;
  fields: string[];
  source: {
    aeolusDataQuery: string;
    chartId: number;
    historyId: number;
    datasetId: number;
    region: string;
  };
  onExport: (startDate: string, endDate: string) => void;
  onNavigate: (workspace: WorkspaceKey, status?: string) => void;
  defaultExportStart: string;
  defaultExportEnd: string;
};

const colors = ['#c9ec5b', '#a16cff', '#1b1b1d', '#ff8f70'];

function SummaryCard({
  title,
  value,
  helper,
  icon: Icon,
  onClick,
}: {
  title: string;
  value: string | number;
  helper: string;
  icon: typeof Users;
  onClick?: () => void;
}) {
  return (
    <Card
      className={`wfm-card border-0 shadow-sm ring-1 ring-slate-200/70 transition ${
        onClick
          ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md hover:ring-indigo-300'
          : ''
      }`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={event => {
        if (onClick && (event.key === 'Enter' || event.key === ' ')) onClick();
      }}
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{helper}</p>
        </div>
        <div className="wfm-kpi-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}

function GroupTable({ title, rows }: { title: string; rows: GroupStat[] }) {
  return (
    <Card className="border-0 shadow-sm ring-1 ring-slate-200/70">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <p className="text-xs text-slate-500">
          Calculated from the complete Aeolus attendance snapshot.
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="dashboard-scrollbar overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="pl-6">Name</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Valid</TableHead>
                <TableHead>No check-out</TableHead>
                <TableHead>Completion</TableHead>
                <TableHead className="pr-6">Avg. hours</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => (
                <TableRow key={row.name}>
                  <TableCell className="min-w-56 pl-6 font-medium text-slate-800">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.records}</TableCell>
                  <TableCell className="text-emerald-700">
                    {row.valid}
                  </TableCell>
                  <TableCell className="text-amber-700">
                    {row.noCheckout}
                  </TableCell>
                  <TableCell>
                    {Math.round((row.valid / row.records) * 100)}%
                  </TableCell>
                  <TableCell className="pr-6">
                    {row.averageHours
                      ? `${row.averageHours.toFixed(2)} hrs`
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function WorkspaceViews(props: Props) {
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [employeeRoles, setEmployeeRoles] = useState<string[]>(['DW', 'MW']);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [exportStart, setExportStart] = useState(props.defaultExportStart);
  const [exportEnd, setExportEnd] = useState(props.defaultExportEnd);
  const roleOptions = useMemo(() => {
    const preferredOrder = ['Admin', 'CS', 'DW', 'MW', 'Other'];
    const available = new Set(props.employees.map(item => item.role));
    const extraRoles = [...available]
      .filter(role => !preferredOrder.includes(role))
      .sort();
    return [...preferredOrder, ...extraRoles];
  }, [props.employees]);
  const roleFilteredEmployees = useMemo(
    () => props.employees.filter(item => employeeRoles.includes(item.role)),
    [employeeRoles, props.employees],
  );
  const employeeNameOptions = useMemo(() => {
    const names = new Map<string, string>();
    for (const employee of props.employees) {
      if (!names.has(employee.id)) names.set(employee.id, employee.name);
    }
    return [...names.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [props.employees]);
  const homeFilteredEmployees = useMemo(
    () =>
      selectedEmployeeIds.length
        ? roleFilteredEmployees.filter(item =>
            selectedEmployeeIds.includes(item.id),
          )
        : roleFilteredEmployees,
    [roleFilteredEmployees, selectedEmployeeIds],
  );
  const filteredEmployees = useMemo(() => {
    const query = employeeQuery.trim().toLowerCase();
    return roleFilteredEmployees.filter(item =>
      `${item.name} ${item.id} ${item.role}`.toLowerCase().includes(query),
    );
  }, [employeeQuery, roleFilteredEmployees]);

  const uniqueEmployeeCount = new Set(
    props.employees.map(employee => employee.id),
  ).size;
  const percentage = (count: number) =>
    props.recordCount ? ((count / props.recordCount) * 100).toFixed(1) : '0.0';

  if (props.activeWorkspace === 'attendance') return null;

  if (props.activeWorkspace === 'home') {
    return (
      <div className="space-y-6">
        <section aria-labelledby="attendance-status-heading">
          <div className="mb-3 flex items-end justify-between gap-4">
            <div>
              <h2
                id="attendance-status-heading"
                className="text-lg font-semibold text-slate-900"
              >
                Attendance status breakdown
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Counts and percentage of total attendance in the selected view
                period.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard
              title="Total attendance"
              value={props.recordCount.toLocaleString()}
              helper="100% of selected period"
              icon={Activity}
              onClick={() => props.onNavigate('attendance', 'all')}
            />
            <SummaryCard
              title="Valid attendance"
              value={props.counts.valid.toLocaleString()}
              helper={`${percentage(props.counts.valid)}% of total`}
              icon={CheckCircle2}
              onClick={() => props.onNavigate('attendance', 'Valid Attendance')}
            />
            <SummaryCard
              title="Invalid attendance"
              value={props.counts.invalid.toLocaleString()}
              helper={`${percentage(props.counts.invalid)}% of total`}
              icon={ShieldAlert}
              onClick={() =>
                props.onNavigate('attendance', 'Invalid Attendance')
              }
            />
            <SummaryCard
              title="No check-out"
              value={props.counts.noCheckout.toLocaleString()}
              helper={`${percentage(props.counts.noCheckout)}% of total`}
              icon={TimerOff}
              onClick={() => props.onNavigate('attendance', 'No Check-out')}
            />
            <SummaryCard
              title="No check-in"
              value={props.counts.noCheckIn.toLocaleString()}
              helper={`${percentage(props.counts.noCheckIn)}% of total`}
              icon={Clock3}
              onClick={() => props.onNavigate('attendance', 'No Check-In')}
            />
          </div>
        </section>
        <section aria-labelledby="workspace-shortcuts-heading">
          <h2
            id="workspace-shortcuts-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-[0.16em] text-slate-500"
          >
            Workspace shortcuts
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Attendance records"
              value={props.recordCount.toLocaleString()}
              helper="Open attendance workspace"
              icon={Activity}
              onClick={() => props.onNavigate('attendance', 'all')}
            />
            <SummaryCard
              title="Unique employees"
              value={uniqueEmployeeCount}
              helper="Open employee directory"
              icon={Users}
              onClick={() => props.onNavigate('employees')}
            />
            <SummaryCard
              title="Facilities"
              value={props.facilities.length}
              helper="Open facility performance"
              icon={Building2}
              onClick={() => props.onNavigate('facilities')}
            />
            <SummaryCard
              title="Shifts"
              value={props.shifts.length}
              helper="Open shift performance"
              icon={Clock3}
              onClick={() => props.onNavigate('shifts')}
            />
          </div>
        </section>
        <section className="grid gap-6 xl:grid-cols-3">
          <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                Workforce activity trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={props.trend}
                    margin={{ left: -20, right: 8 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="total"
                      stroke="#a16cff"
                      strokeWidth={3}
                      fill="#e0e7ff"
                    />
                    <Area
                      type="monotone"
                      dataKey="valid"
                      stroke="#c9ec5b"
                      strokeWidth={2}
                      fill="transparent"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm ring-1 ring-slate-200/70">
            <CardHeader>
              <CardTitle className="text-base">Attendance health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                type="button"
                onClick={() =>
                  props.onNavigate('attendance', 'Valid Attendance')
                }
                className="w-full rounded-2xl bg-emerald-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                <p className="text-xs text-emerald-700">Completion rate</p>
                <p className="mt-2 text-3xl font-bold text-emerald-800">
                  {props.completionRate}%
                </p>
              </button>
              <button
                type="button"
                onClick={() => props.onNavigate('attendance', 'No Check-out')}
                className="w-full rounded-2xl bg-amber-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-amber-100"
              >
                <p className="text-xs text-amber-700">No check-out</p>
                <p className="mt-2 text-3xl font-bold text-amber-800">
                  {props.counts.noCheckout}
                </p>
              </button>
              <button
                type="button"
                onClick={() => props.onNavigate('hours')}
                className="w-full rounded-2xl bg-indigo-50 p-4 text-left transition hover:-translate-y-0.5 hover:bg-indigo-100"
              >
                <p className="text-xs text-indigo-700">
                  Average recorded hours
                </p>
                <p className="mt-2 text-3xl font-bold text-indigo-800">
                  {props.averageHours.toFixed(2)}
                </p>
              </button>
            </CardContent>
          </Card>
        </section>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-base">
                Employee attendance KPI
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Full employee-level status totals for the selected view period.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <details className="relative w-full max-w-sm">
                <summary className="flex h-10 cursor-pointer list-none items-center justify-between rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm transition hover:border-violet-300">
                  <span>
                    {selectedEmployeeIds.length
                      ? `${selectedEmployeeIds.length} name${selectedEmployeeIds.length > 1 ? 's' : ''} selected`
                      : 'All employee names'}
                  </span>
                  <span className="text-xs text-violet-600">▼</span>
                </summary>
                <div className="absolute left-0 top-12 z-40 w-full rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Select employee names
                    </span>
                    {selectedEmployeeIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedEmployeeIds([])}
                        className="text-xs font-semibold text-violet-600 hover:text-violet-800"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="dashboard-scrollbar max-h-64 space-y-1 overflow-y-auto pr-1">
                    {employeeNameOptions.map(employee => {
                      const checked = selectedEmployeeIds.includes(employee.id);
                      return (
                        <label
                          key={employee.id}
                          className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-lime-100"
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedEmployeeIds(current =>
                                checked
                                  ? current.filter(id => id !== employee.id)
                                  : [...current, employee.id],
                              )
                            }
                            className="h-4 w-4 accent-violet-600"
                          />
                          <span className="truncate">{employee.name}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </details>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  Role
                </span>
                {roleOptions.map(role => {
                  const active = employeeRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setEmployeeRoles(current =>
                          active
                            ? current.filter(item => item !== role)
                            : [...current, role],
                        )
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                        active
                          ? 'bg-violet-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="dashboard-scrollbar overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="min-w-48 pl-6">Name</TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-center">
                      Valid attendance
                    </TableHead>
                    <TableHead className="text-center">No check-in</TableHead>
                    <TableHead className="text-center">No check-out</TableHead>
                    <TableHead className="text-center">
                      Invalid attendance
                    </TableHead>
                    <TableHead className="pr-6 text-right">
                      Completion rate
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {homeFilteredEmployees.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="py-10 text-center text-sm text-slate-500"
                      >
                        No employees match the selected search and role filters.
                      </TableCell>
                    </TableRow>
                  )}
                  {homeFilteredEmployees.map(employee => (
                    <TableRow key={`${employee.id}-${employee.role}`}>
                      <TableCell className="pl-6 font-semibold text-slate-900">
                        {employee.name}
                      </TableCell>
                      <TableCell className="font-medium text-slate-500">
                        {employee.id}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">
                          {employee.role}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-semibold text-emerald-700">
                        {employee.valid}
                      </TableCell>
                      <TableCell className="text-center text-violet-700">
                        {employee.noCheckIn}
                      </TableCell>
                      <TableCell className="text-center text-amber-700">
                        {employee.noCheckout}
                      </TableCell>
                      <TableCell className="text-center text-rose-700">
                        {employee.invalid}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <span className="inline-flex rounded-full bg-lime-200 px-3 py-1 text-xs font-bold text-slate-900">
                          {employee.records
                            ? `${((employee.valid / employee.records) * 100).toFixed(1)}%`
                            : '0.0%'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (props.activeWorkspace === 'employees') {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Unique employees"
            value={uniqueEmployeeCount}
            helper="Based on unique user IDs"
            icon={Users}
          />
          <SummaryCard
            title="Employee records"
            value={props.recordCount.toLocaleString()}
            helper="Across all attendance dates"
            icon={Activity}
          />
          <SummaryCard
            title="Valid records"
            value={props.counts.valid}
            helper={`${props.completionRate}% overall completion`}
            icon={CheckCircle2}
          />
          <SummaryCard
            title="Average hours"
            value={props.averageHours.toFixed(2)}
            helper="For records with working hours"
            icon={Clock3}
          />
        </section>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader className="space-y-4">
            <div>
              <CardTitle className="text-base">Employee directory</CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Attendance activity aggregated by Aeolus user ID.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  value={employeeQuery}
                  onChange={event => setEmployeeQuery(event.target.value)}
                  placeholder="Search employee name, ID, or role..."
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Role</span>
                {roleOptions.map(role => {
                  const active = employeeRoles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() =>
                        setEmployeeRoles(current =>
                          active
                            ? current.filter(item => item !== role)
                            : [...current, role],
                        )
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        active
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {role}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="dashboard-scrollbar overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-6">Employee</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead>Valid</TableHead>
                    <TableHead>Completion</TableHead>
                    <TableHead className="pr-6">Avg. hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.slice(0, 100).map(employee => (
                    <TableRow key={`${employee.id}:${employee.role}`}>
                      <TableCell className="min-w-56 pl-6 font-medium text-slate-800">
                        {employee.name}
                      </TableCell>
                      <TableCell>{employee.id}</TableCell>
                      <TableCell>
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {employee.role}
                        </span>
                      </TableCell>
                      <TableCell>{employee.records}</TableCell>
                      <TableCell className="text-emerald-700">
                        {employee.valid}
                      </TableCell>
                      <TableCell>
                        {Math.round((employee.valid / employee.records) * 100)}%
                      </TableCell>
                      <TableCell className="pr-6">
                        {employee.averageHours
                          ? `${employee.averageHours.toFixed(2)} hrs`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (props.activeWorkspace === 'facilities') {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Facilities"
            value={props.facilities.length}
            helper="Distinct Aeolus facility names"
            icon={Building2}
          />
          <SummaryCard
            title="Top facility"
            value={props.facilities[0]?.records ?? 0}
            helper={props.facilities[0]?.name ?? 'No data'}
            icon={MapPin}
          />
          <SummaryCard
            title="Valid records"
            value={props.counts.valid}
            helper="Across every facility"
            icon={CheckCircle2}
          />
          <SummaryCard
            title="Exceptions"
            value={
              props.counts.noCheckout +
              props.counts.invalid +
              props.counts.noCheckIn
            }
            helper="No check-in, no check-out, and invalid"
            icon={TimerOff}
          />
        </section>
        <GroupTable title="Facility performance" rows={props.facilities} />
      </div>
    );
  }

  if (props.activeWorkspace === 'shifts') {
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            title="Shift types"
            value={props.shifts.length}
            helper="Distinct shift names"
            icon={Clock3}
          />
          <SummaryCard
            title="Busiest shift"
            value={props.shifts[0]?.records ?? 0}
            helper={props.shifts[0]?.name ?? 'No data'}
            icon={Activity}
          />
          <SummaryCard
            title="Average hours"
            value={props.averageHours.toFixed(2)}
            helper="Recorded attendance duration"
            icon={Clock3}
          />
          <SummaryCard
            title="No check-out"
            value={props.counts.noCheckout}
            helper="Across all shift groups"
            icon={TimerOff}
          />
        </section>
        <GroupTable title="Shift performance" rows={props.shifts} />
      </div>
    );
  }

  if (props.activeWorkspace === 'hours') {
    const employeesWithHours = props.employees
      .filter(employee => employee.averageHours > 0)
      .sort((a, b) => b.averageHours - a.averageHours);
    return (
      <div className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <SummaryCard
            title="Average recorded hours"
            value={props.averageHours.toFixed(2)}
            helper="Across records with working hours"
            icon={Clock3}
          />
          <SummaryCard
            title="Employees with hours"
            value={employeesWithHours.length}
            helper="Current selected period"
            icon={Users}
          />
          <SummaryCard
            title="Attendance records"
            value={props.recordCount.toLocaleString()}
            helper="Open detailed attendance"
            icon={Activity}
            onClick={() => props.onNavigate('attendance')}
          />
        </section>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle className="text-base">
              Recorded hours by employee
            </CardTitle>
            <p className="text-xs text-slate-500">
              Employees ranked by average working hours in the selected view
              period.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <div className="dashboard-scrollbar overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="pl-6">Employee</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Records</TableHead>
                    <TableHead className="pr-6">Average hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employeesWithHours.map(employee => (
                    <TableRow key={`${employee.id}:${employee.role}`}>
                      <TableCell className="pl-6 font-medium text-slate-800">
                        {employee.name}
                      </TableCell>
                      <TableCell>{employee.id}</TableCell>
                      <TableCell>{employee.role}</TableCell>
                      <TableCell>{employee.records}</TableCell>
                      <TableCell className="pr-6 font-medium text-indigo-700">
                        {employee.averageHours.toFixed(2)} hrs
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (props.activeWorkspace === 'reports') {
    return (
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70 xl:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">
                Attendance report summary
              </CardTitle>
              <p className="mt-1 text-xs text-slate-500">
                Export-ready overview with a date range independent from the
                dashboard view.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-600">
                <CalendarDays className="h-4 w-4 text-indigo-500" />
                <label className="sr-only" htmlFor="export-start-date">
                  Export start date
                </label>
                <input
                  id="export-start-date"
                  type="date"
                  value={exportStart}
                  max={exportEnd}
                  onChange={event => setExportStart(event.target.value)}
                  className="w-32 outline-none"
                />
                <span>—</span>
                <label className="sr-only" htmlFor="export-end-date">
                  Export end date
                </label>
                <input
                  id="export-end-date"
                  type="date"
                  value={exportEnd}
                  min={exportStart}
                  onChange={event => setExportEnd(event.target.value)}
                  className="w-32 outline-none"
                />
              </div>
              <Button onClick={() => props.onExport(exportStart, exportEnd)}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl bg-emerald-50 p-5">
              <p className="text-xs text-emerald-700">Valid attendance</p>
              <p className="mt-2 text-3xl font-bold text-emerald-800">
                {props.counts.valid}
              </p>
              <p className="mt-1 text-xs text-emerald-700">
                {percentage(props.counts.valid)}% of total
              </p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-5">
              <p className="text-xs text-amber-700">No check-out</p>
              <p className="mt-2 text-3xl font-bold text-amber-800">
                {props.counts.noCheckout}
              </p>
              <p className="mt-1 text-xs text-amber-700">
                {percentage(props.counts.noCheckout)}% of total
              </p>
            </div>
            <div className="rounded-2xl bg-indigo-50 p-5">
              <p className="text-xs text-indigo-700">No check-in</p>
              <p className="mt-2 text-3xl font-bold text-indigo-800">
                {props.counts.noCheckIn}
              </p>
              <p className="mt-1 text-xs text-indigo-700">
                {percentage(props.counts.noCheckIn)}% of total
              </p>
            </div>
            <div className="rounded-2xl bg-rose-50 p-5">
              <p className="text-xs text-rose-700">Invalid</p>
              <p className="mt-2 text-3xl font-bold text-rose-800">
                {props.counts.invalid}
              </p>
              <p className="mt-1 text-xs text-rose-700">
                {percentage(props.counts.invalid)}% of total
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm ring-1 ring-slate-200/70">
          <CardHeader>
            <CardTitle className="text-base">Status distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={props.statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={82}
                  >
                    {props.statusData.map((item, index) => (
                      <Cell key={item.name} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="h-5 w-5 text-indigo-600" />
            Aeolus source
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Region</span>
            <span className="font-medium">{props.source.region}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Chart ID</span>
            <span className="font-medium">{props.source.chartId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Dataset ID</span>
            <span className="font-medium">{props.source.datasetId}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">History ID</span>
            <span className="font-medium">{props.source.historyId}</span>
          </div>
          <a
            href={props.source.aeolusDataQuery}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 font-medium text-indigo-600 hover:text-indigo-700"
          >
            Open source query <ExternalLink className="h-4 w-4" />
          </a>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm ring-1 ring-slate-200/70">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileBarChart className="h-5 w-5 text-indigo-600" />
            Snapshot configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Records</span>
            <span className="font-medium">
              {props.recordCount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Fields</span>
            <span className="font-medium">{props.fields.length}</span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-3">
            <span className="text-slate-500">Generated</span>
            <span className="font-medium">
              {new Date(props.generatedAt).toLocaleString()}
            </span>
          </div>
          <div>
            <p className="mb-2 text-slate-500">Included Aeolus fields</p>
            <div className="flex flex-wrap gap-2">
              {props.fields.map(field => (
                <span
                  key={field}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
