import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LogOut, LogIn, ShoppingCart, Store, User, Home, Lock } from "lucide-react";
import logo from "../assets/HARITHAM.png";
import UpdatePassword from "./UpdatePassword";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    document.cookie = "userId=; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    setDropdownOpen(false);
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.trim().split(" ").filter(Boolean);
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(user?.name);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOpen && !event.target.closest('.mobile-menu-container')) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) => `
    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
    ${isActive(path) 
      ? 'bg-green-600 text-white' 
      : 'text-gray-100 hover:bg-green-600/50 hover:text-white'
    }
  `;

  return (
    <nav className="bg-gradient-to-r from-green-700 to-green-800 text-white shadow-lg fixed top-0 left-0 right-0 z-50">
      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Update Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <UpdatePassword onSuccess={() => setShowPasswordModal(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src={logo} alt="Haritham Logo" className="h-10 sm:h-12 w-auto transition-transform duration-300 group-hover:scale-105" />
            <div className="hidden sm:block">
              <span className="text-xl font-bold tracking-wide">Haritham</span>
              <p className="text-xs text-green-200">Farm Fresh Marketplace</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <Link to="/" className={navLinkClass('/')}>
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>
            {user && (
              <>
                <Link to="/buy" className={navLinkClass('/buy')}>
                  <ShoppingCart className="w-5 h-5" />
                  <span>Buy</span>
                </Link>
                <Link to="/sell" className={navLinkClass('/sell')}>
                  <Store className="w-5 h-5" />
                  <span>Sell</span>
                </Link>
              </>
            )}

            {/* User Profile/Login Button */}
            <div className="relative ml-4" ref={dropdownRef}>
              {user ? (
                <>
                  <div
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-10 h-10 bg-white text-green-800 flex items-center justify-center rounded-full text-sm font-bold cursor-pointer hover:ring-2 ring-white transition-all duration-200 hover:scale-105"
                  >
                    {initials}
                  </div>
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 text-gray-700 transform transition-all duration-200 ease-in-out overflow-hidden">
                      <div className="p-3 border-b border-gray-100">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        className="block px-4 py-3 text-left hover:bg-gray-50 flex items-center text-sm transition-colors duration-200"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setShowPasswordModal(true);
                          setDropdownOpen(false);
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center text-sm transition-colors duration-200"
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center text-sm transition-colors duration-200 text-red-600"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 px-4 py-2 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-all duration-200"
                >
                  <LogIn className="w-5 h-5" />
                  <span>Login</span>
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-2 hover:bg-green-600/50 rounded-lg transition-colors duration-200"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-green-800/95 backdrop-blur-sm text-white text-base font-medium animate-slideDown mobile-menu-container">
          <Link 
            to="/" 
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/') ? 'bg-green-600' : 'hover:bg-green-600/50'}`}
            onClick={() => setMenuOpen(false)}
          >
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          {user ? (
            <>
              <Link 
                to="/buy" 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/buy') ? 'bg-green-600' : 'hover:bg-green-600/50'}`}
                onClick={() => setMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Buy</span>
              </Link>
              <Link 
                to="/sell" 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${isActive('/sell') ? 'bg-green-600' : 'hover:bg-green-600/50'}`}
                onClick={() => setMenuOpen(false)}
              >
                <Store className="w-5 h-5" />
                <span>Sell</span>
              </Link>
              <div className="px-4 py-3 border-t border-green-700/50">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-white text-green-800 flex items-center justify-center rounded-full text-sm font-bold">
                    {initials}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-green-200">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-red-600/10 text-red-400 rounded-lg hover:bg-red-600/20 transition-colors duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </>
          ) : (
            <Link 
              to="/login" 
              className="flex items-center space-x-3 px-4 py-3 bg-white text-green-700 rounded-lg hover:bg-green-50 transition-colors duration-200" 
              onClick={() => setMenuOpen(false)}
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
