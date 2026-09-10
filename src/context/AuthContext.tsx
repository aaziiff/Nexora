import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAdminAuthenticated: boolean;
  adminLogin: (passcode: string) => boolean;
  adminLogout: () => void;
  setCustomAdminPassword: (newPasscode: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_AUTH_KEY = 'nexora_admin_session_v1';
const ADMIN_PASSCODE_STORAGE_KEY = 'nexora_custom_admin_passcode';
const DEFAULT_FALLBACK_PASSCODE = 'aaziiff';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem(ADMIN_AUTH_KEY, isAdminAuthenticated ? 'true' : 'false');
  }, [isAdminAuthenticated]);

  const getEffectivePasscode = (): string => {
    // 1. Environment variable if provided
    const envPass = import.meta.env.VITE_ADMIN_PASSCODE;
    if (envPass && envPass.trim()) return envPass.trim();

    // 2. Custom password saved in storage
    const customPass = localStorage.getItem(ADMIN_PASSCODE_STORAGE_KEY);
    if (customPass && customPass.trim()) return customPass.trim();

    // 3. Default fallback
    return DEFAULT_FALLBACK_PASSCODE;
  };

  const adminLogin = (passcode: string): boolean => {
    const validPasscode = getEffectivePasscode();
    const input = passcode.trim();

    if (input === validPasscode) {
      setIsAdminAuthenticated(true);
      return true;
    }
    return false;
  };

  const adminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem(ADMIN_AUTH_KEY);
  };

  const setCustomAdminPassword = (newPasscode: string) => {
    if (newPasscode && newPasscode.trim()) {
      localStorage.setItem(ADMIN_PASSCODE_STORAGE_KEY, newPasscode.trim());
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminLogin,
        adminLogout,
        setCustomAdminPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
