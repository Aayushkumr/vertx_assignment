import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import NotificationPanel from './NotificationPanel';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <div className="flex items-center space-x-4">
      <span className="text-gray-700">
        <span className="font-medium">Credits:</span> {user?.credits || 0}
      </span>
      <Link to="/dashboard" className="text-gray-700 hover:text-blue-600">
        Dashboard
      </Link>
      <Link to="/feed" className="text-gray-700 hover:text-blue-600">
        Feed
      </Link>
      <Link to="/saved" className="text-gray-700 hover:text-blue-600">
        Saved
      </Link>
      <Link to="/profile" className="text-gray-700 hover:text-blue-600">
        Profile
      </Link>
      {user?.role === 'admin' && (
        <Link to="/admin" className="text-indigo-700 hover:text-indigo-900 font-medium">
          Admin
        </Link>
      )}
      <NotificationPanel />
      <button
        onClick={onLogout}
        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
      >
        Logout
      </button>
    </div>
  );

  const guestLinks = (
    <div className="flex items-center space-x-4">
      <Link to="/login" className="text-gray-700 hover:text-blue-600">
        Login
      </Link>
      <Link
        to="/register"
        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Register
      </Link>
    </div>
  );

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-xl font-bold text-blue-600">
            Creator Dashboard
          </Link>
          {isAuthenticated ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;