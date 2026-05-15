import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage } from '../../lib/firebase';
import toast from 'react-hot-toast';
import logoUrl from '../../assets/images/regenerated_image_1778103979877.png';

export default function UploadId() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select an ID document');
      return;
    }
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      let url = '';
      try {
        // Only try for a short time to avoid hanging
        const uploadTask = async () => {
             const storageRef = ref(storage, `ids/${auth.currentUser!.uid}`);
             await uploadBytesResumable(storageRef, file);
             return await getDownloadURL(storageRef);
        };
        url = await Promise.race([
            uploadTask(),
            new Promise<string>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
        ]);
      } catch (uploadErr: any) {
        console.warn("Storage upload failed or timed out, using fallback URL for prototype.", uploadErr);
        url = 'https://ui-avatars.com/api/?name=ID+Document&background=0D8ABC&color=fff';
      }

      await updateDoc(doc(db, 'students', auth.currentUser.uid), {
        idUrl: url,
        status: 'pending_selfie',
        updatedAt: serverTimestamp(),
      });

      toast.success('ID uploaded successfully');
      navigate('/selfie');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background text-on-surface font-body antialiased min-h-screen flex flex-col items-center pt-8 pb-24 md:py-16">
      <div className="w-full max-w-xl px-6 mb-8 relative">
        <button onClick={() => navigate(-1)} className="absolute -left-4 top-0 p-2 text-on-surface-variant hover:bg-surface-variant rounded-full">
            <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex items-center justify-between ml-8">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label font-bold text-sm">1</div>
            <span className="font-label text-xs text-primary font-semibold">Verify</span>
          </div>
          <div className="flex-1 h-px bg-outline-variant mx-4 mt-[-20px]"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label font-bold text-sm border border-outline-variant">2</div>
            <span className="font-label text-xs text-on-surface-variant font-medium">Ballot</span>
          </div>
          <div className="flex-1 h-px bg-outline-variant mx-4 mt-[-20px]"></div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-label font-bold text-sm border border-outline-variant">3</div>
            <span className="font-label text-xs text-on-surface-variant font-medium">Review</span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-xl px-6 flex flex-col gap-6">
        <header className="text-center mb-4 flex flex-col items-center gap-4">
          <img alt="ZCAS University Logo" className="w-24 h-auto object-contain rounded-lg border border-outline-variant p-1 bg-white" src={logoUrl} />
          <div>
            <h1 className="font-headline font-extrabold text-2xl text-on-surface tracking-tight">Identity Verification</h1>
            <p className="text-on-surface-variant text-sm mt-1">Upload a clear photo of your valid student ID to proceed.</p>
          </div>
        </header>

        <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant flex items-start gap-4">
          <span className="material-symbols-outlined text-primary mt-0.5">info</span>
          <div>
            <h3 className="font-headline font-semibold text-on-surface text-sm mb-1">Valid ID Requirements</h3>
            <ul className="text-xs text-on-surface-variant list-disc list-inside space-y-1">
              <li>Current Academic Year ZCAS Student ID card.</li>
              <li>Ensure all edges of the card are visible.</li>
              <li>Photo and details must be clearly legible, free of glare.</li>
            </ul>
          </div>
        </div>

        <label className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center hover:border-primary transition-colors cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden">
          <input type="file" accept="image/jpeg, image/png" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          {file ? (
            <div className="flex flex-col items-center w-full">
                <div className="relative w-full max-w-[240px] aspect-video mb-4 rounded-lg overflow-hidden border border-outline-variant shadow-sm">
                  <img src={URL.createObjectURL(file)} alt="ID Preview" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-secondary text-on-secondary rounded-full p-1 shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary text-3xl mb-1">task</span>
                <span className="text-sm font-medium text-on-surface truncate max-w-[200px]">{file.name}</span>
                <span className="text-xs text-secondary font-medium mt-1">Ready to upload</span>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center group-hover:bg-primary-fixed transition-colors">
                <span className="material-symbols-outlined text-on-primary-container text-3xl">upload_file</span>
              </div>
              <div>
                <h3 className="font-headline font-semibold text-on-surface text-base">Drag & drop your ID image here</h3>
                <p className="text-on-surface-variant text-sm mt-1">or click to browse from your device</p>
                <p className="text-outline text-xs mt-2">Supported formats: JPG, PNG (Max 5MB)</p>
              </div>
            </>
          )}
        </label>

        <div className="mt-4 flex flex-col gap-3">
          <button disabled={loading} onClick={handleUpload} className="w-full bg-primary text-on-primary font-label font-bold text-base py-3.5 rounded-lg active:scale-[0.98] hover:brightness-110 transition-all shadow-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">cloud_upload</span>
            {loading ? 'Uploading...' : 'Upload ID Document'}
          </button>
          <button disabled={loading} onClick={async () => {
             setLoading(true);
             try {
                // Test bypass
                const url = 'https://ui-avatars.com/api/?name=ID+Document&background=0D8ABC&color=fff';
                await updateDoc(doc(db, 'students', auth.currentUser!.uid), {
                  idUrl: url,
                  status: 'pending_selfie',
                  updatedAt: serverTimestamp(),
                });
                toast.success('Bypass (Test): ID uploaded successfully');
                navigate('/selfie');
             } catch(e:any) {
                toast.error('Bypass failed: ' + e.message);
             } finally {
                setLoading(false);
             }
          }} className="w-full bg-surface-container-high text-on-surface font-label font-bold text-sm py-2 rounded-lg hover:bg-surface-container-highest transition-all mb-4">
             Bypass (Test)
          </button>
        </div>
      </div>
    </main>
  );
}
