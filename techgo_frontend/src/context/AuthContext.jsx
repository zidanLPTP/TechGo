import React, { createContext, useState, useContext, useEffect } from 'react';

// Membuat Context Autentikasi
const AuthContext = createContext();

// Provider Autentikasi untuk membungkus aplikasi
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Membaca status login yang tersimpan di localStorage saat aplikasi pertama kali dimuat
  useEffect(() => {
    const savedUser = localStorage.getItem('techgo_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Gagal memproses data user dari localStorage:', error);
        localStorage.removeItem('techgo_user');
      }
    }
    setLoading(false);
  }, []);

  // Fungsi untuk login menggunakan Google
  const loginWithGoogle = (email, username) => {
    const userData = {
      username: username || email.split('@')[0],
      email: email,
      authProvider: 'google',
      isGuest: false
    };
    setUser(userData);
    localStorage.setItem('techgo_user', JSON.stringify(userData));
  };

  // Fungsi untuk login sebagai Guest (Tamu)
  const loginAsGuest = (username) => {
    const userData = {
      username: username || 'Petualang Cilik',
      email: null,
      authProvider: 'guest',
      isGuest: true
    };
    setUser(userData);
    localStorage.setItem('techgo_user', JSON.stringify(userData));
  };

  // Fungsi untuk logout (Keluar)
  const logout = () => {
    setUser(null);
    localStorage.removeItem('techgo_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, loginWithGoogle, loginAsGuest, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook untuk menggunakan AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
