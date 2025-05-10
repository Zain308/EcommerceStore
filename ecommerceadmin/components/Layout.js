import { useSession, signIn } from 'next-auth/react';
import Nav from '@/components/Nav';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';

export default function Layout({ children }) {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const handleNavigation = useCallback((path) => {
    closeMobileMenu();
    router.push(path);
  }, [closeMobileMenu, router]);

  if (!isMounted || status === 'loading') {
    return (
      <div className="bg-gradient-to-br from-gray-900 to-indigo-950 flex items-center justify-center h-screen">
        <div className="text-white text-lg font-semibold animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="bg-gradient-to-br from-gray-200 to-blue-100 flex items-center justify-center h-screen">
        <div className="text-center w-full max-w-sm p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Welcome Back</h2>
          <button
            onClick={() => signIn('google')}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-6 rounded-xl font-medium shadow-md hover:shadow-lg hover:brightness-110 transition-all duration-200"
            aria-label="Login with Google"
          >
            Login with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-950">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gradient-to-br from-gray-800 to-indigo-900 shadow-sm px-4 py-3 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-white">EcommerceAdmin</h1>
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md bg-indigo-700 hover:bg-indigo-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu - Matches Desktop Sidebar Styling */}
      <div
        className={`
          md:hidden fixed inset-0 z-30 bg-gradient-to-br from-gray-800 to-indigo-900 
          transition-all duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          pt-16 overflow-y-auto
        `}
      >
        <div className="px-4 py-4">
          <nav className="flex flex-col space-y-2">
            <NavItem onClick={() => handleNavigation('/')}>
              Dashboard
            </NavItem>
            <NavItem onClick={() => handleNavigation('/products')}>
              Products
            </NavItem>
            <NavItem onClick={() => handleNavigation('/categories')}>
              Categories
            </NavItem>
            <NavItem onClick={() => handleNavigation('/orders')}>
              Orders
            </NavItem>
            <NavItem onClick={() => handleNavigation('/settings')}>
              Settings
            </NavItem>
            <NavItem onClick={() => handleNavigation('/logout')}>
              Logout
            </NavItem>
          </nav>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:block fixed h-full z-50 w-64 bg-gradient-to-br from-gray-800 to-indigo-900">
        <div className="px-6 py-4 border-b border-gray-700">
          <h1 className="text-xl font-semibold text-white">EcommerceAdmin</h1>
        </div>
        <Nav />
      </div>

      {/* Main Content Area */}
      <div className="transition-all duration-200 md:ml-64 pt-16 md:pt-0">
        <div className="bg-white/95 backdrop-blur-sm min-h-screen p-4 md:p-6 rounded-tl-2xl md:rounded-l-2xl shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

function NavItem({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-3 text-gray-200 hover:text-white hover:bg-indigo-700 rounded-md transition-colors duration-200 flex items-center"
    >
      {children}
    </button>
  );
}