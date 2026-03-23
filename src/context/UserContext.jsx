import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({
    name: '',
    age: 30,
    monthlyIncome: 100000,
    monthlyExpenses: 50000,
    isOnboarded: false,
  });

  const updateUser = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
