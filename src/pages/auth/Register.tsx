import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { auth, db } from '../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import logoUrl from '../../assets/images/regenerated_image_1778103979877.png';

export default function Register() {
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const criteria = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
  };

  const isPasswordValid = Object.values(criteria).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast.error('Please ensure all password criteria are met.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create user with generated ZCAS email pattern based on student ID to allow student ID logins
      const generatedEmail = studentId.toLowerCase() + '@zcas.edu.zm';
      const userCredential = await createUserWithEmailAndPassword(auth, generatedEmail, password);
      const user = userCredential.user;
      
      await updateProfile(user, { displayName: fullName });

      // 2. Save to firestore
      await setDoc(doc(db, 'students', user.uid), {
        uid: user.uid,
        studentId: studentId.toUpperCase(),
        name: fullName,
        email: email, // Store their provided contact email
        phone,
        phoneVerified: false,
        isVerified: false,
        hasVoted: false,
        status: 'pending_otp',
        createdAt: serverTimestamp()
      });

      // Setup complete, user is logged in
      toast.success('Registration successful!');
      navigate('/dashboard');

    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const getCriteriaColor = (met: boolean) => met ? "text-green-600" : "text-error";
  const getCriteriaIcon = (met: boolean) => met ? "check_circle" : "cancel";

  return (
    <div className="bg-surface-container-low text-on-surface font-body antialiased min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 py-8 md:py-12">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-xl sm:rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-outline-variant/40 overflow-hidden flex flex-col relative z-10 my-4">
        
        <div className="pt-8 pb-4 px-6 sm:px-10 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center justify-center">
            <img alt="ZCAS University Logo" className="h-24 w-auto object-contain" src={logoUrl} />
          </div>
          <h1 className="font-headline text-2xl sm:text-3xl font-bold tracking-tight text-primary-container mb-2">Student Registration</h1>
          <p className="text-sm text-on-surface-variant font-medium">Secure your access to the ZCAS Voting Portal.</p>
        </div>

        <form onSubmit={handleRegister} className="px-6 sm:px-10 pb-8 flex flex-col gap-5 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-label font-semibold text-on-surface-variant ml-1" htmlFor="student_id">Student ID</label>
              <input value={studentId} onChange={e=>setStudentId(e.target.value)} required className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface placeholder-outline focus:border-primary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 outline-none font-medium shadow-sm" id="student_id" placeholder="e.g. 2100456" type="text" />
            </div>
            
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-label font-semibold text-on-surface-variant ml-1" htmlFor="full_name">Full Name</label>
              <input value={fullName} onChange={e=>setFullName(e.target.value)} required className="w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 text-sm text-on-surface placeholder-outline focus:border-primary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 outline-none font-medium shadow-sm" id="full_name" placeholder="As per student ID" type="text" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-label font-semibold text-on-surface-variant ml-1" htmlFor="email">University Email</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px]">mail</span>
              <input value={email} onChange={e=>setEmail(e.target.value)} required className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-3 text-sm text-on-surface placeholder-outline focus:border-primary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 outline-none font-medium shadow-sm" id="email" placeholder="student@zcas.edu.zm" type="email" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-label font-semibold text-on-surface-variant ml-1" htmlFor="phone">Phone Number</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px]">phone_iphone</span>
              <input value={phone} onChange={e=>setPhone(e.target.value)} required className="w-full bg-surface border border-outline-variant rounded-lg pl-10 pr-4 py-3 text-sm text-on-surface placeholder-outline focus:border-primary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 outline-none font-medium shadow-sm" id="phone" placeholder="+260 97 123 4567" type="tel" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-label font-semibold text-on-surface-variant ml-1" htmlFor="password">Create Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px]">lock</span>
              <input value={password} onChange={e=>setPassword(e.target.value)} required className={`w-full bg-surface border border-outline-variant rounded-lg pl-10 ${showPassword ? 'pr-4' : 'pr-12'} py-3 text-sm text-on-surface placeholder-outline focus:border-primary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 outline-none font-medium shadow-sm ${showPassword ? '' : 'tracking-widest'}`} id="password" placeholder={showPassword ? 'password' : '••••••••'} type={showPassword ? 'text' : 'password'} />
              <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-outline hover:text-on-surface-variant transition-colors flex items-center"
              >
                  <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            
            {password.length > 0 && (
              <div className="mt-2 bg-surface-container-high rounded-lg p-3 space-y-1 border border-outline-variant/30">
                <p className="text-xs font-semibold text-on-surface-variant mb-2">Password Requirements:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium">
                  <div className={`flex items-center gap-1.5 transition-colors duration-300 ${getCriteriaColor(criteria.length)}`}>
                    <span className="material-symbols-outlined text-[16px]">{getCriteriaIcon(criteria.length)}</span>
                    At least 8 characters
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors duration-300 ${getCriteriaColor(criteria.uppercase)}`}>
                    <span className="material-symbols-outlined text-[16px]">{getCriteriaIcon(criteria.uppercase)}</span>
                    Uppercase letter
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors duration-300 ${getCriteriaColor(criteria.number)}`}>
                    <span className="material-symbols-outlined text-[16px]">{getCriteriaIcon(criteria.number)}</span>
                    At least one number
                  </div>
                  <div className={`flex items-center gap-1.5 transition-colors duration-300 ${getCriteriaColor(criteria.special)}`}>
                    <span className="material-symbols-outlined text-[16px]">{getCriteriaIcon(criteria.special)}</span>
                    Special character
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-label font-semibold text-on-surface-variant ml-1" htmlFor="confirm_password">Confirm Password</label>
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3.5 text-outline text-[20px]">lock_reset</span>
              <input value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} required className={`w-full bg-surface border ${confirmPassword !== '' && password !== confirmPassword ? 'border-error ring-1 ring-error/20' : 'border-outline-variant'} rounded-lg pl-10 ${showConfirmPassword ? 'pr-4' : 'pr-12'} py-3 text-sm text-on-surface placeholder-outline focus:border-primary focus:ring-2 focus:ring-secondary/20 transition-all duration-200 outline-none font-medium shadow-sm ${showConfirmPassword ? '' : 'tracking-widest'}`} id="confirm_password" placeholder={showConfirmPassword ? 'confirm password' : '••••••••'} type={showConfirmPassword ? 'text' : 'password'} />
              <button 
                  type="button" 
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 text-outline hover:text-on-surface-variant transition-colors flex items-center"
              >
                  <span className="material-symbols-outlined text-[20px]">{showConfirmPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
            {confirmPassword !== '' && password !== confirmPassword && (
               <p className="text-xs text-error font-medium ml-1 mt-1 flex items-center gap-1">
                 <span className="material-symbols-outlined text-[14px]">error</span>
                 Passwords do not match
               </p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-4">
            <button disabled={loading || !isPasswordValid || (password !== confirmPassword)} type="submit" className="w-full bg-primary-container text-on-primary py-3.5 px-4 rounded-xl font-label font-bold text-base shadow-md hover:brightness-110 active:scale-[0.98] transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Registering...' : 'Register Account'}
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
            <p className="text-center text-sm font-medium text-on-surface-variant">
              Already registered? 
              <Link to="/" className="font-bold text-primary-container hover:underline hover:text-primary transition-colors ml-1">Login here</Link>
            </p>
          </div>
        </form>
      </div>
      
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-primary-fixed/30 blur-3xl opacity-50 mix-blend-multiply"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-secondary-container/20 blur-3xl opacity-50 mix-blend-multiply"></div>
      </div>
    </div>
  );
}

