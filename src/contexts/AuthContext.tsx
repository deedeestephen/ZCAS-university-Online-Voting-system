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
          // Check if admin
          const adminDoc = await getDoc(doc(db, 'adminUsers', currentUser.uid));
          if (adminDoc.exists() || currentUser.email === 'admin@zcas.edu.zm') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
            // Fetch student data
            const studentDoc = await getDoc(doc(db, 'students', currentUser.uid));
            if (studentDoc.exists()) {
              setUserData(studentDoc.data());
            }
          }
        } catch (error) {
          console.error("AuthContext fetch error:", error);
          if (currentUser.email === 'admin@zcas.edu.zm') {
              setIsAdmin(true);
          } else {
              setIsAdmin(false);
          }
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
