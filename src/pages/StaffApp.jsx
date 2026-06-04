import React, { useState } from 'react';
import GardenerApp from './GardenerApp';
import AdminApp from './AdminApp';
import '../styles/staff.css';

export default function StaffApp({ initialUser, onLogout }) {
  const [currentUser, setCurrentUser] = useState(initialUser || null);

  if (!currentUser) {
    onLogout();
    return null;
  }

  const handleLocalLogout = () => {
    setCurrentUser(null);
    onLogout();
  };

  if (currentUser.role === "gardener") {
    return (
      <GardenerApp
        user={currentUser}
        onLogout={handleLocalLogout}
      />
    );
  }

  if (currentUser.role === "admin") {
    return (
      <AdminApp
        user={currentUser}
        onLogout={handleLocalLogout}
      />
    );
  }

  return null;
}
