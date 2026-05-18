import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db, storage } from '../../lib/firebase';
import toast from 'react-hot-toast';

export default function SelfieCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const navigate = useNavigate();

  const startCamera = async (mode = facingMode) => {
    try {
      if (videoRef.current && videoRef.current.srcObject) {
         const stream = videoRef.current.srcObject as MediaStream;
         stream.getTracks().forEach(track => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStreamActive(true);
      }
    } catch (err: any) {
      toast.error('Unable to access camera');
    }
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
        const MAX_WIDTH = 600;
        let scale = 1;
        if (videoRef.current.videoWidth > MAX_WIDTH) {
           scale = MAX_WIDTH / videoRef.current.videoWidth;
        }
        canvasRef.current.width = videoRef.current.videoWidth * scale;
        canvasRef.current.height = videoRef.current.videoHeight * scale;
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.6);
        setPhotoData(dataUrl);
        // stop tracks
        const stream = videoRef.current.srcObject as MediaStream;
        stream?.getTracks().forEach(track => track.stop());
        setStreamActive(false);
      }
    }
  };

  const handleRetake = () => {
    setPhotoData(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!photoData || !auth.currentUser) return;
    setLoading(true);
    
    try {
      const studentDoc = await getDoc(doc(db, 'students', auth.currentUser.uid));
      
      let approvalStatus = 'pending_approval';

      await updateDoc(doc(db, 'students', auth.currentUser.uid), {
        selfieUrl: photoData,
        status: approvalStatus,
        updatedAt: serverTimestamp(),
      });

      toast.success('Biometric verification submitted!');
      navigate('/verify-status');
    } catch (err: any) {
      toast.error('Upload failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start camera automatically
  React.useEffect(() => {
    startCamera();
    return () => {
        if(videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, []);

  return (
    <main className="flex-grow flex flex-col items-center pt-16 pb-12 px-4 md:px-8 w-full max-w-2xl mx-auto bg-background text-on-surface font-body min-h-screen relative">
      <button onClick={() => navigate(-1)} className="absolute left-4 top-4 p-2 text-on-surface-variant hover:bg-surface-variant rounded-full z-50">
        <span className="material-symbols-outlined">arrow_back</span>
      </button>

      <nav aria-label="Progress" className="w-full mb-8">
        <ol role="list" className="flex items-center">
          <li className="relative pr-8 sm:pr-20">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="h-0.5 w-full bg-primary"></div>
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-4 ring-background transition-colors">
              <span className="material-symbols-outlined text-on-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
            </div>
          </li>
          <li className="relative pr-8 sm:pr-20">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="h-0.5 w-full bg-surface-variant"></div>
            </div>
            <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-surface-container-lowest ring-4 ring-background" aria-current="step">
              <span className="h-2.5 w-2.5 rounded-full bg-primary"></span>
            </div>
          </li>
          <li className="relative">
            <div className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-container-lowest ring-4 ring-background">
              <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-outline-variant"></span>
            </div>
          </li>
        </ol>
        <div className="flex justify-between w-full mt-2 text-xs font-label font-medium text-on-surface-variant">
          <span>ID Upload</span>
          <span className="text-primary font-semibold relative right-4 sm:right-10">Selfie</span>
          <span className="relative right-1">Review</span>
        </div>
      </nav>

      <div className="w-full bg-surface-container-lowest rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-surface-variant p-6 md:p-8 flex flex-col items-center">
        <div className="text-center mb-6">
          <h2 className="font-headline text-2xl font-bold text-on-surface mb-2">Biometric Verification</h2>
          <p className="text-on-surface-variant text-sm max-w-sm mx-auto">Please position your face within the frame. Ensure good lighting and remove any glasses or hats.</p>
        </div>

        <div className="relative w-full max-w-sm aspect-[3/4] bg-surface-container-highest rounded-2xl overflow-hidden mb-8 shadow-inner border border-outline-variant/30">
          {!photoData ? (
             <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
          ) : (
            <div className="relative w-full h-full">
              <img src={photoData} alt="Captured" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-secondary/10 flex items-center justify-center">
                 <div className="bg-secondary text-on-secondary rounded-full p-4 shadow-lg animate-bounce">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                 </div>
              </div>
            </div>
          )}

          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="50%" cy="50%" rx="35%" ry="45%" fill="none" stroke="currentColor" strokeWidth="3" className="text-secondary opacity-80" strokeDasharray="8 8"></ellipse>
          </svg>
          
          {!photoData && (
             <button onClick={toggleCamera} className="absolute top-4 right-4 p-3 bg-surface-container-lowest/80 backdrop-blur-md rounded-full shadow-md text-on-surface hover:bg-surface-container-lowest transition-colors flex items-center justify-center">
               <span className="material-symbols-outlined">cameraswitch</span>
             </button>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>

        <div className="w-full max-w-sm flex flex-col sm:flex-row gap-3">
          {photoData ? (
             <>
               <button onClick={handleRetake} className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-label font-semibold text-on-surface-variant bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-all active:scale-[0.98]">
                 <span className="material-symbols-outlined text-[20px]">refresh</span>
                 Retake
               </button>
               <button disabled={loading} onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-label font-bold text-on-primary bg-primary hover:bg-primary-container shadow-sm transition-all active:scale-[0.98]">
                 <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>cloud_upload</span>
                 {loading ? (<><span className="material-symbols-outlined animate-spin text-lg">progress_activity</span> Submitting...</>) : 'Submit'}
               </button>
             </>
          ) : (
             <button disabled={!streamActive} onClick={capturePhoto} className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-label font-bold text-on-primary bg-primary hover:bg-primary-container shadow-sm transition-all active:scale-[0.98]">
               <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>photo_camera</span>
               Capture
             </button>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-on-surface-variant text-xs font-medium bg-surface-container-low py-2 px-4 rounded-full border border-surface-variant shadow-sm">
        <span className="material-symbols-outlined text-[16px] text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
        Biometric data is encrypted end-to-end and not stored permanently.
      </div>
    </main>
  );
}
