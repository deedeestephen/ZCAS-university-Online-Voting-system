import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import toast from 'react-hot-toast';

const POSITIONS = [
    'President',
    'Vice President',
    'Prime Minister',
    'Sport Minister',
    'Academic Minister',
    'Finance Minister',
    'Foreign Affairs Minister'
];

export default function StudentDashboard() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const isVerified = userData?.isVerified;
  const status = userData?.status;
  const hasVoted = userData?.hasVoted;
  const currentPos = userData?.currentVotingPosition || POSITIONS[0];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const startVoting = () => {
    navigate(`/vote/${currentPos.toLowerCase().replace(/ /g, '-')}`);
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-20 md:pb-0 min-h-screen bg-background text-on-background font-body">
      <header className="fixed top-0 z-40 bg-surface/80 backdrop-blur-sm px-4 md:px-8 py-4 md:py-6 flex justify-between items-center w-full shadow-sm border-b border-outline-variant">
        <div className="flex items-center gap-2">
            <span className="font-headline font-semibold text-xl text-primary">ZCAS Voting</span>
        </div>
        <div className="flex items-center gap-4 text-on-surface-variant">
          <div className="flex items-center gap-3 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant">
            <div className="h-8 w-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-sm">
                {userData?.name?.substring(0, 2).toUpperCase() || '..'}
            </div>
            <span className="font-label text-sm font-medium hidden md:block">{userData?.name || 'Student'}</span>
          </div>
          <button onClick={handleLogout} className="hover:bg-surface-container p-2 rounded-full transition-colors material-symbols-outlined">
            logout
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pt-24 md:pt-28 md:px-8 max-w-5xl mx-auto w-full flex flex-col gap-8">
        <section>
          <h1 className="font-display font-bold text-3xl md:text-4xl text-on-surface mb-2">
            Hello, {userData?.name?.split(' ')[0] || 'Student'}
          </h1>
          <p className="text-on-surface-variant font-body md:text-lg">
            Student ID: <span className="font-mono font-medium text-primary">{userData?.studentId || 'Pending'}</span>
          </p>
        </section>

        <section className="bg-surface-container-lowest rounded-xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-container rounded-full mix-blend-multiply blur-3xl opacity-10 translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
          
          <div className="flex flex-col gap-2 z-10">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-3 w-3">
                {isVerified && !hasVoted && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${isVerified && !hasVoted ? 'bg-secondary' : 'bg-outline'}`}></span>
              </span>
              <span className={`font-label text-sm font-bold uppercase tracking-wider ${isVerified && !hasVoted ? 'text-secondary' : 'text-outline'}`}>
                {hasVoted ? 'Vote Submitted' : (isVerified ? 'Live Now' : status === 'rejected' ? 'Verification Rejected' : 'Pending Verification')}
              </span>
            </div>
            <h2 className="font-headline font-bold text-2xl md:text-3xl text-on-surface">2024 SRC Elections</h2>
            <p className="text-on-surface-variant font-body">
              {hasVoted ? 'Thank you for participating.' : (isVerified ? 'Polls are open. Your vote matters.' : status === 'rejected' ? 'Your identity verification was rejected. Please retry.' : 'Please complete your identity verification.')}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto z-10">
            {isVerified && !hasVoted && (
                <button onClick={startVoting} className="bg-primary text-on-primary hover:brightness-110 active:scale-[0.98] transition-all px-8 py-4 rounded-lg font-label font-semibold flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto">
                    <span className="material-symbols-outlined">how_to_vote</span>
                    Cast Your Vote
                </button>
            )}
            {hasVoted && (
                <button disabled className="bg-surface-container text-on-surface-variant px-8 py-4 rounded-lg font-label font-semibold flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto opacity-70">
                    <span className="material-symbols-outlined">check_circle</span>
                    Voted
                </button>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col gap-4 hover:shadow-md transition-shadow group">
            <div className="h-12 w-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-lg text-on-surface mb-1">Verification Status</h3>
              <p className="text-on-surface-variant font-body text-sm mb-4">Confirm your eligibility to participate in the current election cycle.</p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-outline-variant/50 pt-4">
               {isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/20 text-secondary text-xs font-semibold">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Verified
                    </span>
               ) : status === 'rejected' ? (
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/20 text-error text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">cancel</span>
                             Rejected
                        </span>
                        <button onClick={() => navigate('/upload-id')} className="text-xs bg-error text-on-error px-3 py-1.5 rounded font-semibold transition-all hover:brightness-110">Retry Verification</button>
                    </div>
               ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-error-container/20 text-error text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">pending</span>
                             Pending
                        </span>
                        {status === 'pending_otp' && (
                            <button onClick={() => navigate('/otp')} className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded font-semibold transition-all hover:brightness-110">Verify Phone</button>
                        )}
                        {status === 'pending_id' && (
                            <button onClick={() => navigate('/upload-id')} className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded font-semibold transition-all hover:brightness-110">Upload ID</button>
                        )}
                        {status === 'pending_selfie' && (
                            <button onClick={() => navigate('/selfie')} className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded font-semibold transition-all hover:brightness-110">Capture Selfie</button>
                        )}
                        {status === 'pending_approval' && (
                            <button onClick={() => navigate('/verify-status')} className="text-xs bg-primary text-on-primary px-3 py-1.5 rounded font-semibold transition-all hover:brightness-110">
                              Check Status
                            </button>
                        )}
                    </div>
               )}
            </div>
          </div>

          <div onClick={() => navigate('/guidelines')} className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-outline-variant/30 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group active:scale-[0.98]">
            <div className="h-12 w-12 rounded-full bg-primary-container/10 text-primary flex items-center justify-center mb-2 group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300">
              <span className="material-symbols-outlined text-2xl">menu_book</span>
            </div>
            <div>
              <h3 className="font-headline font-semibold text-lg text-on-surface mb-1 group-hover:text-primary transition-colors duration-300">Election Guidelines</h3>
              <p className="text-on-surface-variant font-body text-sm mb-4">Review the rules, candidate manifestos, and voting procedures.</p>
            </div>
            <div className="mt-auto flex items-center justify-end border-t border-outline-variant/50 pt-4">
              <span className="material-symbols-outlined text-outline group-hover:text-primary group-hover:translate-x-1 transition-all duration-300">arrow_forward</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
