import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function Settings() {
  const navigate = useNavigate();
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const isSuperAdmin = auth.currentUser?.uid === 'THPN2wjznufJIaoWsmAf8dlvrCH3';
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('verifier');
  const [resetting, setResetting] = useState(false);

  const handleResetElection = async () => {
    if (!window.confirm("WARNING: This will permanently delete ALL votes and reset the election. Are you absolutely sure?")) return;
    const confirmText = window.prompt("FINAL WARNING: This action cannot be undone. Type 'RESET' to confirm.");
    if (confirmText !== 'RESET') return;
    
    setResetting(true);
    try {
      const snap = await getDocs(collection(db, 'votes'));
      const batchPromises: Promise<any>[] = [];
      
      for(const item of snap.docs) {
          batchPromises.push( (await import('firebase/firestore')).deleteDoc(item.ref) );
      }

      const receiptSnap = await getDocs(collection(db, 'receipts'));
      for(const item of receiptSnap.docs) {
          batchPromises.push( (await import('firebase/firestore')).deleteDoc(item.ref) );
      }

      const studentsSnap = await getDocs(collection(db, 'students'));
      for(const student of studentsSnap.docs) {
          if (student.data().hasVoted) {
             batchPromises.push((await import('firebase/firestore')).updateDoc(student.ref, {
               hasVoted: false,
               currentVotingPosition: 'President' 
             }));
          }
      }

      await Promise.all(batchPromises);

      toast.success("Election reset successfully. All votes have been cleared.");
    } catch (e: any) {
      toast.error("Failed to reset election: " + e.message);
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'electionSchedule');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStartTime(docSnap.data().startTime || '');
          setEndTime(docSnap.data().endTime || '');
        }

        if (isSuperAdmin) {
           const snap = await getDocs(collection(db, 'adminUsers'));
           setAdminUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err: any) {
        handleFirestoreError(err, OperationType.GET, 'settings/electionSchedule');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [isSuperAdmin]);

  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
        toast.error('End time must be after start time.');
        setSaving(false);
        return;
      }
      
      const docRef = doc(db, 'settings', 'electionSchedule');
      await setDoc(docRef, {
        startTime,
        endTime
      }, { merge: true });
      toast.success('Election schedule saved successfully');
    } catch (err: any) {
       handleFirestoreError(err, OperationType.WRITE, 'settings/electionSchedule');
       toast.error('Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  const handleNotifyStart = async () => {
     if (!window.confirm("Are you sure you want to send an SMS to ALL students with phone numbers?")) return;
     setNotifying(true);
     try {
       // Fetch all students with phone numbers
       const snap = await getDocs(collection(db, 'students'));
       const phoneNumbers: string[] = [];
       snap.forEach(doc => {
         const data = doc.data();
         if (data.phone || data.phoneNumber) {
           phoneNumbers.push(data.phone || data.phoneNumber);
         }
       });

       if (phoneNumbers.length === 0) {
         toast.error("No students found with saved phone numbers.");
         setNotifying(false);
         return;
       }

       const res = await fetch('/api/sms/notify-election-start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumbers,
            startTime,
            endTime
          })
       });

       if (!res.ok) {
           const err = await res.json();
           throw new Error(err.error || "Failed to notify students");
       }
       toast.success(`Successfully sent notifications to ${phoneNumbers.length} students.`);
     } catch (err: any) {
         toast.error(err.message);
         console.error(err);
     } finally {
         setNotifying(false);
     }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
     try {
         await setDoc(doc(db, 'adminUsers', userId), { role: newRole }, { merge: true });
         toast.success('Role updated successfully');
         setAdminUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
     } catch(e: any) {
         handleFirestoreError(e, OperationType.UPDATE, `adminUsers/${userId}`);
         toast.error("Failed to update role");
     }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newAdminUid || !newAdminEmail || !newAdminRole) return;
     try {
         await setDoc(doc(db, 'adminUsers', newAdminUid), {
            email: newAdminEmail,
            role: newAdminRole,
            createdAt: serverTimestamp()
         });
         toast.success('Admin user added successfully');
         const snap = await getDocs(collection(db, 'adminUsers'));
         setAdminUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
         setNewAdminUid('');
         setNewAdminEmail('');
         setNewAdminRole('verifier');
     } catch (e: any) {
         handleFirestoreError(e, OperationType.CREATE, `adminUsers/${newAdminUid}`);
         toast.error('Failed to add admin user');
     }
  };

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

        <div className="grid gap-8 max-w-3xl">
            {/* Election Schedule Setting */}
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6 md:p-10">
              <h3 className="font-headline font-semibold text-lg text-on-surface mb-6">Election Schedule</h3>
              {loading ? (
                 <div className="flex justify-center p-4"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
              ) : (
                 <div className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Voting Start Time</label>
                        <input
                          type="datetime-local"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-on-surface mb-2">Voting End Time</label>
                        <input
                          type="datetime-local"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-4 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                      </div>
                   </div>
                   
                   <div className="flex justify-end pt-4 gap-4">
                     <button
                        onClick={handleNotifyStart}
                        disabled={notifying || !startTime || !endTime}
                        className="px-6 py-2 bg-secondary text-on-secondary rounded-lg font-medium hover:brightness-110 active:scale-95 transition-all text-sm disabled:opacity-70 flex items-center"
                     >
                       {notifying ? (
                         <><div className="w-4 h-4 border-2 border-on-secondary border-t-transparent rounded-full animate-spin mr-2"></div> Notifying...</>
                       ) : 'Notify Students (SMS)'}
                     </button>
                     <button
                        onClick={handleSaveSchedule}
                        disabled={saving}
                        className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:brightness-110 active:scale-95 transition-all text-sm disabled:opacity-70 flex items-center"
                     >
                       {saving ? (
                         <><div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin mr-2"></div> Saving...</>
                       ) : 'Save Schedule'}
                     </button>
                   </div>
                 </div>
              )}
            </div>

             <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6 md:p-10">
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
                    <button 
                       onClick={handleResetElection}
                       disabled={resetting}
                       className="px-4 py-2 bg-error-container text-error rounded-lg font-medium hover:brightness-105 transition-all text-sm disabled:opacity-50 flex items-center">
                        {resetting ? 'Resetting...' : 'Reset Election'}
                    </button>
                 </div>
              </div>
            </div>

            {isSuperAdmin && (
               <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 p-6 md:p-10 mt-8">
                  <h3 className="font-headline font-semibold text-lg text-on-surface mb-2">Admin User Management</h3>
                  <p className="text-sm text-on-surface-variant mb-6">Manage roles for system administrators. (Super Admin view only)</p>

                  <div className="space-y-4 mb-8">
                     {adminUsers.map(user => (
                        <div key={user.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-outline-variant/30 rounded-lg bg-surface">
                           <div>
                              <div className="font-semibold text-on-surface">{user.email}</div>
                              <div className="text-xs text-on-surface-variant mt-1">UID: {user.id}</div>
                           </div>
                           <div className="mt-3 sm:mt-0 flex items-center gap-3">
                              <select 
                                 value={user.role || 'admin'} 
                                 onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                 className="bg-surface-container-low border border-outline-variant rounded-md px-3 py-1.5 text-sm"
                                 disabled={user.id === 'THPN2wjznufJIaoWsmAf8dlvrCH3'}
                              >
                                 <option value="admin">Admin</option>
                                 <option value="verifier">Verifier</option>
                                 <option value="editor">Editor</option>
                              </select>
                              {user.id === 'THPN2wjznufJIaoWsmAf8dlvrCH3' && (
                                 <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">Super</span>
                              )}
                           </div>
                        </div>
                     ))}
                  </div>

                  <div className="border-t border-surface-variant pt-6">
                     <h4 className="font-semibold text-on-surface mb-4">Add Administrative Access</h4>
                     <form onSubmit={handleAddAdmin} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-xs font-medium text-on-surface mb-1">User UID</label>
                           <input type="text" value={newAdminUid} onChange={e => setNewAdminUid(e.target.value)} required placeholder="e.g. THPN..." className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-md text-sm text-on-surface outline-none focus:border-primary" />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-on-surface mb-1">Email</label>
                           <input type="email" value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} required placeholder="admin@zcas.edu.zm" className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-md text-sm text-on-surface outline-none focus:border-primary" />
                        </div>
                        <div>
                           <label className="block text-xs font-medium text-on-surface mb-1">Role</label>
                           <select value={newAdminRole} onChange={e => setNewAdminRole(e.target.value)} className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-md text-sm text-on-surface outline-none focus:border-primary">
                               <option value="admin">Admin</option>
                               <option value="verifier">Verifier</option>
                               <option value="editor">Editor</option>
                           </select>
                        </div>
                        <div className="flex items-end">
                           <button type="submit" className="w-full px-4 py-2 bg-primary text-on-primary rounded-md font-medium hover:brightness-110 active:scale-95 transition-all text-sm">
                              Add Admin Role
                           </button>
                        </div>
                     </form>
                  </div>
               </div>
            )}
        </div>
      </main>
    </AdminLayout>
  );
}
