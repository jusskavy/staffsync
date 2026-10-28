import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Badge, fmtDate, fmtTime } from '../utils';

function Stat({ icon, color, value, label }) {
  return (
    <div className="col-sm-6 col-xl-3">
      <div className="card-s stat-card h-100">
        <div className={`stat-icon bg-soft-${color}`}><i className={`bi bi-${icon}`}></i></div>
        <div>
          <div className="stat-value">{value ?? 0}</div>
          <div className="stat-label">{label}</div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  const s = data.stats;
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <div className="mb-4">
        <div className="page-title">{greet}, {user.name.split(' ')[0]} 👋</div>
        <div className="page-sub">Here is what is happening today.</div>
      </div>

      <div className="row g-3 mb-4">
        {user.role === 'hr' && (
          <>
            <Stat icon="people" color="primary" value={s.totalEmployees} label="Total Employees" />
            <Stat icon="person-check" color="success" value={s.presentToday} label="Present Today" />
            <Stat icon="hourglass-split" color="warning" value={s.pendingLeaves} label="Pending Leaves" />
            <Stat icon="person-badge" color="info" value={s.managers} label="Managers" />
          </>
        )}
        {user.role === 'manager' && (
          <>
            <Stat icon="people" color="primary" value={s.teamSize} label="Team Members" />
            <Stat icon="person-check" color="success" value={s.teamPresentToday} label="Team Present Today" />
            <Stat icon="hourglass-split" color="warning" value={s.pendingLeaves} label="Leaves to Review" />
            <Stat icon="mortarboard" color="info" value={s.trainings} label="Active Trainings" />
          </>
        )}
        {user.role === 'employee' && (
          <>
            <Stat icon="calendar-heart" color="primary" value={s.leaveBalance} label="Leave Balance (days)" />
            <Stat icon="calendar-check" color="success" value={s.daysPresentThisMonth} label="Days Present This Month" />
            <Stat icon="hourglass-split" color="warning" value={s.myPendingLeaves} label="Pending Leave Requests" />
            <Stat icon="mortarboard" color="info" value={s.myTrainings} label="My Trainings" />
          </>
        )}
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card-s h-100">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="fw-bold mb-0">Latest Announcements</h6>
              <Link to="/announcements" className="small text-decoration-none">View all</Link>
            </div>
            {data.latestNews.length === 0 && <div className="empty"><i className="bi bi-megaphone"></i>No announcements yet</div>}
            {data.latestNews.map((n) => (
              <div key={n._id} className="news-item">
                <div className="d-flex justify-content-between gap-2">
                  <div className="fw-semibold">{n.title}</div>
                  <Badge value={n.category} />
                </div>
                <div className="text-muted small mt-1">{n.content.length > 140 ? n.content.slice(0, 140) + '…' : n.content}</div>
                <div className="text-muted mt-1" style={{ fontSize: 12 }}>{n.postedBy?.name} · {fmtDate(n.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-5">
          {user.role === 'hr' ? (
            <div className="card-s h-100">
              <h6 className="fw-bold mb-3">Employees by Department</h6>
              {s.departments.map((d) => (
                <div key={d.name} className="mb-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span>{d.name}</span><span className="fw-semibold">{d.count}</span>
                  </div>
                  <div className="progress" style={{ height: 8 }}>
                    <div className="progress-bar" style={{ width: `${(d.count / s.totalEmployees) * 100}%`, background: 'var(--brand)' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-s h-100">
              <h6 className="fw-bold mb-3">Today's Attendance</h6>
              {s.todayAttendance ? (
                <>
                  <div className="d-flex gap-4 mb-3">
                    <div><div className="text-muted small">Check in</div><div className="fw-bold fs-5">{fmtTime(s.todayAttendance.checkIn)}</div></div>
                    <div><div className="text-muted small">Check out</div><div className="fw-bold fs-5">{fmtTime(s.todayAttendance.checkOut)}</div></div>
                  </div>
                  <Badge value={s.todayAttendance.status} />
                </>
              ) : (
                <p className="text-muted">You have not checked in yet today.</p>
              )}
              <Link to="/attendance" className="btn btn-primary btn-sm mt-3">Go to Attendance</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
