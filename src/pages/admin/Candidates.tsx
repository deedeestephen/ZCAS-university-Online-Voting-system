import React, { useEffect, useState } from 'react';
import AdminLayout from './AdminLayout';
import { collection, onSnapshot, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../../lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function ManageCandidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [position, setPosition] = useState('President');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [faculty, setFaculty] = useState('');
  const [loading, setLoading] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'candidates'), (snap) => {
        setCandidates(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
        handleFirestoreError(error, OperationType.GET, 'candidates');
    });
    return unsub;
  }, []);

  const handleDelete = async (id: string) => {
      try {
          await deleteDoc(doc(db, 'candidates', id));
          toast.success('Candidate deleted');
      } catch (err: any) {
          toast.error(err.message);
          handleFirestoreError(err, OperationType.DELETE, `candidates/${id}`);
      } finally {
          setDeletingId(null);
      }
  };

  const handleEditClick = (candidate: any) => {
    setEditingId(candidate.id);
    setName(candidate.name || '');
    setPosition(candidate.position || 'President');
    setImageUrl(candidate.imageUrl || '');
    setFaculty(candidate.faculty || '');
    setImageFile(null);
    setShowAdd(true);
  };

  const resetForm = () => {
    setShowAdd(false);
    setEditingId(null);
    setName('');
    setImageUrl('');
    setImageFile(null);
    setFaculty('');
    setPosition('President');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let finalImageUrl = imageUrl || '';

    try {
        if (imageFile) {
            const reader = new FileReader();
            finalImageUrl = await new Promise<string>((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(imageFile);
            });
        }

        if (editingId) {
            await updateDoc(doc(db, 'candidates', editingId), {
                name: name || '',
                position: position || 'President',
                imageUrl: finalImageUrl || '',
                faculty: faculty || ''
            });
            toast.success('Candidate updated');
        } else {
            await addDoc(collection(db, 'candidates'), {
                name: name || '',
                position: position || 'President',
                imageUrl: finalImageUrl || '',
                faculty: faculty || '',
                status: 'approved'
            });
            toast.success('Candidate added');
        }
        resetForm();
    } catch (err: any) {
        toast.error('Error: ' + err.message);
        handleFirestoreError(err, OperationType.WRITE, 'candidates');
    } finally {
        setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="flex-1 min-h-0 p-4 md:p-8 lg:p-10 w-full overflow-y-auto bg-surface-container-low pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-on-surface tracking-tight mb-1">Manage Candidates</h1>
            <p className="text-sm text-on-surface-variant font-body">Review, edit, and configure candidate profiles.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => {
              if (showAdd) resetForm();
              else setShowAdd(true);
            }} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-container text-on-primary font-label font-medium rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-sm">
              <span className="material-symbols-outlined text-sm">{showAdd ? 'close' : 'add'}</span>
              {showAdd ? 'Cancel' : 'Add Candidate'}
            </button>
          </div>
        </div>

        {showAdd && (
            <div className="bg-surface-container-lowest rounded-xl shadow border border-outline-variant/30 p-6 mb-8">
                <h2 className="text-lg font-bold mb-4">{editingId ? 'Edit Candidate' : 'Add Candidate'}</h2>
                <form onSubmit={handleAddSubmit} className="flex flex-col gap-4 max-w-xl">
                    <input required value={name} onChange={e=>setName(e.target.value)} type="text" placeholder="Candidate Name" className="w-full px-4 py-2 border rounded-lg" />
                    <input required value={faculty} onChange={e=>setFaculty(e.target.value)} type="text" placeholder="Faculty/School (e.g. Business Admin, Yr 3)" className="w-full px-4 py-2 border rounded-lg" />
                    <select required value={position} onChange={e=>setPosition(e.target.value)} className="w-full px-4 py-2 border rounded-lg">
                        <option value="President">President</option>
                        <option value="Vice President">Vice President</option>
                        <option value="Prime Minister">Prime Minister</option>
                        <option value="Sport Minister">Sport Minister</option>
                        <option value="Academic Minister">Academic Minister</option>
                        <option value="Finance Minister">Finance Minister</option>
                        <option value="Foreign Affairs Minister">Foreign Affairs Minister</option>
                    </select>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-on-surface-variant">Candidate Image</label>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={e => {
                          if (e.target.files && e.target.files[0]) {
                            setImageFile(e.target.files[0]);
                          }
                        }} 
                        className="w-full px-4 py-2 border rounded-lg bg-white" 
                      />
                      {imageUrl && !imageFile && (
                        <div className="mt-4 flex flex-col gap-2">
                          <span className="text-sm text-slate-500">Current Image:</span>
                          <img src={imageUrl} alt="Current" className="w-24 h-24 object-cover rounded-lg border border-outline-variant shadow-sm" />
                        </div>
                      )}
                    </div>
                    <button disabled={loading} type="submit" className="bg-primary hover:brightness-110 text-on-primary py-2.5 rounded-lg shadow-sm font-medium transition-all">
                      {loading ? 'Saving...' : editingId ? 'Update Candidate' : 'Save Candidate'}
                    </button>
                </form>
            </div>
        )}

        <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-outline-variant/30 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-variant bg-surface-container-low/50">
                  <th className="px-6 py-4 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">Candidate Profile</th>
                  <th className="px-6 py-4 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider">Position</th>
                  <th className="px-6 py-4 text-xs font-label font-semibold text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant">
                {candidates.map(candidate => (
                  <tr key={candidate.id} className="hover:bg-surface-container-low/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={candidate.imageUrl || 'https://via.placeholder.com/150'} alt="Candidate" className="w-12 h-12 rounded-lg object-cover shadow-sm border border-outline-variant/20" />
                        <div>
                          <div className="font-headline font-semibold text-on-surface">{candidate.name}</div>
                          <div className="text-xs text-on-surface-variant font-body mt-0.5">{candidate.faculty}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-body text-sm text-on-surface font-medium">{candidate.position}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {deletingId === candidate.id ? (
                          <div className="flex items-center gap-2">
                             <button onClick={() => handleDelete(candidate.id)} className="px-3 py-1 bg-error text-white rounded text-xs font-medium hover:brightness-110">Confirm</button>
                             <button onClick={() => setDeletingId(null)} className="px-3 py-1 bg-surface-variant text-on-surface-variant rounded text-xs font-medium hover:brightness-95">Cancel</button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => handleEditClick(candidate)} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Edit">
                              <span className="material-symbols-outlined text-[20px]">edit</span>
                            </button>
                            <button onClick={() => setDeletingId(candidate.id)} className="p-2 text-error hover:bg-error/10 rounded-md transition-colors" title="Delete">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {candidates.length === 0 && (
                    <tr>
                        <td colSpan={3} className="px-6 py-4 text-center text-on-surface-variant">No candidates added yet.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </AdminLayout>
  );
}
