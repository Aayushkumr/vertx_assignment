const redis = require('redis');
const { promisify } = require('util');

// Create Redis client
const client = redis.createClient(process.env.REDIS_URL || 'redis://localhost:6379');

client.on('error', (err) => {
  console.log('Redis Client Error', err);
});

client.on('connect', () => {
  console.log('Redis Client Connected');
});

// Promisify Redis commands
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const delAsync = promisify(client.del).bind(client);

// Cache middleware for API responses
const cacheData = (key, data, ttl = 600) => {
  return setAsync(key, JSON.stringify(data), 'EX', ttl);
};

// Get cached data
const getCachedData = async (key) => {
  const cachedData = await getAsync(key);
  return cachedData ? JSON.parse(cachedData) : null;
};

// Clear cache for a given key
const clearCache = (key) => {
  return delAsync(key);
};

module.exports = {
  cacheData,
  getCachedData,
  clearCache,
  client
};