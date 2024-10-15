'use client';

import { ReactNode, createContext, useContext } from 'react';
import type { Tables } from '@/libs/supabase/_database';

const UserContext = createContext<Tables<'users'> | undefined>(undefined);

export const UserProvider = ({
  user,
  children,
}: {
  user: Tables<'users'>;
  children: ReactNode;
}) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};
