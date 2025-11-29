import { createContext, useContext, useState, ReactNode } from 'react';

// 1. UPDATED: Role definitions to match the new workflow
export type UserRole = 'OUTLET_USER' | 'SALES_REP' | 'FGS_WAREHOUSE' | 'QC_LAB' | 'FINANCE' | 'ADMIN' | 'EXCO';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

// 2. UPDATED: Mock users with new roles
const users: User[] = [
  { id: 1, name: 'Jitahidi Mart', email: 'outlet@example.com', role: 'OUTLET_USER', department: 'Sales' },
  { id: 2, name: 'Asha Juma', email: 'sales@example.com', role: 'SALES_REP', department: 'Sales' },
  { id: 3, name: 'Baraka Warehouse', email: 'fgs@example.com', role: 'FGS_WAREHOUSE', department: 'Supply Chain' },
  { id: 4, name: 'Maabara Labs', email: 'qc@example.com', role: 'QC_LAB', department: 'Quality' },
  { id: 5, name: 'Hesabu Finance', email: 'finance@example.com', role: 'FINANCE', department: 'Finance' },
  { id: 6, name: 'Admin User', email: 'admin@example.com', role: 'ADMIN', department: 'IT' },
  { id: 7, name: 'Halima CEO', email: 'exco@example.com', role: 'EXCO', department: 'Management' },
];

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void; // Allow direct user setting for role switching
  users: User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(users[0]); // Default to Outlet User

  const login = (email: string) => {
    const foundUser = users.find(u => u.email === email);
    setUser(foundUser || null);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, setUser, users }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
