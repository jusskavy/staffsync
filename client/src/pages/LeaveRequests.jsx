import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Badge, fmtDate } from '../utils';

export default function LeaveRequests() {
  const { user } = useAuth();
  const [status, setStatus] = useState('Pending');
  const [list, setList] = useState([]);

  const load = () => {
    api.get('/leaves', { params: { status } }).then((r) => setList(r.data));
  };
  useEffect(load, [status]);

  const review = async (id, newStatus) => {
    const remark = window.prompt(`Remark for ${newStatus.toLowerCase()} (optional):`, '');
    if (remark === null) return;
    try {
      await api.put(`/leaves/${id}/status`, { status: newStatus, remark });
      load();
    } catch (err) {
      alert(errMsg(err));
    }
  };

  const tabs = ['Pending', 'Approved', 'Rejected', ''];

  return (
    <>
      <div className="mb-4">
        <div className="page-title">{user.role === 'hr' ? 'Leave Requests' : 'Team Leave Requests'}</div>
        <div className="page-sub">Review and approve or reject leave applications</div>
      </div>

      <ul className="nav nav-pills mb-3 gap-1">
        {tabs.map((t) => (
          <li key={t} className="nav-item">
            <button className={`nav-link ${status === t ? 'active' : ''}`} style={status === t ? { background: 'var(--brand)' } : {}}
              onClick={() => setStatus(t)}>{t || 'All'}</button>
          </li>
        ))}
      </ul>

      <div className="table-wrap">
        <div className="table-responsive">
          <table className="table table-s">
            <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th className="text-end">Action</th></tr></thead>
            <tbody>
              {list.map((l) => (
                <tr key={l._id}>
                  <td>
                    <div className="fw-semibold">{l.employee?.name}</div>
                    <div className="text-muted small">{l.employee?.employeeId} · {l.employee?.department}</div>
                  </td>
                  <td>{l.leaveType}</td>
                  <td className="text-nowrap">{fmtDate(l.fromDate)} – {fmtDate(l.toDate)}</td>
                  <td>{l.days}</td>
                  <td style={{ maxWidth: 240 }}>
                    {l.reason}
                    {l.remark && <div className="text-muted small">Remark: {l.remark}</div>}
                  </td>
                  <td>
                    <Badge value={l.status} />
                    {l.reviewedBy && <div className="text-muted" style={{ fontSize: 11 }}>by {l.reviewedBy.name}</div>}
                  </td>
                  <td className="text-end text-nowrap">
                    {l.status === 'Pending' && (
                      <>
                        <button className="btn btn-sm btn-success me-1" onClick={() => review(l._id, 'Approved')}><i className="bi bi-check-lg"></i> Approve</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => review(l._id, 'Rejected')}><i className="bi bi-x-lg"></i> Reject</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <div className="empty"><i className="bi bi-inbox"></i>No {status.toLowerCase()} requests</div>}
      </div>
    </>
  );
}
