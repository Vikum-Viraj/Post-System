import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, FileText, Receipt, LogIn, UserPlus, LogOut, Home } from 'lucide-react';

interface NavbarProps {
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isAuthenticated, onLogout }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 text-xl font-bold text-gray-800">
            <ShoppingBag className="h-8 w-8 text-blue-600" />
            <span>POS System</span>
          </Link>

          <div className="flex items-center space-x-1">
            <NavLink to="/" icon={Home} text="Home" isActive={isActive('/')} />
            
            {isAuthenticated && (
              <>
                <NavLink to="/products" icon={ShoppingBag} text="Products" isActive={isActive('/products')} />
                <NavLink to="/quotations" icon={FileText} text="Quotations" isActive={isActive('/quotations')} />
                <NavLink to="/invoices" icon={Receipt} text="Invoices" isActive={isActive('/invoices')} />
              </>
            )}

            {!isAuthenticated ? (
              <>
                <NavLink to="/login" icon={LogIn} text="Login" isActive={isActive('/login')} />
                <NavLink to="/signup" icon={UserPlus} text="Sign Up" isActive={isActive('/signup')} />
              </>
            ) : (
              <button
                onClick={onLogout}
                className="flex items-center space-x-1 px-3 py-2 rounded-lg text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

interface NavLinkProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  isActive: boolean;
}

const NavLink: React.FC<NavLinkProps> = ({ to, icon: Icon, text, isActive }) => (
  <Link
    to={to}
    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 ${
      isActive
        ? 'bg-blue-100 text-blue-700'
        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
    }`}
  >
    <Icon className="h-4 w-4" />
    <span>{text}</span>
  </Link>
);

export default Navbar;