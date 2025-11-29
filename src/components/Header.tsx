import { useAuth, User, UserRole } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Link } from 'react-router-dom';
import { Home, PlusCircle } from 'lucide-react';

const Header = () => {
  const { user, setUser, users } = useAuth();

  const handleRoleChange = (role: UserRole) => {
    const newUser = users.find(u => u.role === role);
    if (newUser) {
      setUser(newUser);
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="text-2xl font-bold text-gray-900 dark:text-white">
              Panga Complaints
            </Link>
            <nav className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" asChild>
                    <Link to="/dashboard"><Home className="mr-2 h-4 w-4"/>Dashboard</Link>
                </Button>
                {user?.role === 'OUTLET_USER' && (
                    <Button variant="ghost" asChild>
                        <Link to="/new-complaint"><PlusCircle className="mr-2 h-4 w-4"/>New Complaint</Link>
                    </Button>
                )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.role.replace(/_/g, ' ')}</p>
            </div>
            <div>
                <Select onValueChange={handleRoleChange} value={user?.role}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Switch Role" />
                    </SelectTrigger>
                    <SelectContent>
                        {users.map((u: User) => (
                            <SelectItem key={u.id} value={u.role}>{u.role.replace(/_/g, ' ')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
