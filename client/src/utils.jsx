export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

export const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '-';

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export const todayStr = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

const statusColors = {
  Pending: 'warning',
  Approved: 'success',
  Rejected: 'danger',
  Present: 'success',
  'Half Day': 'warning',
  Absent: 'danger',
  Upcoming: 'info',
  Ongoing: 'primary',
  Completed: 'secondary',
  hr: 'danger',
  manager: 'primary',
  employee: 'success',
  Announcement: 'primary',
  News: 'info',
  Event: 'success',
  Policy: 'warning',
};

export function Badge({ value }) {
  const c = statusColors[value] || 'secondary';
  const label = value === 'hr' ? 'HR' : value;
  return <span className={`badge rounded-pill soft-${c} text-capitalize`}>{label}</span>;
}

export const initials = (name = '') =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
