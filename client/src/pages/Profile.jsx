import { useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import { Badge, fmtDate, initials, toInputDate } from '../utils';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user.name, phone: user.phone || '', address: user.address || '', dateOfBirth: toInputDate(user.dateOfBirth),
  });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState(null);
  const [pwMsg, setPwMsg] = useState(null);

  const save = async (e) => {
    e.preventDefault();
    try {
      const r = await api.put('/users/me', form);
      setUser(r.data);
      setMsg({ type: 'success', text: 'Profile updated' });
    } catch (err) {
      setMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  const changePw = async (e) => {
    e.preventDefault();
    try {
      await api.put('/users/me/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      setPwMsg({ type: 'success', text: 'Password changed' });
    } catch (err) {
      setPwMsg({ type: 'danger', text: errMsg(err) });
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="page-title">My Profile</div>
        <div className="page-sub">View and update your personal records</div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card-s text-center">
            <div className="avatar mx-auto mb-3" style={{ width: 80, height: 80, fontSize: 26 }}>{initials(user.name)}</div>
            <h5 className="fw-bold mb-1">{user.name}</h5>
            <div className="text-muted small mb-2">{user.designation || user.department}</div>
            <Badge value={user.role} />
            <hr />
            <div className="text-start small d-grid gap-2">
              <div className="d-flex justify-content-between"><span className="text-muted">Employee ID</span><span>{user.employeeId}</span></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Email</span><span>{user.email}</span></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Department</span><span>{user.department}</span></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Manager</span><span>{user.manager?.name || '-'}</span></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Joined</span><span>{fmtDate(user.dateOfJoining)}</span></div>
              <div className="d-flex justify-content-between"><span className="text-muted">Leave Balance</span><span>{user.leaveBalance} days</span></div>
            </div>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="card-s mb-3">
            <h6 className="fw-bold mb-3">Personal Details</h6>
            {msg && <div className={`alert alert-${msg.type} py-2 small`}>{msg.text}</div>}
            <form onSubmit={save}>
              <div className="row g-3">
                <div className="col-md-6"><label className="form-label small">Full Name</label>
                  <input className="form-control" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="col-md-6"><label className="form-label small">Phone</label>
                  <input className="form-control" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div className="col-md-6"><label className="form-label small">Date of Birth</label>
                  <input type="date" className="form-control" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} /></div>
                <div className="col-12"><label className="form-label small">Address</label>
                  <textarea className="form-control" rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              </div>
              <button className="btn btn-primary mt-3">Save Changes</button>
            </form>
          </div>

          <div className="card-s">
            <h6 className="fw-bold mb-3">Change Password</h6>
            {pwMsg && <div className={`alert alert-${pwMsg.type} py-2 small`}>{pwMsg.text}</div>}
            <form onSubmit={changePw} className="row g-3">
              <div className="col-md-6"><label className="form-label small">Current Password</label>
                <input type="password" className="form-control" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></div>
              <div className="col-md-6"><label className="form-label small">New Password</label>
                <input type="password" className="form-control" minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required /></div>
              <div className="col-12"><button className="btn btn-outline-primary">Update Password</button></div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
