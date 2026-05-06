'use client';
import { useState, useEffect } from 'react';

export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem('resolver_auth') === 'true');
  }, []);

  const login = () => {
    localStorage.setItem('resolver_auth', 'true');
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem('resolver_auth');
    setIsLoggedIn(false);
  };

  return { isLoggedIn, login, logout };
}
