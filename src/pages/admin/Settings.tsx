import React from 'react';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();
  return (
    <AdminLayout>
      <main className="flex-1 p-4 md:p-8 lg:p-10 w-full overflow-y-auto bg-surface-container-low min-h-[calc(100vh-64px)] md:min-h-screen mb-20 md:mb-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-variant transition-colors active:scale-95 duration-200 rounded-full flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight mb-1">
            System Settings
          </h1>
        </div>

        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6 md:p-10 max-w-3xl">
          <h3 className="font-headline font-semibold text-lg text-on-surface mb-6">General Preferences</h3>
          
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-on-surface">Voting Visibility</h4>
                    <p className="text-sm text-on-surface-variant">Allow students to see live results as they vote.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
             </div>

             <div className="flex items-center justify-between border-t border-surface-variant pt-6">
                <div>
                    <h4 className="font-semibold text-on-surface">Automatic Verification Review</h4>
                    <p className="text-sm text-on-surface-variant">Enable automated AI checks to approve verifications without manual review.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
             </div>

             <div className="flex items-center justify-between border-t border-surface-variant pt-6">
                <div>
                    <h4 className="font-semibold text-error">Danger Zone</h4>
                    <p className="text-sm text-on-surface-variant">Reset the voting results and flush all the votes.</p>
                </div>
                <button className="px-4 py-2 bg-error-container text-error rounded-lg font-medium hover:brightness-105 transition-all text-sm">
                    Reset Election
                </button>
             </div>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
