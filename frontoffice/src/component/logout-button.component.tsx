"use client";

import { useRouter } from "next/navigation";
import AuthService from "../app/services/auth.service";
import { useState, useEffect } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setUsername(user.username);
    }
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    router.push("/login");
  };

  if (!AuthService.isLoggedIn()) {
    return null;
  }

  return (
    <div className="flex items-center">
      <span className="text-sm me-3 flex items-start h-full">
        Bonjour, {username}
      </span>
      <button
        onClick={handleLogout}
        className="btn btn-ghost btn-circle hidden md:flex items-center space-x-4 -translate-y-2"
      >
        <span className="material-symbols-outlined">
          account_circle
        </span>
      </button>
    </div>
  );
}
