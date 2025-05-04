import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCoins, FaSignInAlt, FaSave, FaShare } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/dashboard');
      setDashboardData(res.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching dashboard data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Creator Dashboard</h1>
        
        {/* Credit Statistics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Credits</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-2 mb-2">
                <FaCoins className="text-blue-500" />
                <div className="text-blue-600 font-medium">Total</div>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {dashboardData?.creditStats.total || 0}
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2 mb-2">
                <FaSignInAlt className="text-green-500" />
                <div className="text-green-600 font-medium">From Logins</div>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {dashboardData?.creditStats.fromLogin || 0}
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2 mb-2">
                <FaSave className="text-purple-500" />
                <div className="text-purple-600 font-medium">From Saves</div>
              </div>
              <div className="text-3xl font-bold text-purple-700">
                {dashboardData?.creditStats.fromSaves || 0}
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <div className="flex items-center space-x-2 mb-2">
                <FaShare className="text-indigo-500" />
                <div className="text-indigo-600 font-medium">From Shares</div>
              </div>
              <div className="text-3xl font-bold text-indigo-700">
                {dashboardData?.creditStats.fromShares || 0}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Saved Content */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Recently Saved</h2>
            <Link to="/saved" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          
          {dashboardData?.savedContent?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dashboardData.savedContent.map((content) => (
                <div key={content._id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {content.image && (
                    <div className="h-40 overflow-hidden">
                      <img 
                        src={content.image} 
                        alt={content.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded text-gray-600 uppercase">
                        {content.source}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-1 truncate">{content.title}</h3>
                    <a 
                      href={content.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs text-blue-600 hover:underline"
                    >
                      View Original
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">You haven't saved any content yet.</p>
          )}
        </div>
        
        {/* Recent Activity */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Recent Activity</h2>
          
          {dashboardData?.recentActivity?.length > 0 ? (
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Activity</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Credits</th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {dashboardData.recentActivity.map((activity) => (
                    <tr key={activity._id}>
                      <td className="py-4 pl-4 pr-3 text-sm text-gray-900">
                        {activity.description}
                      </td>
                      <td className="px-3 py-4 text-sm font-medium text-green-600">
                        {activity.creditsEarned > 0 ? `+${activity.creditsEarned}` : activity.creditsEarned}
                      </td>
                      <td className="px-3 py-4 text-sm text-gray-500">
                        {new Date(activity.createdAt).toLocaleDateString()} 
                        {' '}
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;