import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = () => {
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/login';
    }
  };

  return (
    // Sabit genişlik, flex-shrink: 0 ile genişlemesini engelle
    <div style={{ width: '280px', flexShrink: 0 }} className="bg-dark d-flex flex-column vh-100">
      {/* Header */}
      <div className="p-3 text-white">
        <h5>Transport App</h5>
        <hr className="bg-white" />
      </div>
      
      {/* Navigation Links */}
      <ul className="nav nav-pills flex-column px-3">
        <li className="nav-item mb-2">
          <NavLink 
            to="/routes" 
            className={({ isActive }) => 
              `nav-link text-white ${isActive ? 'bg-primary' : ''}`
            }
          >
            🚗 Routes
          </NavLink>
        </li>
        
        {isAdmin && (
          <>
            <li className="nav-item mb-2">
              <NavLink 
                to="/locations" 
                className={({ isActive }) => 
                  `nav-link text-white ${isActive ? 'bg-primary' : ''}`
                }
              >
                📍 Locations
              </NavLink>
            </li>
            <li className="nav-item mb-2">
              <NavLink 
                to="/transportations" 
                className={({ isActive }) => 
                  `nav-link text-white ${isActive ? 'bg-primary' : ''}`
                }
              >
                🚌 Transportations
              </NavLink>
            </li>
          </>
        )}
      </ul>
      
      {/* User Info & Logout */}
      <div className="mt-auto p-3">
        <div className="text-white-50 small mb-2">
          <strong>{user?.username}</strong>
          <br />
          <span className="text-capitalize">Role: {user?.role?.toLowerCase()}</span>
        </div>
        <button 
          onClick={handleLogout}
          className="btn btn-outline-danger btn-sm w-100"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;