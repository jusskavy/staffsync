import { useEffect, useState } from 'react';
import api, { errMsg } from '../api';
import { Badge, fmtDate, fmtTime } from '../utils';

const hoursBetween = (a, b) => (a && b ? ((new Date(b) - new Date(a)) / 3600000).toFixed(1) + ' h' : '-');

export default function Attendance() {
  const [today, setToday] = useState(null);
  const [history, setHistory] = useState([]);
  const [now, setNow] = useState(new Date());
  const [error, setError] = useState('');

  const load = () => {
    api.get('/attendance/today').then((r) => setToday(r.data));
    api.get('/attendance/my').then((r) => setHistory(r.data));
  };
  useEffect(load, []);
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const mark = async (type) => {
    setError('');
    try {
      await api.post(`/attendance/${type}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <>
      <div className="mb-4">
        <div className="page-title">Attendance</div>
        <div className="page-sub">Mark your daily check-in and check-out</div>
      </div>

      <div className="row g-3">
        <div className="col-lg-4">
          <div className="card-s text-center">
            <div className="text-muted small">{now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="clock-time my-2">{now.toLocaleTimeString('en-IN')}</div>
            {error && <div className="alert alert-danger py-2 small">{error}</div>}

            <div className="d-flex justify-content-center gap-4 my-3">
              <div><div className="text-muted small">Check in</div><div className="fw-bold">{fmtTime(today?.checkIn)}</div></div>
              <div><div className="text-muted small">Check out</div><div className="fw-bold">{fmtTime(today?.checkOut)}</div></div>
            </div>

            {!today && (
              <button className="btn btn-primary btn-lg w-100" onClick={() => mark('check-in')}>
                <i className="bi bi-box-arrow-in-right me-2"></i>Check In
              </button>
            )}
            {today && !today.checkOut && (
              <button className="btn btn-outline-danger btn-lg w-100" onClick={() => mark('check-out')}>
                <i className="bi bi-box-arrow-right me-2"></i>Check Out
              </button>
            )}
            {today?.checkOut && (
              <div className="alert alert-success mb-0 py-2"><i className="bi bi-check-circle me-1"></i>Attendance completed for today</div>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          <div className="table-wrap">
            <div className="p-3 border-bottom fw-bold">Recent Attendance</div>
            <div className="table-responsive">
              <table className="table table-s">
                <thead><tr><th>Date</th><th>Check In</th><th>Check Out</th><th>Hours</th><th>Status</th></tr></thead>
                <tbody>
                  {history.map((a) => (
                    <tr key={a._id}>
                      <td>{fmtDate(a.date)}</td>
                      <td>{fmtTime(a.checkIn)}</td>
                      <td>{fmtTime(a.checkOut)}</td>
                      <td>{hoursBetween(a.checkIn, a.checkOut)}</td>
                      <td><Badge value={a.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {history.length === 0 && <div className="empty"><i className="bi bi-clock"></i>No attendance records yet</div>}
          </div>
        </div>
      </div>
    </>
  );
}
