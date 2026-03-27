import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function PublicLayout() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    // Force deep dark theme for the entire public funnel
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans flex flex-col selection:bg-[#FF4A1F]/30">
      
      {/* --- PREMIUM DARK NAVBAR --- */}
      <header 
        className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-neutral-950/80 backdrop-blur-xl border-neutral-800 shadow-lg shadow-black/20 py-3' 
            : 'bg-transparent border-transparent py-5'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#FF4A1F] rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_-3px_rgba(255,74,31,0.5)]">
              <svg viewBox="0 0 16 16" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 2L2 5.5V12.5L8 16L14 12.5V5.5L8 2ZM8 4.2L12 6.5V11L8 13.3L4 11V6.5L8 4.2Z"/>
              </svg>
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">Placium</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="/#how-it-works" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">How it Works</Link>
            <Link to="/pricing" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Pricing</Link>
            <Link to="/founder" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Our Story</Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Log in</Link>
            <Link to="/signup" className="text-sm font-medium bg-[#FF4A1F] text-white px-5 py-2.5 rounded-full hover:bg-[#E03A12] transition-colors shadow-lg shadow-[#FF4A1F]/20">
              Start Free Trial
            </Link>
          </div>

          <button 
            className="md:hidden p-2 text-neutral-300 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Dropdown (Dark Mode) */}
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-neutral-900 border-b border-neutral-800 shadow-2xl py-4 px-6 flex flex-col gap-4 md:hidden">
            <Link to="/pricing" className="text-lg font-medium text-neutral-300 hover:text-white">Pricing</Link>
            <Link to="/founder" className="text-lg font-medium text-neutral-300 hover:text-white">Our Story</Link>
            <hr className="border-neutral-800" />
            <Link to="/login" className="text-lg font-medium text-neutral-300 hover:text-white">Log in</Link>
            <Link to="/signup" className="text-lg font-bold text-[#FF4A1F]">Start Free Trial</Link>
          </div>
        )}
      </header>

      <main className="flex-grow pt-20"> 
        <Outlet />
      </main>

      {/* --- PREMIUM DARK FOOTER --- */}
      <footer className="bg-neutral-950 border-t border-neutral-900 py-12 mt-auto">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>© {new Date().getFullYear()} Placium. Engineered for Freshers.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </footer>

      {/* --- Sticky Mobile CTA --- */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-neutral-950/90 backdrop-blur-xl border-t border-neutral-900 p-4 z-50">
         <Link to="/signup" className="flex items-center justify-center w-full bg-[#FF4A1F] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#FF4A1F]/20 active:scale-[0.98] transition-transform">
            Launch Workspace
         </Link>
      </div>
    </div>
  );
}