// Create web server
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const { randomBytes } = require('crypto');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const commentsByPostId = {};

// Get all comments for a post
app.get('/posts/:id/comments', (req, res) => {
  res.send(commentsByPostId[req.params.id] || []);
});

// Create a comment for a post
app.post('/posts/:id/comments', async (req, res) => {
  const commentId = randomBytes(4).toString('hex');
  const { content } = req.body;

  // Get comments for post
  const comments = commentsByPostId[req.params.id] || [];

  // Add new comment to comments
  comments.push({ id: commentId, content });

  // Set comments for post
  commentsByPostId[req.params.id] = comments;

  // Emit Event to Event Bus
  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: {
      id: commentId,
      postId: req.params.id,
      content,
    },
  });

  // Return comments
  res.status(201).send(comments);
});

// Receive events from Event Bus
app.post('/events', (req, res) => {
  console.log('Event Received', req.body.type);

  res.send({});
});

// Start server
app