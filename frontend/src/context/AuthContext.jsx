import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const ADMIN_ROLES = new Set([
  'admin',
  'super_admin',
]);

const normalizeRole = (role) => {
  if (!role) return null;

  if (typeof role === 'string') {
    return role.trim().toLowerCase();
  }

  if (typeof role === 'object') {
    return normalizeRole(role.name || role.slug || role.role);
  }

  return null;
};

const normalizeUser = (user) => {
  if (!user) return null;

  const role =
    normalizeRole(user.role) ||
    normalizeRole(user.role_name) ||
    normalizeRole(user.role_slug);

  return {
    ...user,
    role,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await authAPI.profile();
      const profileUser = normalizeUser(res.data?.user);

      setUser(profileUser);

      return profileUser;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    fetchProfile().finally(() => {
      setLoading(false);
    });
  }, [fetchProfile]);

  const login = async (userData, tokenData) => {
    if (!tokenData) {
      throw new Error('Authentication token is missing');
    }

    localStorage.setItem('token', tokenData);

    const normalizedUser = normalizeUser(userData);
    setUser(normalizedUser);

    return normalizedUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      return null;
    }

    return fetchProfile();
  };

  const role = normalizeRole(user?.role);

  const isAdmin = ADMIN_ROLES.has(role);
  const isLoggedIn = Boolean(user);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        role,
        isAdmin,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
