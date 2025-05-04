import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const DashboardAnalytics = ({ userData, activityData, contentData }) => {
  // User registration chart data
  const userChartData = {
    labels: userData.labels,
    datasets: [
      {
        label: 'New Users',
        data: userData.counts,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  // Activity type distribution chart data
  const activityPieData = {
    labels: ['Logins', 'Profile Updates', 'Content Saves', 'Content Shares', 'Content Reports'],
    datasets: [
      {
        data: [
          activityData.loginCount,
          activityData.profileUpdateCount,
          activityData.saveCount,
          activityData.shareCount,
          activityData.reportCount
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Credits awarded over time
  const creditsChartData = {
    labels: activityData.creditLabels,
    datasets: [
      {
        label: 'Credits Awarded',
        data: activityData.creditCounts,
        fill: false,
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1
      }
    ]
  };

  // Content source distribution
  const contentSourceData = {
    labels: ['Twitter', 'Reddit'],
    datasets: [
      {
        data: [contentData.twitterCount, contentData.redditCount],
        backgroundColor: [
          'rgba(29, 161, 242, 0.6)',
          'rgba(255, 69, 0, 0.6)'
        ],
        borderColor: [
          'rgba(29, 161, 242, 1)',
          'rgba(255, 69, 0, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">User Registrations</h3>
        <Bar 
          data={userChartData} 
          options={{
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0
                }
              }
            }
          }}
        />
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Activity Distribution</h3>
        <Pie 
          data={activityPieData}
          options={{
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }}
        />
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Credits Awarded</h3>
        <Line 
          data={creditsChartData}
          options={{
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }}
        />
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Content Sources</h3>
        <Pie 
          data={contentSourceData}
          options={{
            plugins: {
              legend: {
                position: 'bottom'
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default DashboardAnalytics;