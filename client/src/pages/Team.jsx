import { useEffect, useState } from 'react';
import api from '../api';
import { fmtDate, initials } from '../utils';

export default function Team() {
  const [team, setTeam] = useState([]);
  useEffect(() => {
    api.get('/users/team').then((r) => setTeam(r.data));
  }, []);

  return (
    <>
      <div className="mb-4">
        <div className="page-title">My Team</div>
        <div className="page-sub">Employees reporting to you ({team.length})</div>
      </div>
      <div className="row g-3">
        {team.map((m) => (
          <div key={m._id} className="col-md-6 col-xl-4">
            <div className="card-s h-100">
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="avatar" style={{ width: 48, height: 48 }}>{initials(m.name)}</div>
                <div>
                  <div className="fw-bold">{m.name}</div>
                  <div className="text-muted small">{m.designation || m.department}</div>
                </div>
              </div>
              <div className="small text-muted d-grid gap-1">
                <div><i className="bi bi-person-vcard me-2"></i>{m.employeeId}</div>
                <div><i className="bi bi-envelope me-2"></i>{m.email}</div>
                <div><i className="bi bi-telephone me-2"></i>{m.phone || '-'}</div>
                <div><i className="bi bi-calendar me-2"></i>Joined {fmtDate(m.dateOfJoining)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {team.length === 0 && (
        <div className="card-s empty"><i className="bi bi-people"></i>No team members yet. HR can assign employees to you.</div>
      )}
    </>
  );
}
