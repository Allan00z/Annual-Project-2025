'use client';
import { useState, useEffect } from 'react';
import AuthService from '../app/services/auth.service';

interface AdminLinkProps {
  className?: string;
  mobile?: boolean;
}

export default function AdminLink({ className = "", mobile = false }: AdminLinkProps) {
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      try {
        if (!AuthService.isLoggedIn()) {
          setIsOwner(false);
          setIsLoading(false);
          return;
        }

        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
          setIsOwner(false);
          setIsLoading(false);
          return;
        }

        // Check if user has owner role
        const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1338';
        const token = AuthService.getToken();
        
        if (!token) {
          setIsOwner(false);
          setIsLoading(false);
          return;
        }

        const response = await fetch(`${STRAPI_URL}/api/users/me?populate=role`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setIsOwner(userData.role?.type === 'owner');
        } else {
          setIsOwner(false);
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du rôle:', error);
        setIsOwner(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkRole();

    // Listen for auth changes
    const handleStorageChange = () => {
      checkRole();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  if (isLoading || !isOwner) {
    return null;
  }

  if (mobile) {
    return (
      <a href="/admin" className={`text-red-600 font-medium ${className}`}>
        ADMINISTRATION
      </a>
    );
  }

  return (
    <a
      href="/admin"
      className={`text-red-600 font-medium hover:text-red-700 transition-colors ${className}`}
      title="Panel d'administration"
    >
      ADMIN
    </a>
  );
}
