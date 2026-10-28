import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { useAuth } from '../AuthContext';
import Modal from '../components/Modal';
import { Badge, fmtDate } from '../utils';

const empty = { title: '', content: '', category: 'Announcement' };

export default function Announcements() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  const load = () => api.get('/announcements').then((r) => setList(r.data));
  useEffect(() => { load(); }, []);

  const openAdd = () => { setForm(empty); setEditId(null); setError(''); setShow(true); };
  const openEdit = (a) => { setForm({ title: a.title, content: a.content, category: a.category }); setEditId(a._id); setError(''); setShow(true); };

  const save = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/announcements/${editId}`, form);
      else await api.post('/announcements', form);
      setShow(false);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  const shown = filter ? list.filter((a) => a.category === filter) : list;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <div className="page-title">Announcements & News</div>
          <div className="page-sub">Stay updated with what's happening in the company</div>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All categories</option>
            <option>Announcement</option><option>News</option><option>Event</option><option>Policy</option>
          </select>
          {isHR && <button className="btn btn-primary text-nowrap" onClick={openAdd}><i className="bi bi-plus-lg me-1"></i> New Post</button>}
        </div>
      </div>

      <div className="row g-3">
        {shown.map((a) => (
          <div key={a._id} className="col-md-6">
            <div className="card-s h-100 d-flex flex-column">
              <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                <h6 className="fw-bold mb-0">{a.title}</h6>
                <Badge value={a.category} />
              </div>
              <p className="text-muted small flex-grow-1" style={{ whiteSpace: 'pre-line' }}>{a.content}</p>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted"><i className="bi bi-person me-1"></i>{a.postedBy?.name} · {fmtDate(a.createdAt)}</small>
                {isHR && (
                  <div>
                    <button className="btn btn-sm btn-light me-1" onClick={() => openEdit(a)}><i className="bi bi-pencil"></i></button>
                    <button className="btn btn-sm btn-light text-danger" onClick={() => remove(a._id)}><i className="bi bi-trash"></i></button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {shown.length === 0 && <div className="card-s empty"><i className="bi bi-megaphone"></i>No announcements</div>}

      <Modal show={show} title={editId ? 'Edit Post' : 'New Announcement'} onClose={() => setShow(false)}>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={save}>
          <div className="mb-3"><label className="form-label small">Title</label>
            <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
          <div className="mb-3"><label className="form-label small">Category</label>
            <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option>Announcement</option><option>News</option><option>Event</option><option>Policy</option>
            </select></div>
          <div className="mb-3"><label className="form-label small">Content</label>
            <textarea className="form-control" rows="5" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></div>
          <div className="text-end">
            <button type="button" className="btn btn-light me-2" onClick={() => setShow(false)}>Cancel</button>
            <button className="btn btn-primary">{editId ? 'Save' : 'Publish'}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
