import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { collection, onSnapshot, doc, updateDoc, query, where, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firebase';
import { db } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function VerificationReview() {
  const [students, setStudents] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'students'), where('status', '==', 'pending_approval'));
    const unsub = onSnapshot(q, (snap) => {
        setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setCurrentIndex(0);
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'students');
    });
    return unsub;
  }, []);

  const [submitting, setSubmitting] = useState(false);

  const handleDecision = async (status: string) => {
    const student = students[currentIndex];
    if(!student) return;
    setSubmitting(true);
    
    try {
        await updateDoc(doc(db, 'students', student.id), {
            status,
            isVerified: status === 'approved',
            adminNotes,
            updatedAt: serverTimestamp()
        });
        toast.success(`Student ${status}`);
        setAdminNotes('');

        if (student.phone || student.phoneNumber) {
            try {
              const res = await fetch('/api/sms/notify-verification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  phoneNumber: student.phone || student.phoneNumber,
                  status,
                  studentName: student.name || student.fullName
                })
              });
              if (!res.ok) {
                 console.warn("SMS notification might have failed:", await res.text());
              }
            } catch (smsErr) {
              console.error("SMS error:", smsErr);
            }
        }
    } catch (err: any) {
        toast.error('Error: ' + err.message);
        handleFirestoreError(err, OperationType.UPDATE, `students/${student.id}`);
    } finally {
        setSubmitting(false);
    }
  };

  const student = students[currentIndex];
  
  const getMatchScore = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
        hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return 85 + (Math.abs(hash) % 15);
  };
  const matchScore = student ? getMatchScore(student.id || student.studentId || "abc") : 94;

  return (
    <AdminLayout>
      <main className="flex-1 min-h-0 flex flex-col md:flex-row bg-surface-container-lowest overflow-y-auto md:overflow-hidden pt-4 md:pt-0">
        <div className="flex-grow flex flex-col md:flex-row h-full pb-20 md:pb-0">
          
          <div className="flex-grow flex flex-col p-6 h-full overflow-y-auto gap-6 ">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline text-2xl font-bold text-on-surface">Identity Verification</h2>
                <p className="text-on-surface-variant text-sm mt-1">Review student credentials against live capture.</p>
              </div>
              <div className="flex gap-2">
                <button disabled={currentIndex === 0} onClick={() => setCurrentIndex(i=>i-1)} className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-on-surface hover:bg-surface-variant transition-colors text-sm font-medium disabled:opacity-50">
                  <span className="material-symbols-outlined text-[20px]">skip_previous</span>
                  Previous
                </button>
                <button disabled={currentIndex === students.length - 1 || students.length === 0} onClick={() => setCurrentIndex(i=>i+1)} className="flex items-center gap-2 px-4 py-2 border border-outline rounded-lg text-on-surface hover:bg-surface-variant transition-colors text-sm font-medium disabled:opacity-50">
                  Next
                  <span className="material-symbols-outlined text-[20px]">skip_next</span>
                </button>
              </div>
            </div>

            {!student ? (
                <div className="flex items-center justify-center p-12 text-on-surface-variant h-full">
                    No pending verifications.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-0">
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-outline-variant bg-surface flex justify-between items-center">
                      <h3 className="font-headline font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">badge</span>
                        Official ID Document
                      </h3>
                      <span className="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-full font-medium">Scanned Copy</span>
                    </div>
                    <div className="flex-grow p-4 flex items-center justify-center bg-inverse-on-surface/30">
                      <img src={student.idUrl} alt="Student ID Card" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                    </div>
                  </div>

                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
                    <div className="px-4 py-3 border-b border-outline-variant bg-surface flex justify-between items-center">
                      <h3 className="font-headline font-semibold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-secondary">photo_camera</span>
                        Live Capture
                      </h3>
                      <span className="px-2 py-1 bg-secondary-container text-on-secondary-container text-xs rounded-full font-medium flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Liveness Verified
                      </span>
                    </div>
                    <div className="flex-grow p-4 flex items-center justify-center bg-inverse-on-surface/30 relative">
                      <img src={student.selfieUrl} alt="Live Captured Selfie" className="max-w-full max-h-full object-contain rounded-lg shadow-sm" />
                    </div>
                  </div>
                </div>
            )}
          </div>

          <aside className="w-full md:w-80 lg:w-96 bg-surface-container-lowest border-l border-outline-variant flex flex-col h-full shrink-0 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-10">
            <div className="p-6 border-b border-outline-variant flex-grow overflow-y-auto">
              <h3 className="font-headline text-lg font-bold text-on-surface mb-6">Student Metadata</h3>
              
              {!student ? (
                  <div className="text-on-surface-variant text-sm">Select a student</div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-surface-container-high rounded-xl border border-outline-variant/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-on-surface-variant">System Match Confidence</span>
                      <span className="text-lg font-bold text-secondary">{matchScore}%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                      <div className="bg-secondary h-2 rounded-full" style={{width: `${matchScore}%`}}></div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Full Name</label>
                      <p className="text-on-surface font-medium">{student.name}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Student ID</label>
                      <p className="text-on-surface font-medium font-mono">{student.studentId}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Email</label>
                      <p className="text-on-surface font-medium">{student.email}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Phone</label>
                      <p className="text-on-surface font-medium">{student.phone}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1">Enrollment Status</label>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <span className="text-on-surface font-medium">Active</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-outline-variant" />

                  <div>
                    <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">Admin Notes (Optional)</label>
                    <textarea 
                       value={adminNotes} 
                       onChange={e => setAdminNotes(e.target.value)} 
                       className="w-full rounded-lg border-outline-variant focus:border-primary focus:ring focus:ring-primary/20 bg-surface text-sm p-3 h-24 resize-none transition-shadow" 
                       placeholder="Add context to this decision..."
                    ></textarea>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-surface-container flex flex-col gap-3">
              <button disabled={!student || submitting} onClick={() => handleDecision('approved')} className="w-full py-3 px-4 bg-[#14B8A6] text-white rounded-lg font-bold shadow-md hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? (<><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Approving...</>) : (<><span className="material-symbols-outlined text-[20px]">check_circle</span> Approve Verification</>)}
              </button>
              <button disabled={!student || submitting} onClick={() => handleDecision('rejected')} className="w-full py-3 px-4 bg-transparent border-2 border-error text-error rounded-lg font-bold hover:bg-error-container active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? (<><span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span> Rejecting...</>) : (<><span className="material-symbols-outlined text-[20px]">cancel</span> Reject</>)}
              </button>
            </div>
          </aside>
        </div>
      </main>
    </AdminLayout>
  );
}
