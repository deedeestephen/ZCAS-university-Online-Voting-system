import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import logoUrl from '../../assets/images/regenerated_image_1778103979877.png';

export default function VoteConfirmation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const receiptId = searchParams.get('receipt') || `TXN-${Math.random().toString(36).substring(2, 6).toUpperCase()}-ZC-{(Math.random()*1000|0).toString(16).toUpperCase()}`;

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex items-center justify-center p-4 antialiased">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-surface pointer-events-none"></div>
      <main className="relative z-10 w-full max-w-lg">
        <div className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 md:p-10 text-center border border-outline-variant/30 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-secondary"></div>
          
          <div className="mb-8 flex justify-center">
            <img alt="ZCAS University Logo" className="h-16 object-contain" src={logoUrl} />
          </div>

          <div className="relative inline-flex items-center justify-center w-24 h-24 mb-6 rounded-full bg-secondary-container/30">
            <div className="absolute inset-0 rounded-full bg-secondary-container animate-pulse opacity-20"></div>
            <span className="material-symbols-outlined text-6xl text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>

          <h1 className="font-headline text-2xl md:text-3xl font-bold text-on-surface mb-3 tracking-tight">Your vote has been cast successfully!</h1>
          <p className="text-on-surface-variant text-sm md:text-base mb-8">Your ballot has been securely encrypted and submitted to the blockchain ledger. Thank you for participating.</p>
          
          <div className="bg-surface-container-low rounded-xl p-5 mb-8 text-left border border-outline-variant/50">
            <h2 className="font-label text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-4 border-b border-outline-variant/30 pb-2">Digital Receipt</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Status</span>
                <span className="inline-flex items-center gap-1 text-secondary font-medium text-sm bg-secondary-container/20 px-2 py-0.5 rounded">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Verified
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Transaction ID</span>
                <span className="font-mono text-on-surface text-sm font-medium">{receiptId}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant text-sm">Timestamp</span>
                <span className="text-on-surface text-sm font-medium">{new Date().toLocaleString()}</span>
              </div>
            </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="w-full bg-primary-container text-on-primary py-3.5 px-6 rounded-xl font-label font-bold text-base hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm">
            <span className="material-symbols-outlined text-[20px]">dashboard</span>
            Return to Dashboard
          </button>

          <div className="mt-6 flex items-center justify-center gap-1 text-xs text-on-surface-variant/70 font-mono">
            <span className="material-symbols-outlined text-[14px]">lock</span>
            End-to-end encrypted
          </div>
        </div>
      </main>
    </div>
  );
}
