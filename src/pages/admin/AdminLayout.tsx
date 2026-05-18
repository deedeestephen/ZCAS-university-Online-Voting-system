import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logoUrl from '../../assets/images/regenerated_image_1778103979877.png';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  return (
    <div className="bg-surface text-on-surface font-body antialiased flex h-screen overflow-hidden">
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside className={`fixed inset-y-0 left-0 z-[70] bg-slate-50 dark:bg-slate-950 text-blue-900 dark:text-blue-400 font-public-sans text-sm h-screen w-64 flex flex-col border-r border-slate-200 dark:border-slate-800 p-4 gap-2 shadow-2xl transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center px-2 mt-2 mb-6">
          <div className="flex items-center gap-3">
            <img alt="ZCAS University Crest" className="w-10 h-10 object-contain rounded-full shadow-sm" src={logoUrl} />
            <div>
              <div className="font-black text-blue-900 dark:text-white uppercase tracking-widest leading-tight">Admin Portal</div>
              <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Official Oversight</div>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="p-2 -mr-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <NavLink onClick={() => setIsSidebarOpen(false)} to="/admin" end className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${isActive ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 border-r-4 border-blue-900 dark:border-blue-500 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:pl-5'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink onClick={() => setIsSidebarOpen(false)} to="/admin/candidates" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${isActive ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 border-r-4 border-blue-900 dark:border-blue-500 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:pl-5'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
          <span>Candidates</span>
        </NavLink>
        
        <NavLink onClick={() => setIsSidebarOpen(false)} to="/admin/students" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${isActive ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 border-r-4 border-blue-900 dark:border-blue-500 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:pl-5'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person_search</span>
          <span>Students</span>
        </NavLink>
        
        <NavLink onClick={() => setIsSidebarOpen(false)} to="/admin/reviews" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${isActive ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 border-r-4 border-blue-900 dark:border-blue-500 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:pl-5'}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>fact_check</span>
          <span>Verification Reviews</span>
        </NavLink>

        <NavLink onClick={() => setIsSidebarOpen(false)} to="/admin/settings" className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer ${isActive ? 'bg-white dark:bg-slate-900 text-blue-900 dark:text-blue-300 border-r-4 border-blue-900 dark:border-blue-500 font-bold shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:pl-5'}`}>
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </NavLink>

        <div className="mt-auto flex flex-col gap-2">
          <button onClick={() => toast.error('Export not yet implemented')} className="flex items-center justify-center w-full gap-2 px-4 py-2 bg-primary-container text-on-primary-container rounded-lg font-bold hover:brightness-110 active:scale-[0.98] transition-all">
            <span className="material-symbols-outlined text-[20px]">download</span>
            Export Results
          </button>
          <button onClick={handleLogout} className="flex items-center w-full gap-3 px-4 py-3 rounded-lg transition-all duration-300 cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:pl-5">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>logout</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
        <header className="bg-white/90 shrink-0 dark:bg-slate-900/90 backdrop-blur-md text-blue-900 dark:text-blue-400 font-public-sans antialiased docked full-width top-0 sticky z-40 border-b border-slate-200 dark:border-slate-800 shadow-sm flex justify-between items-center px-4 h-16 w-full">
            <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors mr-2 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">menu</span>
            </button>
            <img alt="ZCAS University Crest" className="w-8 h-8 object-contain" src={logoUrl} />
            <span className="text-lg font-bold tracking-tight text-blue-900 dark:text-slate-100">ZCAS Voting</span>
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
        </header>

        {children}
        
        <nav className="md:hidden bg-white dark:bg-slate-900 text-[10px] font-medium font-public-sans text-blue-900 dark:text-blue-400 fixed bottom-0 w-full z-50 border-t border-slate-200 dark:border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex justify-around items-center h-20 pb-safe px-2">
            <NavLink to="/admin" end className={({isActive}) => `flex flex-col items-center justify-center px-4 py-1 active:scale-90 transition-transform ${isActive ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-xl' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700'}`}>
                <span className="material-symbols-outlined mb-1 text-[24px]">dashboard</span>
                <span>Dashboard</span>
            </NavLink>
            <NavLink to="/admin/candidates" className={({isActive}) => `flex flex-col items-center justify-center px-4 py-1 active:scale-90 transition-transform ${isActive ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-xl' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700'}`}>
                <span className="material-symbols-outlined mb-1 text-[24px]">group</span>
                <span>Candidates</span>
            </NavLink>
            <NavLink to="/admin/reviews" className={({isActive}) => `flex flex-col items-center justify-center px-4 py-1 active:scale-90 transition-transform ${isActive ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-xl' : 'text-slate-500 dark:text-slate-400 hover:text-blue-700'}`}>
                <span className="material-symbols-outlined mb-1 text-[24px]">fact_check</span>
                <span>Reviews</span>
            </NavLink>
        </nav>
      </div>
    </div>
  );
}
