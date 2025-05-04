const { TwitterApi } = require('twitter-api-v2');
const snoowrap = require('snoowrap');

// Create Twitter client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const readOnlyClient = twitterClient.readOnly;

// Create Reddit client
const redditClient = new snoowrap({
  userAgent: 'Creator Dashboard App v1.0 by /u/YOUR_USERNAME',
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  username: process.env.REDDIT_USERNAME,
  password: process.env.REDDIT_PASSWORD
});

// Fetch tweets from Twitter
const fetchTwitterContent = async (query = 'web development', maxResults = 10) => {
  try {
    const result = await readOnlyClient.v2.search({
      query: query,
      max_results: maxResults,
      'tweet.fields': ['created_at', 'public_metrics', 'entities'],
      expansions: ['attachments.media_keys'],
      'media.fields': ['url', 'preview_image_url'],
    });

    return result.data.map(tweet => ({
      id: tweet.id,
      source: 'twitter',
      title: tweet.text.substring(0, 100),
      description: tweet.text,
      image: tweet.entities?.urls?.[0]?.images?.[0]?.url || 'https://picsum.photos/800/400?random=' + tweet.id,
      url: `https://twitter.com/twitter/status/${tweet.id}`,
      upvotes: tweet.public_metrics?.like_count || 0,
      comments: tweet.public_metrics?.reply_count || 0,
      createdAt: new Date(tweet.created_at)
    }));
  } catch (error) {
    console.error('Error fetching Twitter content:', error);
    return [];
  }
};

// Fetch posts from Reddit
const fetchRedditContent = async (subreddit = 'webdev', limit = 10) => {
  try {
    const posts = await redditClient.getSubreddit(subreddit).getHot({ limit });
    
    return posts.map(post => ({
      id: post.id,
      source: 'reddit',
      title: post.title,
      description: post.selftext.substring(0, 200) + (post.selftext.length > 200 ? '...' : ''),
      image: post.thumbnail !== 'self' && post.thumbnail !== 'default' ? post.thumbnail : 
             (post.preview?.images[0]?.source?.url || 'https://picsum.photos/800/400?random=' + post.id),
      url: `https://reddit.com${post.permalink}`,
      upvotes: post.ups,
      comments: post.num_comments,
      createdAt: new Date(post.created_utc * 1000)
    }));
  } catch (error) {
    console.error('Error fetching Reddit content:', error);
    return [];
  }
};

module.exports = {
  fetchTwitterContent,
  fetchRedditContent
};