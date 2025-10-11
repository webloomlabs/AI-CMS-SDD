import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.name}!
            </p>
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
              <Link to="/content/new" className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                <p className="text-gray-600 dark:text-gray-400">Create New Content</p>
              </Link>
              <Link to="/media" className="block border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-500 transition-colors">
                <p className="text-gray-600 dark:text-gray-400">Upload Media</p>
              </Link>
            </div>
          </div>

          <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>User:</strong> {user?.email} | <strong>Role:</strong> {user?.role}
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
