import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Guidelines() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col w-full pb-20 md:pb-0 min-h-screen bg-background text-on-background font-body">
      <header className="fixed top-0 z-40 bg-surface/80 backdrop-blur-sm px-4 md:px-8 py-4 flex items-center gap-4 w-full shadow-sm border-b border-outline-variant">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-surface-container rounded-full transition-colors material-symbols-outlined text-on-surface">
          arrow_back
        </button>
        <span className="font-headline font-semibold text-xl text-primary">Election Guidelines</span>
      </header>

      <main className="flex-1 px-4 pt-24 md:pt-28 md:px-8 max-w-4xl mx-auto w-full flex flex-col gap-8">
        <section className="bg-surface-container-lowest rounded-2xl p-6 md:p-10 shadow-sm border border-outline-variant/30">
          <h1 className="font-display font-bold text-3xl text-on-surface mb-6">Voting Rules & Procedures</h1>
          
          <div className="space-y-8 text-on-surface-variant leading-relaxed">
            <div>
              <h2 className="font-headline font-semibold text-xl text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">verified_user</span>
                Eligibility
              </h2>
              <p>Only fully registered and verified students for the current academic year are eligible to vote. You must complete the identity verification process (Phone OTP, ID scan, and Selfie capture) and be approved by an administrator before you can cast your vote.</p>
            </div>

            <div>
              <h2 className="font-headline font-semibold text-xl text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">how_to_vote</span>
                The Voting Process
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>You will go through each position one by one (e.g., President, Vice President) and select your preferred candidate.</li>
                <li>You can only select one candidate per position.</li>
                <li>Once you submit your final ballot, you cannot change your vote.</li>
                <li>Your vote is strictly confidential and anonymous. Your identity is separated from your ballot once submitted.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-headline font-semibold text-xl text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">gavel</span>
                Code of Conduct
              </h2>
              <p>All students are expected to maintain integrity during the election period. Any form of electoral fraud, identity theft, or coercing others to vote for specific candidates is strictly prohibited and will result in disciplinary action.</p>
            </div>

            <div>
              <h2 className="font-headline font-semibold text-xl text-on-surface mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">help</span>
                Support & Disputes
              </h2>
              <p>If you encounter any technical issues or notice suspicious activity, please contact the electoral commission immediately via the official university support channels.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
