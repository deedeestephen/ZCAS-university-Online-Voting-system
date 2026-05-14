import React, { useEffect, useState, useMemo } from 'react';
import AdminLayout from './AdminLayout';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function ManageStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [studentIdStr, setStudentIdStr] = useState('');
  const [programme, setProgramme] = useState('');
  const [statusVal, setStatusVal] = useState('pending');
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'students'), (snap) => {
        setStudents(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'students');
    });
    return unsub;
  }, []);

  const handleDelete = async (id: string) => {
      try {
          await deleteDoc(doc(db, 'students', id));
          toast.success('Student deleted successfully');
      } catch (err: any) {
          toast.error(err.message);
          handleFirestoreError(err, OperationType.DELETE, `students/${id}`);
      } finally {
          setDeletingId(null);
      }
  };

  const handleEditClick = (student: any) => {
    setEditingId(student.id);
    setName(student.name || '');
    setEmail(student.email || '');
    setStudentIdStr(student.studentId || '');
    setProgramme(student.program || student.programme || '');
    setStatusVal(student.isVerified ? 'verified' : (student.status || 'pending'));
    setIsAddModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setEmail('');
    setStudentIdStr('');
    setProgramme('');
    setStatusVal('pending');
    setIsAddModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
        const studentData = {
            name,
            email,
            studentId: studentIdStr,
            program: programme,
            status: statusVal === 'verified' ? 'approved' : statusVal,
            isVerified: statusVal === 'verified',
            updatedAt: new Date(),
        };

        if (editingId) {
            await updateDoc(doc(db, 'students', editingId), studentData);
            toast.success('Student updated');
        } else {
            // Adding a manual student record without auth user ID. Use a generated doc ID.
            const newDocRef = doc(collection(db, 'students'));
            await setDoc(newDocRef, {
                ...studentData,
                createdAt: new Date(),
                isManuallyAdded: true
            });
            toast.success('Student added manually');
        }
        resetForm();
    } catch (err: any) {
        toast.error(err.message);
        handleFirestoreError(err, OperationType.WRITE, 'students');
    } finally {
        setLoading(false);
    }
  };

  const filteredStudents = useMemo(() => {
      return students.filter(s => {
          const sName = (s.name || '').toLowerCase();
          const sId = (s.studentId || '').toLowerCase();
          const sEmail = (s.email || '').toLowerCase();
          const q = search.toLowerCase();
          return sName.includes(q) || sId.includes(q) || sEmail.includes(q);
      });
  }, [students, search]);

  const verifiedCount = students.filter(s => s.isVerified).length;
  const pendingCount = students.filter(s => !s.isVerified && s.status !== 'rejected').length;

  return (
    <AdminLayout>
      <main className="flex-1 flex flex-col p-6 lg:p-8 w-full overflow-y-auto bg-surface min-h-[calc(100vh-64px)] md:min-h-screen mb-20 md:mb-0">
        
        {/* Header content managed by layout generally, but we can add title if needed */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 hidden md:flex">
             <div className="text-xl md:text-2xl font-headline font-bold text-blue-900 dark:text-slate-100">Manage Students</div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div className="relative w-full sm:w-96">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                <input 
                   value={search}
                   onChange={e => setSearch(e.target.value)}
                   type="text" 
                   placeholder="Search by ID, Name or Email..." 
                   className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg font-body text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)]" 
                />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <button onClick={() => toast.error('Upload CSV not yet implemented')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 border border-outline-variant bg-surface-container-lowest text-primary rounded-lg px-4 py-2 font-label font-medium text-sm hover:bg-surface-container-low transition-all active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[20px]">upload_file</span>
                    Upload CSV
                </button>
                <button onClick={() => {resetForm(); setIsAddModalOpen(true);}} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary text-on-primary rounded-lg px-4 py-2 font-label font-medium text-sm hover:brightness-110 shadow-sm transition-all active:scale-[0.98]">
                    <span className="material-symbols-outlined text-[20px]">person_add</span>
                    Add Student
                </button>
            </div>
        </div>

        {/* Bento Grid Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-variant flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-on-primary-fixed">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>groups</span>
                </div>
                <div>
                    <div className="text-sm font-label text-on-surface-variant mb-1">Total Eligible Students</div>
                    <div className="text-2xl font-headline font-bold text-on-surface">{students.length}</div>
                </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-variant flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                    <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>verified</span>
                </div>
                <div>
                    <div className="text-sm font-label text-on-surface-variant mb-1">Verified Voters</div>
                    <div className="text-2xl font-headline font-bold text-on-surface">{verifiedCount}</div>
                </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-variant flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed flex items-center justify-center text-on-tertiary-fixed">
                     <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>pending_actions</span>
                </div>
                <div>
                    <div className="text-sm font-label text-on-surface-variant mb-1">Pending Verification</div>
                    <div className="text-2xl font-headline font-bold text-on-surface">{pendingCount}</div>
                </div>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-surface-variant overflow-hidden">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-surface-container-low border-b border-surface-variant">
                            <th className="py-4 px-6 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Student ID</th>
                            <th className="py-4 px-6 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Name</th>
                            <th className="py-4 px-6 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Programme</th>
                            <th className="py-4 px-6 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Status</th>
                            <th className="py-4 px-6 font-label text-xs font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="font-body text-sm divide-y divide-surface-variant">
                       {filteredStudents.map(student => (
                           <tr key={student.id} className="hover:bg-surface-container-lowest/50 transition-colors group">
                               <td className="py-4 px-6 text-on-surface font-medium whitespace-nowrap">{student.studentId}</td>
                               <td className="py-4 px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 shrink-0 rounded-full bg-primary-fixed-dim text-on-primary-fixed flex items-center justify-center font-bold text-xs uppercase">
                                            {student.name ? student.name.substring(0,2) : '?'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-on-surface font-medium">{student.name}</span>
                                            <span className="text-xs text-on-surface-variant">{student.email}</span>
                                        </div>
                                    </div>
                               </td>
                               <td className="py-4 px-6 text-on-surface-variant">
                                   {student.program || student.programme || 'N/A'}
                               </td>
                               <td className="py-4 px-6">
                                  {student.isVerified ? (
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-secondary-container text-on-secondary-container">
                                        <span className="w-1.5 h-1.5 rounded-full bg-on-secondary-container"></span>
                                        Verified
                                      </span>
                                  ) : student.status === 'rejected' ? (
                                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-error-container text-on-error-container">
                                        <span className="w-1.5 h-1.5 rounded-full bg-on-error-container"></span>
                                        Rejected
                                    </span>
                                  ) : (
                                     <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-tertiary-fixed text-on-tertiary-fixed-variant">
                                        <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-fixed-variant"></span>
                                        Pending
                                    </span>
                                  )}
                               </td>
                               <td className="py-4 px-6 text-right">
                                   {deletingId === student.id ? (
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleDelete(student.id)} className="px-3 py-1 bg-error text-white rounded text-xs font-medium hover:brightness-110">Confirm</button>
                                            <button onClick={() => setDeletingId(null)} className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded text-xs font-medium hover:brightness-95">Cancel</button>
                                        </div>
                                   ) : (
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEditClick(student)} className="p-1.5 text-outline hover:text-primary hover:bg-primary-fixed rounded-md transition-colors" title="Edit">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </button>
                                            <button onClick={() => setDeletingId(student.id)} className="p-1.5 text-outline hover:text-error hover:bg-error-container rounded-md transition-colors" title="Delete">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                   )}
                               </td>
                           </tr>
                       ))}
                       {filteredStudents.length === 0 && (
                            <tr>
                                <td colSpan={5} className="py-8 text-center text-on-surface-variant">No students found matching your search.</td>
                            </tr>
                       )}
                    </tbody>
                </table>
             </div>
             {/* Simple Pagination Footer Placeholder */}
             <div className="bg-surface-container-lowest border-t border-surface-variant px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-on-surface-variant font-body">
                    Showing <span className="font-medium text-on-surface">{filteredStudents.length > 0 ? 1 : 0}</span> to <span className="font-medium text-on-surface">{filteredStudents.length}</span> of <span className="font-medium text-on-surface">{students.length}</span> results
                </div>
                <div className="flex items-center gap-2">
                    <button disabled className="p-1 border border-outline-variant rounded-md text-outline hover:bg-surface-container-low transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined">chevron_left</span>
                    </button>
                    <button disabled className="p-1 border border-outline-variant rounded-md text-on-surface hover:bg-surface-container-low transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined">chevron_right</span>
                    </button>
                </div>
             </div>
        </div>

      </main>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
             <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
                 <div className="px-6 py-4 border-b border-surface-variant flex justify-between items-center bg-surface">
                     <h2 className="font-headline font-bold text-lg text-on-surface">{editingId ? 'Edit Student' : 'Manually Add Student'}</h2>
                     <button onClick={resetForm} className="text-outline hover:text-on-surface transition-colors p-1 rounded-full hover:bg-surface-variant">
                         <span className="material-symbols-outlined">close</span>
                     </button>
                 </div>
                 <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[80vh]">
                     <div>
                         <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Full Name</label>
                         <input required value={name} onChange={e=>setName(e.target.value)} type="text" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                     </div>
                     <div>
                         <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Student ID</label>
                         <input required value={studentIdStr} onChange={e=>setStudentIdStr(e.target.value)} type="text" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all uppercase" />
                     </div>
                     <div>
                         <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Email</label>
                         <input required value={email} onChange={e=>setEmail(e.target.value)} type="email" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                     </div>
                     <div>
                         <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Programme</label>
                         <input required value={programme} onChange={e=>setProgramme(e.target.value)} type="text" className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" />
                     </div>
                     <div>
                         <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1 block">Verification Status</label>
                         <select value={statusVal} onChange={e=>setStatusVal(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all">
                             <option value="pending">Pending</option>
                             <option value="verified">Verified (Approved)</option>
                             <option value="rejected">Rejected</option>
                         </select>
                     </div>
                     <div className="mt-4 pt-4 border-t border-surface-variant flex justify-end gap-3">
                         <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg font-medium text-sm text-on-surface hover:bg-surface-variant transition-colors border border-outline-variant">Cancel</button>
                         <button disabled={loading} type="submit" className="px-4 py-2 rounded-lg font-medium text-sm bg-primary text-on-primary shadow hover:brightness-110 active:scale-95 transition-all disabled:opacity-50">
                             {loading ? 'Saving...' : (editingId ? 'Save Changes' : 'Add Student')}
                         </button>
                     </div>
                 </form>
             </div>
          </div>
      )}

    </AdminLayout>
  );
}

