import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function VerificationStatus() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  // If approved, you can redirect directly or show the success and a button.
  // We'll show the success screen with a 'Cast Your Vote' button.

  const isRejected = userData?.status === 'rejected';
  const isVerified = userData?.isVerified;
  const isPending = !isRejected && !isVerified;

  const getStatusColor = () => {
    if (isRejected) return 'bg-error';
    if (isVerified) return 'bg-[#14B8A6]'; // Or secondary
    return 'bg-primary';
  };

  const getIconContainerColor = () => {
    if (isRejected) return 'bg-error-container text-error ring-error-container/30';
    if (isVerified) return 'bg-secondary-container text-secondary ring-secondary-container/30';
    return 'bg-primary-container/20 text-primary ring-primary-container/20';
  };

  const getIcon = () => {
    if (isRejected) return 'gpp_bad';
    if (isVerified) return 'verified';
    return 'hourglass_top';
  };

  const getTitle = () => {
    if (isRejected) return 'Verification Rejected';
    if (isVerified) return 'Identity Verified';
    return 'Pending Admin Approval';
  };

  const getMessage = () => {
    if (isRejected) return 'We could not securely verify your identity using the provided document. Please ensure your Student ID is clearly visible, well-lit, and matches our records.';
    if (isVerified) return 'Your identity has been successfully verified. You are now eligible to participate in the SRC Elections.';
    return 'Your details have been submitted and are currently being reviewed by an administrator. This usually takes a short while.';
  };

  return (
    <div className="bg-surface-container-lowest text-on-background font-body min-h-screen flex flex-col antialiased">
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-primary font-headline antialiased w-full top-0 sticky z-50 border-b border-surface-variant shadow-sm flex justify-between items-center px-4 h-16">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-variant transition-colors active:scale-95 duration-200 rounded-full flex items-center justify-center text-on-surface-variant mr-1">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <img alt="ZCAS University Logo" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida/ADBb0ui1wPRYTdVCCUxfDec7YsS2S_HxYSeKaDIkpvyZO0FydNOVZA8lpm8YrmVlbUqiHFNqjZHbSu4a92FbN5r3klFSq51bZQ2eRmouzDn3pjCF0HFWJAZuQ1P7p5DZMD8vQoBMYYT-wvlvd4cufYP44kw_O0F_3-0pOJgdrSouDm7wwUqHgwXDlSHLInQFyk9dNCsq_2WlFzGWDE8OlRS4Dij-Ix6MYAPEQiD_3c-o2hGdP8wKFDtBWoFfbJG5_4mq80GiB-AYHmQo8ig" />
          <span className="text-lg font-bold tracking-tight text-primary hidden sm:inline-block">ZCAS Voting</span>
        </div>
        <div className="flex items-center">
          <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-surface-variant transition-colors active:scale-95 duration-200 rounded-full flex items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden bg-surface">
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center opacity-30">
          <div className="w-[800px] h-[800px] bg-gradient-to-tr from-surface-variant to-surface-bright rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-surface-variant overflow-hidden flex flex-col">
          <div className={`h-2 w-full ${getStatusColor()}`}></div>
          <div className="p-8 flex flex-col items-center text-center">
            
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ${getIconContainerColor()}`}>
              <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {getIcon()}
              </span>
            </div>

            <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-3 tracking-tight">
              {getTitle()}
            </h1>

            <p className="font-body text-on-surface-variant text-sm leading-relaxed mb-8 px-2">
              {getMessage()}
              {userData?.adminNotes && isRejected && (
                <span className="block mt-2 font-medium text-error">
                  Admin Note: {userData.adminNotes}
                </span>
              )}
            </p>

            {isRejected && (
              <div className="w-full bg-surface-container-low rounded-lg p-4 mb-8 text-left border border-surface-variant flex gap-3 items-start">
                <span className="material-symbols-outlined text-outline text-lg mt-0.5">info</span>
                <div className="flex-1">
                  <h3 className="font-headline font-semibold text-on-surface text-sm mb-1">Common Issues</h3>
                  <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside font-body">
                    <li>Image was blurry or too dark</li>
                    <li>ID card edges were cropped out</li>
                    <li>Glare obscured critical details</li>
                  </ul>
                </div>
              </div>
            )}

            {isVerified && (
              <div className="w-full bg-surface-container-low rounded-lg p-4 mb-8 text-left border border-surface-variant flex gap-3 items-start">
                <span className="material-symbols-outlined text-secondary text-lg mt-0.5">how_to_vote</span>
                <div className="flex-1">
                  <h3 className="font-headline font-semibold text-on-surface text-sm mb-1">Next Steps</h3>
                  <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside font-body">
                    <li>Review election guidelines</li>
                    <li>Browse candidates and manifestos</li>
                    <li>Cast your secure vote</li>
                  </ul>
                </div>
              </div>
            )}

            {isPending && (
              <div className="w-full bg-surface-container-low rounded-lg p-4 mb-8 text-left border border-surface-variant flex gap-3 items-start">
                <span className="material-symbols-outlined text-primary text-lg mt-0.5">info</span>
                <div className="flex-1">
                  <h3 className="font-headline font-semibold text-on-surface text-sm mb-1">What happens next?</h3>
                  <ul className="text-xs text-on-surface-variant space-y-1 list-disc list-inside font-body">
                    <li>An admin will review your credentials manually</li>
                    <li>You will be notified upon approval or rejection</li>
                    <li>You can return to the dashboard in the meantime</li>
                  </ul>
                </div>
              </div>
            )}

            <div className="w-full flex flex-col gap-3">
              {isRejected && (
                <>
                  <button onClick={() => navigate('/upload-id')} className="w-full bg-primary text-on-primary font-label font-bold py-3.5 px-6 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">refresh</span>
                    Retry Verification
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="w-full bg-transparent text-primary font-label font-semibold py-3 px-6 rounded-lg hover:bg-surface-variant transition-colors duration-200">
                    Return to Dashboard
                  </button>
                </>
              )}
              {isVerified && (
                <>
                  <button onClick={() => navigate('/guidelines')} className="w-full bg-[#14B8A6] text-white font-label font-bold py-3.5 px-6 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[20px]">how_to_vote</span>
                    Cast Your Vote
                  </button>
                  <button onClick={() => navigate('/dashboard')} className="w-full bg-transparent text-primary font-label font-semibold py-3 px-6 rounded-lg hover:bg-surface-variant transition-colors duration-200">
                    Return to Dashboard
                  </button>
                </>
              )}
              {isPending && (
                <button onClick={() => navigate('/dashboard')} className="w-full bg-primary text-on-primary font-label font-bold py-3.5 px-6 rounded-lg shadow-sm hover:brightness-110 active:scale-95 transition-all duration-200 flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                  Return to Dashboard
                </button>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-label text-outline font-medium z-10">
          <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">lock</span> Secure Portal</span>
          <span>•</span>
          <span>ZCAS Electoral Commission</span>
        </div>
      </main>
    </div>
  );
}
