import React from 'react';
import { useAuth } from 'react-auth-utils';
import { User } from '../models/User';
import { Avatar } from './components/Avatar';

export const MainScreen: React.FC = () => {
  const { user, signOut } = useAuth<User>();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const handleLogout = () => {
    signOut();
  };

  return (
    <div className="flex">
      <nav className="flex flex-col w-screen items-end p-2">
        <Avatar
          fullName={user?.fullName}
          onClick={() => setUserMenuOpen((prev) => !prev)}
        />

        {userMenuOpen && (
          <div className="z-50 my-4 absolute right-1 top-10 block text-base list-none bg-white divide-y divide-gray-100 rounded shadow">
            <div className="px-4 py-3">
              <p className="text-sm text-gray-900">{user?.fullName}</p>
              <p className="text-sm font-medium text-gray-500 truncate">
                {user?.team}
              </p>
              <p className="text-sm text-gray-500 truncate">{user?.company}</p>
            </div>
            <ul className="py-1">
              <li>
                <div
                  onClick={handleLogout}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  Log out
                </div>
              </li>
            </ul>
          </div>
        )}
      </nav>
    </div>
  );
};
