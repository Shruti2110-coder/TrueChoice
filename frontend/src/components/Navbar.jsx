import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { initials } from '../lib/initials';

const linkClass = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;

function Navbar() {
  const { user, isLoggedIn, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast('Signed out', 'info');
    navigate('/');
  };

  return (
    <nav className="nav">
      <NavLink to="/" className="nav-brand">
        <span className="nav-mark" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2.6 4.2 6v5.6c0 4.6 3.2 8.6 7.8 9.8 4.6-1.2 7.8-5.2 7.8-9.8V6L12 2.6Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="m8.6 12.2 2.3 2.3 4.5-4.6"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="nav-word">TrueChoice</span>
      </NavLink>

      <div className="nav-links">
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>
        <NavLink to="/vote" className={linkClass}>
          Vote
        </NavLink>
        {!isLoggedIn && (
          <NavLink to="/login" className={linkClass}>
            Login
          </NavLink>
        )}
      </div>

      <div className="nav-actions">
        {isLoggedIn ? (
          <>
            <div className="nav-user" title={user?.name || 'Voter'}>
              <span className="avatar">{initials(user?.name)}</span>
              {user?.name?.split(' ')[0] || 'Voter'}
            </div>
            <button type="button" className="btn btn-ghost" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost">
              Log in
            </NavLink>
            <NavLink to="/signup" className="btn btn-primary">
              Get started
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
