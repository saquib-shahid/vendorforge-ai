/**
 * VendorForge AI - Backend Express Server
 * Ready for 1-click deployment on Render ("Best Use of Render" category)
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const agent = require('./src/agentOrchestrator');
const sentry = require('./src/services/sentryService');
const presetItems = require('./src/data/presetItems.json');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// Health check endpoint for Render service monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'VendorForge AI Reseller Copilot',
    environment: process.env.NODE_ENV || 'production',
    openSourceAI: {
      gemma2: 'Active (Google Gemma 2 Open Weights)',
      tabpfn: 'Active (Prior Labs TabPFN-3.5 Tabular Foundation Model)',
      mastra: 'Active (Mastra Agent Framework)',
      sentry: 'Active (Sentry Agent Tracing Telemetry)'
    }
  });
});

// Get preset demo items
app.get('/api/presets', (req, res) => {
  res.json(presetItems);
});

// Get sample sales CSV for TabPFN inspection
app.get('/api/dataset/sample', (req, res) => {
  const csvPath = path.join(__dirname, 'src/data/historical_sales_sample.csv');
  if (fs.existsSync(csvPath)) {
    const content = fs.readFileSync(csvPath, 'utf8');
    res.type('text/plain').send(content);
  } else {
    res.status(404).send('Sample dataset not found');
  }
});

// Run full Mastra agent pipeline
app.post('/api/agent/run', async (req, res) => {
  try {
    const { item, customCsv } = req.body;
    if (!item || !item.title) {
      return res.status(400).json({ error: 'Item details are required.' });
    }

    const result = await agent.processItem(item, customCsv);
    res.json(result);
  } catch (error) {
    console.error('Error running agent workflow:', error);
    res.status(500).json({ error: error.message || 'Agent workflow failed.' });
  }
});

// Get real-time Sentry agent traces
app.get('/api/telemetry/traces', (req, res) => {
  const traces = sentry.getRecentTraces();
  res.json(traces);
});

// Catch-all to serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🔥 VendorForge AI Server running on port ${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
  console.log(`🚀 Powered by Google Gemma 2 & Prior Labs TabPFN-3.5`);
  console.log(`====================================================`);
});
