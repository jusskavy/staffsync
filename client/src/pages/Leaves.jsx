import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Badge, fmtDate, todayStr } from '../utils';

const empty = { leaveType: 'Casual', fromDate: '', toDate: '', reason: '' };

export default function Leaves() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(empty);
  const [list, setList] = useState([]);
  const [msg, setMsg] = useState(null);

  const load = () => {
    api.get('/leaves/my').then((r) => setList(r.data));
    api.get('/auth/me').then((r) => setUser(r.data));
  };
  useEffect(load, []);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    try {
      await api.post('/leaves', form);
      setForm(empty);
      setMsg({ type: 'success', text: 'Leave request submitted successfully' });
      load();
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  const cancel = async (id) => {
    if (!window.confirm('Cancel this leave request?')) return;
    await api.delete(`/leaves/${id}`);
    load();
  };

  return (
    <>
      <div className="mb-4">
        <div className="page-title">My Leaves</div>
        <div className="page-sub">Apply for leave and track your requests</div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card-s mb-3 stat-card">
            <div className="stat-icon bg-soft-primary"><i className="bi bi-calendar-heart"></i></div>
            <div><div className="stat-value">{user.leaveBalance}</div><div className="stat-label">Leave balance (days)</div></div>
          </div>
          <div className="card-s">
            <h6 className="fw-bold mb-3">Apply for Leave</h6>
            {msg && <div className={`alert alert-${msg.type} py-2 small`}>{msg.text}</div>}
            <form onSubmit={submit}>
              <div className="mb-3">
                <label className="form-label small">Leave Type</label>
                <select name="leaveType" className="form-select" value={form.leaveType} onChange={change}>
                  <option>Casual</option><option>Sick</option><option>Earned</option><option>Unpaid</option>
                </select>
              </div>
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small">From</label>
                  <input type="date" name="fromDate" className="form-control" min={todayStr()} value={form.fromDate} onChange={change} required />
                </div>
                <div className="col-6">
                  <label className="form-label small">To</label>
                  <input type="date" name="toDate" className="form-control" min={form.fromDate || todayStr()} value={form.toDate} onChange={change} required />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small">Reason</label>
                <textarea name="reason" className="form-control" rows="3" value={form.reason} onChange={change} required />
              </div>
              <button className="btn btn-primary w-100">Submit Request</button>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="table-wrap">
            <div className="p-3 border-bottom fw-bold">Leave History</div>
            <div className="table-responsive">
              <table className="table table-s">
                <thead><tr><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {list.map((l) => (
                    <tr key={l._id}>
                      <td>{l.leaveType}</td>
                      <td className="text-nowrap">{fmtDate(l.fromDate)} – {fmtDate(l.toDate)}</td>
                      <td>{l.days}</td>
                      <td style={{ maxWidth: 220 }}>
                        {l.reason}
                        {l.remark && <div className="text-muted small">Remark: {l.remark} ({l.reviewedBy?.name})</div>}
                      </td>
                      <td><Badge value={l.status} /></td>
                      <td>
                        {l.status === 'Pending' && (
                          <button className="btn btn-sm btn-light text-danger" onClick={() => cancel(l._id)}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {list.length === 0 && <div className="empty"><i className="bi bi-calendar"></i>No leave requests yet</div>}
          </div>
        </div>
      </div>
    </>
  );
}
