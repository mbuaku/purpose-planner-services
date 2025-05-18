require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3005;

// Import routes
const bibleReadingRoutes = require('./src/routes/bible-reading.routes');
// const readingPlanRoutes = require('./src/routes/reading-plan.routes'); // Commented out - file doesn't exist
const prayerRoutes = require('./src/routes/prayer.routes');
const prayerSessionRoutes = require('./src/routes/prayer-session.routes');
const journalRoutes = require('./src/routes/journal.routes');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup in-memory database if MongoDB is not available
global.inMemoryDB = {
  bibleReadings: [],
  readingPlans: [],
  prayers: [],
  prayerSessions: [],
  journalEntries: []
};

// Try to connect to MongoDB, fall back to in-memory if not available
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purpose-planner-spiritual', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected');
  global.inMemoryDB = undefined; // Disable in-memory DB if MongoDB connects
})
.catch(err => {
  console.log('MongoDB Connection Error:', err);
  console.log('Using in-memory database instead');
});

// Setup uploads directory
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const setupUploads = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(`Upload directory created at ${uploadDir}`);
  } catch (error) {
    console.error('Error creating upload directory:', error);
  }
};
setupUploads();

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Spiritual Service is healthy',
    timestamp: new Date().toISOString()
  });
});

// Welcome route with HTML test form
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Purpose Planner Spiritual Service</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1, h2 {
          color: #4F46E5;
        }
        .api-info {
          background-color: #f9f9f9;
          border-left: 4px solid #4F46E5;
          padding: 15px;
          margin-bottom: 20px;
        }
        .test-panel {
          background-color: #f0f0f0;
          border-radius: 5px;
          padding: 20px;
          margin-top: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input[type="text"],
        input[type="number"],
        textarea,
        select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          background-color: #4F46E5;
          color: white;
          border: none;
          padding: 10px 15px;
          border-radius: 4px;
          cursor: pointer;
        }
        .response {
          margin-top: 20px;
          padding: 15px;
          background-color: #f0f0f0;
          border-radius: 4px;
          white-space: pre-wrap;
        }
        .nav-tabs {
          display: flex;
          border-bottom: 1px solid #ddd;
          margin-bottom: 20px;
        }
        .nav-tab {
          padding: 10px 15px;
          cursor: pointer;
          border: 1px solid transparent;
          border-bottom: none;
          margin-right: 5px;
        }
        .nav-tab.active {
          background-color: #f0f0f0;
          border-color: #ddd;
          border-radius: 4px 4px 0 0;
        }
        .tab-content {
          display: none;
        }
        .tab-content.active {
          display: block;
        }
      </style>
    </head>
    <body>
      <h1>Purpose Planner Spiritual Service</h1>
      <div class="api-info">
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Description:</strong> Spiritual growth tracking service for Purpose Planner</p>
      </div>
      
      <div class="nav-tabs">
        <div class="nav-tab active" data-tab="bible">Bible Reading</div>
        <div class="nav-tab" data-tab="plan">Reading Plans</div>
        <div class="nav-tab" data-tab="prayer">Prayer</div>
        <div class="nav-tab" data-tab="journal">Journal</div>
      </div>
      
      <div id="bible-tab" class="tab-content active">
        <h2>Bible Reading Tracking</h2>
        
        <div class="test-panel">
          <h3>Log Bible Reading</h3>
          <form id="bibleReadingForm">
            <div class="form-group">
              <label for="token">JWT Token</label>
              <input type="text" id="token" required>
            </div>
            <div class="form-group">
              <label for="book">Book</label>
              <input type="text" id="book" required placeholder="e.g. John">
            </div>
            <div class="form-group">
              <label for="chapter">Chapter</label>
              <input type="number" id="chapter" required min="1">
            </div>
            <div class="form-group">
              <label for="verseStart">Starting Verse (optional)</label>
              <input type="number" id="verseStart" min="1">
            </div>
            <div class="form-group">
              <label for="verseEnd">Ending Verse (optional)</label>
              <input type="number" id="verseEnd" min="1">
            </div>
            <div class="form-group">
              <label for="notes">Notes (optional)</label>
              <textarea id="notes" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="duration">Duration (minutes)</label>
              <input type="number" id="duration" min="1">
            </div>
            <button type="submit">Log Reading</button>
          </form>
          <div id="bibleReadingResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Get Recent Bible Readings</h3>
          <form id="getReadingsForm">
            <div class="form-group">
              <label for="readingsToken">JWT Token</label>
              <input type="text" id="readingsToken" required>
            </div>
            <button type="submit">Get Readings</button>
          </form>
          <div id="getReadingsResponse" class="response"></div>
        </div>
      </div>
      
      <div id="plan-tab" class="tab-content">
        <h2>Reading Plans</h2>
        
        <div class="test-panel">
          <h3>Create Reading Plan</h3>
          <form id="createPlanForm">
            <div class="form-group">
              <label for="planToken">JWT Token</label>
              <input type="text" id="planToken" required>
            </div>
            <div class="form-group">
              <label for="planTitle">Title</label>
              <input type="text" id="planTitle" required>
            </div>
            <div class="form-group">
              <label for="planDescription">Description</label>
              <textarea id="planDescription" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="planType">Type</label>
              <select id="planType">
                <option value="chronological">Chronological</option>
                <option value="devotional">Devotional</option>
                <option value="topical">Topical</option>
                <option value="cover-to-cover">Cover to Cover</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <button type="submit">Create Plan</button>
          </form>
          <div id="createPlanResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Get Reading Plans</h3>
          <form id="getPlansForm">
            <div class="form-group">
              <label for="getPlansToken">JWT Token</label>
              <input type="text" id="getPlansToken" required>
            </div>
            <button type="submit">Get Plans</button>
          </form>
          <div id="getPlansResponse" class="response"></div>
        </div>
      </div>
      
      <div id="prayer-tab" class="tab-content">
        <h2>Prayer Tracking</h2>
        
        <div class="test-panel">
          <h3>Add Prayer Request</h3>
          <form id="addPrayerForm">
            <div class="form-group">
              <label for="prayerToken">JWT Token</label>
              <input type="text" id="prayerToken" required>
            </div>
            <div class="form-group">
              <label for="prayerTitle">Title</label>
              <input type="text" id="prayerTitle" required>
            </div>
            <div class="form-group">
              <label for="prayerDescription">Description</label>
              <textarea id="prayerDescription" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="prayerCategory">Category</label>
              <select id="prayerCategory">
                <option value="praise">Praise</option>
                <option value="confession">Confession</option>
                <option value="thanksgiving">Thanksgiving</option>
                <option value="supplication">Supplication</option>
                <option value="intercession">Intercession</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit">Add Prayer</button>
          </form>
          <div id="addPrayerResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Log Prayer Session</h3>
          <form id="logSessionForm">
            <div class="form-group">
              <label for="sessionToken">JWT Token</label>
              <input type="text" id="sessionToken" required>
            </div>
            <div class="form-group">
              <label for="sessionDuration">Duration (minutes)</label>
              <input type="number" id="sessionDuration" required min="1">
            </div>
            <div class="form-group">
              <label for="sessionNotes">Notes</label>
              <textarea id="sessionNotes" rows="3"></textarea>
            </div>
            <button type="submit">Log Session</button>
          </form>
          <div id="logSessionResponse" class="response"></div>
        </div>
      </div>
      
      <div id="journal-tab" class="tab-content">
        <h2>Journal Entries</h2>
        
        <div class="test-panel">
          <h3>Create Journal Entry</h3>
          <form id="createJournalForm">
            <div class="form-group">
              <label for="journalToken">JWT Token</label>
              <input type="text" id="journalToken" required>
            </div>
            <div class="form-group">
              <label for="journalTitle">Title</label>
              <input type="text" id="journalTitle" required>
            </div>
            <div class="form-group">
              <label for="journalContent">Content</label>
              <textarea id="journalContent" rows="5" required></textarea>
            </div>
            <div class="form-group">
              <label for="journalCategory">Category</label>
              <select id="journalCategory">
                <option value="devotional">Devotional</option>
                <option value="reflection">Reflection</option>
                <option value="prayer">Prayer</option>
                <option value="sermon_notes">Sermon Notes</option>
                <option value="testimony">Testimony</option>
                <option value="gratitude">Gratitude</option>
                <option value="other">Other</option>
              </select>
            </div>
            <button type="submit">Create Entry</button>
          </form>
          <div id="createJournalResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Get Journal Entries</h3>
          <form id="getJournalsForm">
            <div class="form-group">
              <label for="getJournalsToken">JWT Token</label>
              <input type="text" id="getJournalsToken" required>
            </div>
            <button type="submit">Get Entries</button>
          </form>
          <div id="getJournalsResponse" class="response"></div>
        </div>
      </div>
      
      <script>
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            // Remove active class from all tabs
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-tab') + '-tab').classList.add('active');
          });
        });
        
        // Get token from URL param
        function getTokenFromUrl() {
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get('token');
          if (token) {
            // Store token in all token fields
            document.querySelectorAll('input[id$="Token"]').forEach(el => {
              el.value = token;
            });
            document.getElementById('token').value = token;
            
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        // Bible Reading Form
        document.getElementById('bibleReadingForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('bibleReadingResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('token').value;
          
          try {
            const res = await fetch('/api/bible-readings', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                book: document.getElementById('book').value,
                chapter: parseInt(document.getElementById('chapter').value),
                verses: {
                  start: document.getElementById('verseStart').value ? parseInt(document.getElementById('verseStart').value) : undefined,
                  end: document.getElementById('verseEnd').value ? parseInt(document.getElementById('verseEnd').value) : undefined
                },
                notes: document.getElementById('notes').value,
                duration: document.getElementById('duration').value ? parseInt(document.getElementById('duration').value) : undefined
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Readings Form
        document.getElementById('getReadingsForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getReadingsResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('readingsToken').value;
          
          try {
            const res = await fetch('/api/bible-readings', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
              },
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Create Reading Plan Form
        document.getElementById('createPlanForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('createPlanResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('planToken').value;
          
          try {
            const res = await fetch('/api/reading-plans', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: document.getElementById('planTitle').value,
                description: document.getElementById('planDescription').value,
                type: document.getElementById('planType').value
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Reading Plans Form
        document.getElementById('getPlansForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getPlansResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('getPlansToken').value;
          
          try {
            const res = await fetch('/api/reading-plans', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
              },
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Add Prayer Form
        document.getElementById('addPrayerForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('addPrayerResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('prayerToken').value;
          
          try {
            const res = await fetch('/api/prayers', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: document.getElementById('prayerTitle').value,
                description: document.getElementById('prayerDescription').value,
                category: document.getElementById('prayerCategory').value
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Log Prayer Session Form
        document.getElementById('logSessionForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('logSessionResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('sessionToken').value;
          
          try {
            const res = await fetch('/api/prayer-sessions', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                duration: parseInt(document.getElementById('sessionDuration').value),
                notes: document.getElementById('sessionNotes').value,
                endTime: new Date().toISOString()
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Create Journal Entry Form
        document.getElementById('createJournalForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('createJournalResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('journalToken').value;
          
          try {
            const res = await fetch('/api/journals', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: document.getElementById('journalTitle').value,
                content: document.getElementById('journalContent').value,
                category: document.getElementById('journalCategory').value
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Journal Entries Form
        document.getElementById('getJournalsForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getJournalsResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('getJournalsToken').value;
          
          try {
            const res = await fetch('/api/journals', {
              method: 'GET',
              headers: {
                'Authorization': 'Bearer ' + token,
              },
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Run on page load
        window.addEventListener('load', getTokenFromUrl);
      </script>
    </body>
    </html>
  `);
});

// API routes
app.use('/api/bible-readings', bibleReadingRoutes);
// app.use('/api/reading-plans', readingPlanRoutes); // Commented out - file doesn't exist
app.use('/api/prayers', prayerRoutes);
app.use('/api/prayer-sessions', prayerSessionRoutes);
app.use('/api/journals', journalRoutes);

// Handle 404 errors
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`Error: ${err.message}`);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Something went wrong!',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Spiritual Service running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! Shutting down...');
  console.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Export for testing
module.exports = app;