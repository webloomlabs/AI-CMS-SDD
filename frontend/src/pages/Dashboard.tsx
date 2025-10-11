import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Welcome back, {user?.name}!
              </p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Content
              </h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Total items</p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
                Media
              </h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">0</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">Files uploaded</p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                AI Generated
              </h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">Items created</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <p className="text-gray-600 dark:text-gray-400">Create New Content</p>
              </div>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer">
                <p className="text-gray-600 dark:text-gray-400">Upload Media</p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>User:</strong> {user?.email} | <strong>Role:</strong> {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
