import React, { useEffect } from 'react';
import { useAuth } from 'react-auth-utils';
import { User } from '../data/models';
import { Avatar } from './components/Avatar';
import Moment from 'react-moment';
import { Timer } from './components/Timer';
import axios from 'axios';

export const MainScreen: React.FC = () => {
  const { user, signOut } = useAuth<User>();
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);
  const [tracking, setTracking] = React.useState(false);
  const [time, setTime] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  const handleLogout = () => {
    signOut();
  };

  useEffect(() => {
    if (tracking) {
      const interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [tracking]);

  useEffect(() => {
    if (tracking) {
      // Start foreground Activity Tracking
      window.Electron?.ipcRenderer.send('track', { command: 'start' });
    } else {
      // Stop foreground Activity Tracking
      window.Electron?.ipcRenderer.send('track', { command: 'stop' });
    }
  }, [tracking]);

  const clockIn = async () => {
    setLoading(true);
    try {
      await axios.post('/time/clock-in', { time: new Date().toString() });
      setTracking(true);
    } catch (error) {
      console.error('Failed to clock in', error);
    } finally {
      setLoading(false);
    }
  };

  const clockOut = async () => {
    setLoading(true);
    try {
      await axios.post('/time/clock-out', { time: new Date().toString() });
      setTracking(false);
    } catch (error) {
      console.error('Failed to clock out', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
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
                {user?.team?.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {user?.company?.name}
              </p>
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

      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="flex w-full justify-center">
          <h3 className="text-xl text-secondary-500 font-medium">
            <Moment format="dddd, D MMMM YYYY" />
          </h3>
        </div>

        <div className="flex w-full justify-center">
          <h1 className="text-6xl text-primary-500 font-bold">
            <Timer seconds={time} />
          </h1>
        </div>

        <div className="flex w-full justify-center">
          {tracking ? (
            <button
              disabled={loading}
              className="bg-warning-500 hover:bg-warning-600 text-white uppercase font-bold py-4 px-8 rounded-full w-64 h-18 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={clockOut}
            >
              Clock out
            </button>
          ) : (
            <button
              disabled={loading}
              className="bg-primary-500 hover:bg-primary-600 text-white uppercase font-bold py-4 px-8 rounded-full w-64 h-18 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={clockIn}
            >
              Clock in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
