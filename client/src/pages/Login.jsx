import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { errMsg } from '../api';

const demoUsers = [
  { label: 'HR', email: 'hr@staffsync.com' },
  { label: 'Manager', email: 'manager@staffsync.com' },
  { label: 'Employee', email: 'employee@staffsync.com' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-hero">
        <div className="d-flex align-items-center gap-2">
          <div className="brand-logo">S</div>
          <span className="fw-bold fs-5">StaffSync</span>
        </div>
        <div>
          <h1 className="mb-3">Modern human resource management, all in one place.</h1>
          <p className="opacity-75 mb-4">Built for HR personnel, managers and employees.</p>
          <div className="hero-feature"><i className="bi bi-people"></i><div>Employee records & role based access</div></div>
          <div className="hero-feature"><i className="bi bi-calendar2-check"></i><div>Leave requests with approval workflow</div></div>
          <div className="hero-feature"><i className="bi bi-fingerprint"></i><div>Daily attendance check-in / check-out</div></div>
          <div className="hero-feature"><i className="bi bi-megaphone"></i><div>Company announcements & training programs</div></div>
        </div>
        <small className="opacity-50">© {new Date().getFullYear()} StaffSync</small>
      </div>

      <div className="login-form-side">
        <div className="login-box">
          <h3 className="fw-bold mb-1">Welcome back</h3>
          <p className="text-muted mb-4">Sign in to continue to your dashboard</p>

          {error && <div className="alert alert-danger py-2">{error}</div>}

          <form onSubmit={submit}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input type="email" className="form-control form-control-lg" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Password</label>
              <input type="password" className="form-control form-control-lg" value={password}
                onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button className="btn btn-primary btn-lg w-100" disabled={busy}>
              {busy ? <span className="spinner-border spinner-border-sm" /> : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 p-3 rounded-3 bg-light">
            <div className="small fw-semibold mb-2">Demo login (password: password123)</div>
            <div className="d-flex gap-2 flex-wrap">
              {demoUsers.map((d) => (
                <button key={d.label} type="button" className="btn btn-outline-primary btn-sm demo-btn"
                  onClick={() => { setEmail(d.email); setPassword('password123'); }}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
