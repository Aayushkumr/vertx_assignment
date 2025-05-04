// filepath: /Users/aayushkumar/Intern/Vertx_Assignment/server/tests/feed.test.js
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');
const SavedContent = require('../models/SavedContent');
const jwt = require('jsonwebtoken');

describe('Feed Controller', () => {
  let token;
  let user;

  beforeEach(async () => {
    // Create a test user
    user = await User.create({
      username: 'feeduser',
      email: 'feed@example.com',
      password: 'password123',
      credits: 100
    });

    // Generate token
    token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
  });

  it('should get feed content', async () => {
    const res = await request(app)
      .get('/api/feed')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should save content and award credits', async () => {
    const contentToSave = {
      contentId: 'test123',
      source: 'twitter',
      title: 'Test Content',
      description: 'Test description',
      url: 'https://example.com/test'
    };

    const res = await request(app)
      .post('/api/feed/save')
      .set('Authorization', `Bearer ${token}`)
      .send(contentToSave);
    
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    
    // Check if content was saved
    const savedContent = await SavedContent.findOne({ contentId: 'test123' });
    expect(savedContent).toBeTruthy();
    
    // Check if user earned credits
    const updatedUser = await User.findById(user._id);
    expect(updatedUser.credits).toBeGreaterThan(100);
  });
});