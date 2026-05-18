import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          if (currentUser.email && (currentUser.email.toLowerCase() === 'admin@zcas.edu.zm' || currentUser.email.toLowerCase() === 'sikalundumwinga@gmail.com')) {
            setIsAdmin(true);
            setLoading(false);
            try {
               const { setDoc, serverTimestamp } = await import('firebase/firestore');
               await setDoc(doc(db, 'adminUsers', currentUser.uid), {
                   email: currentUser.email.toLowerCase(),
                   role: 'admin',
                   createdAt: serverTimestamp()
               }, { merge: true });
            } catch (e) {
               console.warn("Could not write adminUsers doc (safely ignored)", e);
            }
            return;
          }
          
          let adminExists = false;
          try {
              const adminDoc = await getDoc(doc(db, 'adminUsers', currentUser.uid));
              adminExists = adminDoc.exists();
          } catch (e: any) {
              console.warn("Could not read adminUsers document - assuming not admin", e.message);
          }

          if (adminExists) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            // Fetch student data
            try {
              const studentDoc = await getDoc(doc(db, 'students', currentUser.uid));
              if (studentDoc.exists()) {
                setUserData(studentDoc.data());
              }
            } catch (studentErr: any) {
              console.error("AuthContext students fetch error:", studentErr.message);
              throw studentErr;
            }
          }
        } catch (error) {
          console.error("AuthContext fetch error:", error);
          setIsAdmin(false);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, isAdmin, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
