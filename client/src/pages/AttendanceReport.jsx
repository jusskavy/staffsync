import { useEffect, useState } from 'react';
import api from '../api';
import { useAuth } from '../AuthContext';
import { Badge, fmtDate, fmtTime, todayStr } from '../utils';

export default function AttendanceReport() {
  const { user } = useAuth();
  const [date, setDate] = useState(todayStr());
  const [list, setList] = useState([]);

  useEffect(() => {
    api.get('/attendance', { params: { date } }).then((r) => setList(r.data));
  }, [date]);

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <div className="page-title">{user.role === 'hr' ? 'Attendance Report' : 'Team Attendance'}</div>
          <div className="page-sub">{list.length} record(s) for {date ? fmtDate(date) : 'all dates'}</div>
        </div>
        <div className="d-flex gap-2">
          <input type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} />
          <button className="btn btn-light text-nowrap" onClick={() => setDate('')}>All dates</button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-responsive">
          <table className="table table-s">
            <thead><tr><th>Employee</th><th>Department</th><th>Date</th><th>Check In</th><th>Check Out</th><th>Status</th></tr></thead>
            <tbody>
              {list.map((a) => (
                <tr key={a._id}>
                  <td><div className="fw-semibold">{a.user?.name}</div><div className="text-muted small">{a.user?.employeeId}</div></td>
                  <td>{a.user?.department}</td>
                  <td>{fmtDate(a.date)}</td>
                  <td>{fmtTime(a.checkIn)}</td>
                  <td>{fmtTime(a.checkOut)}</td>
                  <td><Badge value={a.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {list.length === 0 && <div className="empty"><i className="bi bi-clock-history"></i>No attendance records</div>}
      </div>
    </>
  );
}
