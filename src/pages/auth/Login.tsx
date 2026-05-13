import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import toast from 'react-hot-toast';
import logoUrl from '../../assets/images/regenerated_image_1778103979877.png';

export default function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let loginEmail = studentId.trim();
      
      // If it doesn't look like an email, assume it's a student ID and construct the email
      if (!loginEmail.includes('@')) {
          // Admin can use 'admin' as shorthand
          if (loginEmail.toLowerCase() === 'admin') {
              loginEmail = 'admin@zcas.edu.zm';
          } else {
              loginEmail = loginEmail.toLowerCase() + '@zcas.edu.zm';
          }
      }

      await signInWithEmailAndPassword(auth, loginEmail, password);
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-[100dvh] bg-surface-container-lowest flex items-center justify-center p-4 py-8 md:py-12">
      <div className="w-full max-w-5xl bg-surface-container-lowest rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row border border-surface-variant">
        <aside className="hidden md:flex md:w-5/12 bg-primary p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
          <div className="relative z-10">
            <img alt="ZCAS Logo" className="h-16 w-auto mb-12" src={logoUrl} />
            <h1 className="text-on-primary font-display font-bold text-4xl leading-tight mb-4 tracking-tight">
              Secure.<br />
              Transparent.<br />
              Democratic.
            </h1>
            <p className="text-primary-fixed font-body text-lg max-w-xs leading-relaxed">
              The official portal for ZCAS Student Council elections. Your voice, protected by banking-grade security.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3 text-primary-fixed-dim text-sm font-medium">
            <span className="material-symbols-outlined text-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>shield_locked</span>
            <span>End-to-End Encrypted Voting</span>
          </div>
        </aside>

        <section className="w-full md:w-7/12 p-6 sm:p-10 lg:p-16 flex flex-col justify-center bg-surface-container-lowest">
          <div className="md:hidden flex flex-col items-center justify-center bg-primary -mx-6 -mt-6 sm:-mx-10 sm:-mt-10 mb-8 sm:mb-10 py-12 px-6 relative border-b border-primary-container/20">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <img alt="ZCAS Logo" className="h-16 w-auto mb-4 relative z-10 drop-shadow-md" src={logoUrl} />
            <h2 className="font-display font-bold text-2xl text-on-primary tracking-tight relative z-10">ZCAS Voting</h2>
          </div>

          <div className="mb-8">
            <h2 className="font-display font-bold text-3xl text-on-background tracking-tight mb-2">Student Login</h2>
            <p className="font-body text-on-surface-variant">Enter your credentials to access the secure voting booth.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block font-label font-semibold text-sm text-on-surface mb-2 tracking-wide" htmlFor="studentId">Student ID or Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">badge</span>
                </div>
                <input 
                  type="text" 
                  id="studentId" 
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body sm:text-sm" 
                  placeholder="ID or Admin Email" 
                  required 
                />
              </div>
            </div>

            <div>
              <label className="block font-label font-semibold text-sm text-on-surface mb-2 tracking-wide" htmlFor="password">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline">lock</span>
                </div>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:border-primary transition-colors font-body sm:text-sm" 
                  placeholder="••••••••" 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface-variant transition-colors"
                >
                  <span className="material-symbols-outlined">{showPassword ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-outline-variant rounded bg-surface transition-colors cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-sm font-body text-on-surface-variant cursor-pointer">
                  Remember me
                </label>
              </div>
            </div>

            <div className="pt-4">
              <button disabled={loading} type="submit" className="w-full flex justify-center items-center gap-2 bg-primary-container text-on-primary py-3.5 px-4 rounded-lg font-label font-bold text-[15px] shadow-sm hover:brightness-110 active:scale-[0.98] transition-all duration-200">
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'wght' 600" }}>login</span>
                {loading ? 'Logging in...' : 'Login to Vote'}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-body text-on-surface-variant">
              Not registered for this election? 
              <Link to="/register" className="font-label font-semibold text-primary hover:text-primary-container transition-colors hover:underline underline-offset-2 ml-1">
                Register
              </Link>
            </p>
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-xs text-outline font-body border-t border-surface-variant pt-6">
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Protected by Institutional Identity Verification</span>
          </div>
        </section>
      </div>
    </main>
  );
}
