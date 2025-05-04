import React, { useState, useEffect } from 'react';
import DashboardAnalytics from '../../components/admin/DashboardAnalytics';
import UsersTable from '../../components/admin/UsersTable';
import ReportedContentTable from '../../components/admin/ReportedContentTable';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { FaSpinner, FaUsers, FaFlag, FaChartBar } from 'react-icons/fa';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/admin');
      setDashboardData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching admin dashboard data');
      toast.error('Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <span className="ml-3 text-lg text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <p>{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-2 text-sm underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      
      <div className="mb-6">
        <div className="flex border-b">
          <button
            className={`px-4 py-2 focus:outline-none ${
              activeTab === 'analytics' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('analytics')}
          >
            <FaChartBar className="inline-block mr-2" />
            Analytics
          </button>
          
          <button
            className={`px-4 py-2 focus:outline-none ${
              activeTab === 'users' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers className="inline-block mr-2" />
            Users
          </button>
          
          <button
            className={`px-4 py-2 focus:outline-none ${
              activeTab === 'reported' 
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'text-gray-600 hover:text-blue-500'
            }`}
            onClick={() => setActiveTab('reported')}
          >
            <FaFlag className="inline-block mr-2" />
            Reported Content
          </button>
        </div>
      </div>
      
      {activeTab === 'analytics' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-blue-500 text-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Total Users</h3>
              <p className="text-3xl font-bold">{dashboardData.userStats.totalUsers}</p>
              <p className="text-sm mt-2">
                {dashboardData.userStats.newUsersToday} new today
              </p>
            </div>
            
            <div className="bg-green-500 text-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Total Credits</h3>
              <p className="text-3xl font-bold">{dashboardData.creditStats.totalCredits}</p>
              <p className="text-sm mt-2">
                {dashboardData.creditStats.creditsAwarded24h} awarded in the last 24h
              </p>
            </div>
            
            <div className="bg-purple-500 text-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-2">Content Interactions</h3>
              <p className="text-3xl font-bold">{dashboardData.activityStats.totalInteractions}</p>
              <p className="text-sm mt-2">
                {dashboardData.activityStats.interactionsToday} today
              </p>
            </div>
          </div>
          
          <DashboardAnalytics 
            userData={dashboardData.userData}
            activityData={dashboardData.activityData}
            contentData={dashboardData.contentData}
          />
        </>
      )}
      
      {activeTab === 'users' && (
        <UsersTable users={dashboardData.users} />
      )}
      
      {activeTab === 'reported' && (
        <ReportedContentTable reports={dashboardData.reportedContent} />
      )}
    </div>
  );
};

export default AdminDashboard;