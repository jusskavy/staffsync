import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import Modal from '../components/Modal';
import { Badge, fmtDate, initials, toInputDate } from '../utils';

const empty = {
  name: '', email: '', password: '', role: 'employee', department: '', designation: '',
  phone: '', address: '', dateOfJoining: '', manager: '', leaveBalance: 24, isActive: true,
};

export default function Employees() {
  const [list, setList] = useState([]);
  const [managers, setManagers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState(null);

  const load = () => {
    api.get('/users', { params: { search, role: roleFilter } }).then((r) => setList(r.data));
  };
  useEffect(load, [search, roleFilter]);
  useEffect(() => {
    api.get('/users/managers').then((r) => setManagers(r.data));
  }, [list.length]);

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShow(true); };
  const openEdit = (u) => {
    setForm({ ...empty, ...u, password: '', manager: u.manager?._id || '', dateOfJoining: toInputDate(u.dateOfJoining) });
    setEditId(u._id); setError(''); setShow(true);
  };
  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const body = { ...form };
      if (!body.password) delete body.password;
      if (editId) await api.put(`/users/${editId}`, body);
      else await api.post('/users', body);
      setShow(false);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${u._id}`);
      load();
    } catch (err) {
      alert(errMsg(err));
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <div className="page-title">Employees</div>
          <div className="page-sub">Manage employee records, roles and reporting managers</div>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i> Add Employee</button>
      </div>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <div className="input-group" style={{ maxWidth: 320 }}>
          <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
          <input className="form-control" placeholder="Search name, email, ID" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="form-select" style={{ maxWidth: 180 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="hr">HR</option>
          <option value="manager">Manager</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      <div className="table-wrap">
        <div className="table-responsive">
          <table className="table table-s table-hover">
            <thead>
              <tr><th>Employee</th><th>ID</th><th>Role</th><th>Department</th><th>Manager</th><th>Status</th><th className="text-end">Actions</th></tr>
            </thead>
            <tbody>
              {list.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="avatar avatar-sm">{initials(u.name)}</div>
                      <div>
                        <div className="fw-semibold">{u.name}</div>
                        <div className="text-muted small">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{u.employeeId}</td>
                  <td><Badge value={u.role} /></td>
                  <td>{u.department}<div className="text-muted small">{u.designation}</div></td>
                  <td>{u.manager?.name || '-'}</td>
                  <td>{u.isActive ? <span className="badge soft-success">Active</span> : <span className="badge soft-secondary">Inactive</span>}</td>
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-light me-1" title="View" onClick={() => setView(u)}><i className="bi bi-eye"></i></button>
                    <button className="btn btn-sm btn-light me-1" title="Edit" onClick={() => openEdit(u)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-light text-danger" title="Delete" onClick={() => remove(u)}><i className="bi bi-trash"></i></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <div className="empty"><i className="bi bi-people"></i>No employees found</div>}
      </div>

      <Modal show={show} title={editId ? 'Edit Employee' : 'Add Employee'} onClose={() => setShow(false)} size="modal-lg">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={save}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label small">Full Name *</label>
              <input name="name" className="form-control" value={form.name} onChange={change} required /></div>
            <div className="col-md-6"><label className="form-label small">Email *</label>
              <input name="email" type="email" className="form-control" value={form.email} onChange={change} required /></div>
            <div className="col-md-6"><label className="form-label small">{editId ? 'New Password (leave blank to keep)' : 'Password (default: password123)'}</label>
              <input name="password" type="text" className="form-control" value={form.password} onChange={change} minLength={6} /></div>
            <div className="col-md-6"><label className="form-label small">Role *</label>
              <select name="role" className="form-select" value={form.role} onChange={change}>
                <option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option>
              </select></div>
            <div className="col-md-6"><label className="form-label small">Department</label>
              <input name="department" className="form-control" value={form.department} onChange={change} placeholder="e.g. Engineering" /></div>
            <div className="col-md-6"><label className="form-label small">Designation</label>
              <input name="designation" className="form-control" value={form.designation} onChange={change} /></div>
            <div className="col-md-6"><label className="form-label small">Phone</label>
              <input name="phone" className="form-control" value={form.phone} onChange={change} /></div>
            <div className="col-md-6"><label className="form-label small">Date of Joining</label>
              <input name="dateOfJoining" type="date" className="form-control" value={form.dateOfJoining} onChange={change} /></div>
            <div className="col-md-6"><label className="form-label small">Reporting Manager</label>
              <select name="manager" className="form-select" value={form.manager} onChange={change}>
                <option value="">None</option>
                {managers.filter((m) => m._id !== editId).map((m) => <option key={m._id} value={m._id}>{m.name} ({m.department})</option>)}
              </select></div>
            <div className="col-md-6"><label className="form-label small">Leave Balance (days)</label>
              <input name="leaveBalance" type="number" className="form-control" value={form.leaveBalance} onChange={change} /></div>
            <div className="col-12"><label className="form-label small">Address</label>
              <textarea name="address" className="form-control" rows="2" value={form.address} onChange={change} /></div>
            {editId && (
              <div className="col-12 form-check form-switch ms-2">
                <input className="form-check-input" type="checkbox" name="isActive" id="act" checked={form.isActive} onChange={change} />
                <label className="form-check-label" htmlFor="act">Active account</label>
              </div>
            )}
          </div>
          <div className="text-end mt-4">
            <button type="button" className="btn btn-light me-2" onClick={() => setShow(false)}>Cancel</button>
            <button className="btn btn-primary">{editId ? 'Save Changes' : 'Add Employee'}</button>
          </div>
        </form>
      </Modal>

      <Modal show={!!view} title="Employee Details" onClose={() => setView(null)}>
        {view && (
          <div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 18 }}>{initials(view.name)}</div>
              <div><div className="fw-bold fs-5">{view.name}</div><Badge value={view.role} /></div>
            </div>
            <table className="table table-sm">
              <tbody>
                <tr><th className="text-muted fw-normal">Employee ID</th><td>{view.employeeId}</td></tr>
                <tr><th className="text-muted fw-normal">Email</th><td>{view.email}</td></tr>
                <tr><th className="text-muted fw-normal">Phone</th><td>{view.phone || '-'}</td></tr>
                <tr><th className="text-muted fw-normal">Department</th><td>{view.department}</td></tr>
                <tr><th className="text-muted fw-normal">Designation</th><td>{view.designation || '-'}</td></tr>
                <tr><th className="text-muted fw-normal">Manager</th><td>{view.manager?.name || '-'}</td></tr>
                <tr><th className="text-muted fw-normal">Joined</th><td>{fmtDate(view.dateOfJoining)}</td></tr>
                <tr><th className="text-muted fw-normal">Leave Balance</th><td>{view.leaveBalance} days</td></tr>
                <tr><th className="text-muted fw-normal">Address</th><td>{view.address || '-'}</td></tr>
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </>
  );
}
