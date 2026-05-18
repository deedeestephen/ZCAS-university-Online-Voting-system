import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadBytesResumable, uploadString } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage } from '../../lib/firebase';
import toast from 'react-hot-toast';
import logoUrl from '../../assets/images/regenerated_image_1778103979877.png';
import { useRef } from 'react';

export default function UploadId() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    return () => stopCamera();
  }, []);

  const startCamera = async (mode = facingMode) => {
    setCameraActive(true);
    setFile(null);
    setPhotoData(null);
    try {
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      toast.error('Unable to access camera');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
       const stream = videoRef.current.srcObject as MediaStream;
       stream.getTracks().forEach(track => track.stop());
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
     const newMode = facingMode === 'user' ? 'environment' : 'user';
     setFacingMode(newMode);
     startCamera(newMode);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setPhotoData(dataUrl);
        stopCamera();
      }
    }
  };

  const handleUpload = async () => {
    if (!file && !photoData) {
      toast.error('Please select an ID document or capture a photo');
      return;
    }
    if (!auth.currentUser) {
      toast.error('You must be logged in to upload');
      return;
    }

    setLoading(true);
    try {
      let finalDataUrl = photoData;

      if (file && !finalDataUrl) {
        finalDataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
               const canvas = document.createElement('canvas');
               const MAX_WIDTH = 800;
               let scale = 1;
               if (img.width > MAX_WIDTH) {
                  scale = MAX_WIDTH / img.width;
               }
               canvas.width = img.width * scale;
               canvas.height = img.height * scale;
               const ctx = canvas.getContext('2d');
               if (ctx) {
                  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                  resolve(canvas.toDataURL('image/jpeg', 0.6));
               } else {
                  resolve(e.target?.result as string);
               }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
          };
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      }

      if (!finalDataUrl) throw new Error('Could not process image');

      await updateDoc(doc(db, 'students', auth.currentUser.uid), {
        idUrl: finalDataUrl,
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

        {cameraActive && (
          <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-sm border border-outline-variant">
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
             <button onClick={toggleCamera} className="absolute top-4 right-4 p-2 bg-surface-container-lowest/80 backdrop-blur-md rounded-full shadow-md text-on-surface hover:bg-surface-container-lowest transition-colors flex items-center justify-center">
               <span className="material-symbols-outlined">cameraswitch</span>
             </button>
             <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 px-4">
                 <button onClick={stopCamera} className="px-5 py-2.5 bg-surface/80 backdrop-blur text-on-surface rounded-full font-medium hover:bg-surface transition-colors flex items-center gap-2 text-sm shadow-sm">
                   <span className="material-symbols-outlined text-[18px]">close</span> Cancel
                 </button>
                 <button onClick={capturePhoto} className="px-5 py-2.5 bg-primary text-on-primary rounded-full font-bold hover:brightness-110 active:scale-95 transition-all shadow-sm flex items-center gap-2 text-sm">
                   <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>camera</span> Capture
                 </button>
             </div>
             <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
          </div>
        )}

        {photoData && !cameraActive && (
           <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
               <div className="relative w-full max-w-[240px] aspect-video mb-4 rounded-lg overflow-hidden border border-outline-variant shadow-sm">
                  <img src={photoData} alt="Captured ID" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-secondary text-on-secondary rounded-full p-1 shadow-sm flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
               </div>
               <span className="text-sm font-medium text-on-surface">Captured Photo</span>
               <div className="flex gap-3 mt-4 w-full justify-center">
                  <button onClick={() => setPhotoData(null)} className="px-4 py-2 border border-outline-variant rounded-lg font-medium text-sm text-on-surface hover:bg-surface-variant transition-colors flex items-center gap-2">
                     <span className="material-symbols-outlined text-[18px]">delete</span> Clear
                  </button>
                  <button onClick={() => startCamera()} className="px-4 py-2 bg-surface-container-high rounded-lg font-medium text-sm text-on-surface hover:bg-surface-container-highest transition-colors flex items-center gap-2">
                     <span className="material-symbols-outlined text-[18px]">refresh</span> Retake
                  </button>
               </div>
           </div>
        )}

        {!cameraActive && !photoData && (
          <>
            <label className="bg-surface-container-lowest border-2 border-dashed border-outline-variant rounded-xl p-8 flex flex-col items-center justify-center gap-4 text-center hover:border-primary transition-colors cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.05)] relative overflow-hidden">
              <input type="file" accept="image/jpeg, image/png" onChange={e => { setFile(e.target.files?.[0] || null); setPhotoData(null); }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
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
            {!file && (
              <div className="flex flex-col items-center">
                <div className="text-on-surface-variant text-sm font-medium mb-3 relative flex items-center w-full justify-center">
                  <div className="h-px bg-outline-variant flex-1 mr-4"></div>
                  <span className="text-outline">OR</span>
                  <div className="h-px bg-outline-variant flex-1 ml-4"></div>
                </div>
                <button onClick={() => startCamera()} className="flex items-center gap-2 px-6 py-2.5 bg-surface-container border border-outline-variant rounded-xl hover:bg-surface-container-high transition-colors font-medium text-on-surface shadow-sm active:scale-95 w-full justify-center">
                   <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                   Take a Live Photo
                </button>
              </div>
            )}
          </>
        )}

        <div className="mt-4 flex flex-col gap-3">
          <button disabled={loading} onClick={handleUpload} className="w-full bg-primary text-on-primary font-label font-bold text-base py-3.5 rounded-lg active:scale-[0.98] hover:brightness-110 transition-all shadow-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-xl">cloud_upload</span>
            {loading ? (<><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Uploading...</>) : 'Upload ID Document'}
          </button>
        </div>
      </div>
    </main>
  );
}
