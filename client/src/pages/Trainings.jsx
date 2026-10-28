import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import Modal from '../components/Modal';
import { Badge, fmtDate, toInputDate } from '../utils';

const empty = { title: '', description: '', trainer: '', mode: 'Online', startDate: '', endDate: '', status: 'Upcoming', participants: [] };

export default function Trainings() {
  const { user } = useAuth();
  const canManage = user.role === 'manager' || user.role === 'hr';
  const [list, setList] = useState([]);
  const [people, setPeople] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');

  const load = () => api.get('/trainings').then((r) => setList(r.data));
  useEffect(() => {
    load();
    if (canManage) api.get('/users/team').then((r) => setPeople(r.data));
  }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShow(true); };
  const openEdit = (t) => {
    setForm({
      ...empty, ...t,
      startDate: toInputDate(t.startDate), endDate: toInputDate(t.endDate),
      participants: t.participants.map((p) => p._id),
    });
    setEditId(t._id); setError(''); setShow(true);
  };
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const toggle = (id) =>
    setForm({ ...form, participants: form.participants.includes(id) ? form.participants.filter((p) => p !== id) : [...form.participants, id] });

  const save = async (e) => {
    e.preventDefault();
    setError('');
    if (form.endDate < form.startDate) return setError('End date must be after start date');
    try {
      const body = {
        title: form.title, description: form.description, trainer: form.trainer, mode: form.mode,
        startDate: form.startDate, endDate: form.endDate, status: form.status, participants: form.participants,
      };
      if (editId) await api.put(`/trainings/${editId}`, body);
      else await api.post('/trainings', body);
      setShow(false);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this training program?')) return;
    await api.delete(`/trainings/${id}`);
    load();
  };

  const canEdit = (t) => user.role === 'hr' || t.createdBy?._id === user._id;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <div className="page-title">{user.role === 'employee' ? 'My Trainings' : 'Training & Development'}</div>
          <div className="page-sub">
            {user.role === 'employee' ? 'Training programs you are enrolled in' : 'Plan training programs for your team'}
          </div>
        </div>
        {canManage && <button className="btn btn-primary" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i> New Program</button>}
      </div>

      <div className="row g-3">
        {list.map((t) => (
          <div key={t._id} className="col-md-6 col-xl-4">
            <div className="card-s h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <h6 className="fw-bold mb-0">{t.title}</h6>
                <Badge value={t.status} />
              </div>
              <p className="text-muted small">{t.description || 'No description'}</p>
              <div className="small d-grid gap-1 mb-3">
                <div><i className="bi bi-calendar-range me-2 text-primary"></i>{fmtDate(t.startDate)} – {fmtDate(t.endDate)}</div>
                <div><i className="bi bi-person-video3 me-2 text-primary"></i>{t.trainer || '-'} · {t.mode}</div>
                <div><i className="bi bi-people me-2 text-primary"></i>{t.participants.length} participant(s)</div>
                {user.role !== 'employee' && <div className="text-muted"><i className="bi bi-person me-2"></i>Created by {t.createdBy?.name}</div>}
              </div>
              {t.participants.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mb-3">
                  {t.participants.map((p) => <span key={p._id} className="badge soft-secondary">{p.name}</span>)}
                </div>
              )}
              {canManage && canEdit(t) && (
                <div className="mt-auto d-flex gap-2">
                  <button className="btn btn-sm btn-light" onClick={() => openEdit(t)}><i className="bi bi-pencil me-1"></i>Edit</button>
                  <button className="btn btn-sm btn-light text-danger" onClick={() => remove(t._id)}><i className="bi bi-trash me-1"></i>Delete</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {list.length === 0 && <div className="card-s empty"><i className="bi bi-mortarboard"></i>No training programs</div>}

      <Modal show={show} title={editId ? 'Edit Training Program' : 'New Training Program'} onClose={() => setShow(false)} size="modal-lg">
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={save}>
          <div className="row g-3">
            <div className="col-md-8"><label className="form-label small">Title *</label>
              <input name="title" className="form-control" value={form.title} onChange={change} required /></div>
            <div className="col-md-4"><label className="form-label small">Mode</label>
              <select name="mode" className="form-select" value={form.mode} onChange={change}><option>Online</option><option>Offline</option></select></div>
            <div className="col-12"><label className="form-label small">Description</label>
              <textarea name="description" className="form-control" rows="2" value={form.description} onChange={change} /></div>
            <div className="col-md-4"><label className="form-label small">Trainer</label>
              <input name="trainer" className="form-control" value={form.trainer} onChange={change} /></div>
            <div className="col-md-3"><label className="form-label small">Start *</label>
              <input type="date" name="startDate" className="form-control" value={form.startDate} onChange={change} required /></div>
            <div className="col-md-3"><label className="form-label small">End *</label>
              <input type="date" name="endDate" className="form-control" value={form.endDate} onChange={change} required /></div>
            <div className="col-md-2"><label className="form-label small">Status</label>
              <select name="status" className="form-select" value={form.status} onChange={change}><option>Upcoming</option><option>Ongoing</option><option>Completed</option></select></div>
            <div className="col-12">
              <label className="form-label small">Participants ({form.participants.length} selected)</label>
              <div className="border rounded p-2" style={{ maxHeight: 180, overflowY: 'auto' }}>
                {people.length === 0 && <div className="text-muted small p-2">No team members available</div>}
                {people.map((p) => (
                  <div key={p._id} className="form-check">
                    <input className="form-check-input" type="checkbox" id={'p' + p._id} checked={form.participants.includes(p._id)} onChange={() => toggle(p._id)} />
                    <label className="form-check-label small" htmlFor={'p' + p._id}>{p.name} <span className="text-muted">({p.department})</span></label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="text-end mt-4">
            <button type="button" className="btn btn-light me-2" onClick={() => setShow(false)}>Cancel</button>
            <button className="btn btn-primary">{editId ? 'Save Changes' : 'Create Program'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
