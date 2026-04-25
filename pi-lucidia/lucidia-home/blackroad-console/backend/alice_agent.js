#!/usr/bin/env node
/**
 * Alice AI Agent - Claude-powered neighbor (Node.js version)
 * Runs on alice@alice
 */

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
app.use(express.json());

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'test-key'
});

const conversationHistory = [];

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    name: 'alice',
    ai_type: 'claude',
    timestamp: new Date().toISOString()
  });
});

app.post('/chat', async (req, res) => {
  const { message, context = {} } = req.body;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4',
      max_tokens: 1024,
      messages: [{ role: 'user', content: message }]
    });

    const reply = response.content[0].text;

    conversationHistory.push({
      timestamp: new Date().toISOString(),
      message,
      reply,
      context
    });

    res.json({
      neighbor: 'alice',
      ai_type: 'claude',
      reply,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/history', (req, res) => {
  res.json({
    neighbor: 'alice',
    history: conversationHistory
  });
});

const PORT = 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏠 Alice (Claude) AI Agent starting...`);
  console.log(`   Listening on http://0.0.0.0:${PORT}`);
});
