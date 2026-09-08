import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../lib/api';
import { AuthContext } from './auth-context';

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')));

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const login = useCallback((nextToken, nextUser) => {
    localStorage.setItem('token', nextToken);
    localStorage.setItem('user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  // Pull the live profile so `isVoted` / `votedFor` never go stale
  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem('token')) return null;

    const { data } = await api.get('/user/profile');
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        await refreshProfile();
      } catch {
        // An expired or invalid token just means we stay signed out
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, [refreshProfile]);

  // api.js fires this when the token expires mid-session
  useEffect(() => {
    window.addEventListener('truechoice:session-expired', logout);
    return () => window.removeEventListener('truechoice:session-expired', logout);
  }, [logout]);

  const value = useMemo(
    () => ({ user, token, loading, isLoggedIn: Boolean(token), login, logout, refreshProfile }),
    [user, token, loading, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
