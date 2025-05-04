import React, { useState, useEffect } from 'react';
import FeedCard from '../components/feed/FeedCard';
import api from '../utils/api';
import { toast } from 'react-toastify';
import { FaSpinner, FaSyncAlt } from 'react-icons/fa';

const Feed = () => {
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    source: 'all',
    sortBy: 'newest'
  });

  const fetchFeed = async (resetItems = true) => {
    try {
      setLoading(true);
      const res = await api.get('/feed', {
        params: {
          page: resetItems ? 1 : page,
          limit: 10,
          source: filters.source !== 'all' ? filters.source : undefined,
          sortBy: filters.sortBy
        }
      });
      
      if (resetItems) {
        setFeedItems(res.data.data);
        setPage(1);
      } else {
        setFeedItems([...feedItems, ...res.data.data]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(res.data.data.length === 10);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching feed');
      toast.error('Failed to load feed data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed(true);
  }, [filters]);

  const handleRefresh = () => {
    fetchFeed(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchFeed(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 sm:mb-0">Your Content Feed</h1>
        
        <div className="flex flex-wrap gap-2">
          <select
            name="source"
            value={filters.source}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Sources</option>
            <option value="twitter">Twitter</option>
            <option value="reddit">Reddit</option>
          </select>
          
          <select
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className="px-3 py-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
          >
            <FaSyncAlt className="mr-2" /> Refresh
          </button>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}
      
      {loading && page === 1 ? (
        <div className="flex justify-center items-center h-64">
          <FaSpinner className="animate-spin text-4xl text-blue-500" />
          <span className="ml-3 text-lg text-gray-600">Loading feed...</span>
        </div>
      ) : (
        <>
          {feedItems.length === 0 ? (
            <div className="bg-gray-100 p-8 rounded-lg text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No content found</h3>
              <p className="text-gray-600 mb-4">
                Try changing your filters or check back later for new content.
              </p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Refresh Feed
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {feedItems.map((item, index) => (
                  <FeedCard key={`${item.source}-${item.id}-${index}`} item={item} />
                ))}
              </div>
              
              {hasMore && (
                <div className="mt-8 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className={`px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading && page > 1 ? (
                      <>
                        <FaSpinner className="animate-spin inline-block mr-2" />
                        Loading...
                      </>
                    ) : (
                      'Load More'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Feed;