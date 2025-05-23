require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3004;

// Import routes
const incomeRoutes = require('./src/routes/income.routes');
const expenseRoutes = require('./src/routes/expense.routes');
const budgetRoutes = require('./src/routes/budget.routes');
const savingsGoalRoutes = require('./src/routes/savings-goal.routes');

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup in-memory database if MongoDB is not available
global.inMemoryDB = {
  incomes: [],
  expenses: [],
  budgets: [],
  savingsGoals: []
};

// Try to connect to MongoDB, fall back to in-memory if not available
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/purpose-planner-financial', {
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
    message: 'Financial Service is healthy',
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
      <title>Purpose Planner Financial Service</title>
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
      <h1>Purpose Planner Financial Service</h1>
      <div class="api-info">
        <p><strong>Version:</strong> 1.0.0</p>
        <p><strong>Description:</strong> Financial management service for Purpose Planner</p>
      </div>
      
      <div class="nav-tabs">
        <div class="nav-tab active" data-tab="income">Income</div>
        <div class="nav-tab" data-tab="expense">Expenses</div>
        <div class="nav-tab" data-tab="budget">Budgets</div>
        <div class="nav-tab" data-tab="savings">Savings Goals</div>
      </div>
      
      <div id="income-tab" class="tab-content active">
        <h2>Income Management</h2>
        
        <div class="test-panel">
          <h3>Add Income</h3>
          <form id="addIncomeForm">
            <div class="form-group">
              <label for="incomeToken">JWT Token</label>
              <input type="text" id="incomeToken" required>
            </div>
            <div class="form-group">
              <label for="incomeTitle">Title</label>
              <input type="text" id="incomeTitle" required placeholder="e.g. Salary">
            </div>
            <div class="form-group">
              <label for="incomeAmount">Amount</label>
              <input type="number" id="incomeAmount" required min="0" step="0.01">
            </div>
            <div class="form-group">
              <label for="incomeCategory">Category</label>
              <select id="incomeCategory">
                <option value="salary">Salary</option>
                <option value="freelance">Freelance</option>
                <option value="investment">Investment</option>
                <option value="gift">Gift</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="incomeDate">Date</label>
              <input type="date" id="incomeDate" required>
            </div>
            <div class="form-group">
              <label for="incomeNotes">Notes (optional)</label>
              <textarea id="incomeNotes" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="incomeRecurring">Recurring</label>
              <select id="incomeRecurring">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <button type="submit">Add Income</button>
          </form>
          <div id="addIncomeResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Get Income Entries</h3>
          <form id="getIncomesForm">
            <div class="form-group">
              <label for="getIncomesToken">JWT Token</label>
              <input type="text" id="getIncomesToken" required>
            </div>
            <button type="submit">Get Income Entries</button>
          </form>
          <div id="getIncomesResponse" class="response"></div>
        </div>
      </div>
      
      <div id="expense-tab" class="tab-content">
        <h2>Expense Management</h2>
        
        <div class="test-panel">
          <h3>Add Expense</h3>
          <form id="addExpenseForm">
            <div class="form-group">
              <label for="expenseToken">JWT Token</label>
              <input type="text" id="expenseToken" required>
            </div>
            <div class="form-group">
              <label for="expenseTitle">Title</label>
              <input type="text" id="expenseTitle" required placeholder="e.g. Groceries">
            </div>
            <div class="form-group">
              <label for="expenseAmount">Amount</label>
              <input type="number" id="expenseAmount" required min="0" step="0.01">
            </div>
            <div class="form-group">
              <label for="expenseCategory">Category</label>
              <select id="expenseCategory">
                <option value="housing">Housing</option>
                <option value="transportation">Transportation</option>
                <option value="food">Food</option>
                <option value="utilities">Utilities</option>
                <option value="insurance">Insurance</option>
                <option value="healthcare">Healthcare</option>
                <option value="debt">Debt</option>
                <option value="entertainment">Entertainment</option>
                <option value="education">Education</option>
                <option value="personal">Personal</option>
                <option value="giving">Giving/Tithe</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="expenseDate">Date</label>
              <input type="date" id="expenseDate" required>
            </div>
            <div class="form-group">
              <label for="expenseNotes">Notes (optional)</label>
              <textarea id="expenseNotes" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label for="expenseRecurring">Recurring</label>
              <select id="expenseRecurring">
                <option value="false">No</option>
                <option value="true">Yes</option>
              </select>
            </div>
            <button type="submit">Add Expense</button>
          </form>
          <div id="addExpenseResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Get Expense Entries</h3>
          <form id="getExpensesForm">
            <div class="form-group">
              <label for="getExpensesToken">JWT Token</label>
              <input type="text" id="getExpensesToken" required>
            </div>
            <button type="submit">Get Expense Entries</button>
          </form>
          <div id="getExpensesResponse" class="response"></div>
        </div>
      </div>
      
      <div id="budget-tab" class="tab-content">
        <h2>Budget Management</h2>
        
        <div class="test-panel">
          <h3>Create Budget</h3>
          <form id="createBudgetForm">
            <div class="form-group">
              <label for="budgetToken">JWT Token</label>
              <input type="text" id="budgetToken" required>
            </div>
            <div class="form-group">
              <label for="budgetName">Name</label>
              <input type="text" id="budgetName" required placeholder="e.g. May 2025 Budget">
            </div>
            <div class="form-group">
              <label for="budgetStartDate">Start Date</label>
              <input type="date" id="budgetStartDate" required>
            </div>
            <div class="form-group">
              <label for="budgetEndDate">End Date</label>
              <input type="date" id="budgetEndDate" required>
            </div>
            <div class="form-group">
              <label for="budgetTotalIncome">Total Planned Income</label>
              <input type="number" id="budgetTotalIncome" required min="0" step="0.01">
            </div>
            <div class="form-group">
              <label>Budget Categories</label>
              <div id="budgetCategories">
                <div class="category-row">
                  <input type="text" placeholder="Category" required>
                  <input type="number" placeholder="Amount" required min="0" step="0.01">
                  <button type="button" class="remove-category">Remove</button>
                </div>
              </div>
              <button type="button" id="addCategoryBtn">Add Category</button>
            </div>
            <button type="submit">Create Budget</button>
          </form>
          <div id="createBudgetResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Get Budgets</h3>
          <form id="getBudgetsForm">
            <div class="form-group">
              <label for="getBudgetsToken">JWT Token</label>
              <input type="text" id="getBudgetsToken" required>
            </div>
            <button type="submit">Get Budgets</button>
          </form>
          <div id="getBudgetsResponse" class="response"></div>
        </div>
      </div>
      
      <div id="savings-tab" class="tab-content">
        <h2>Savings Goals</h2>
        
        <div class="test-panel">
          <h3>Create Savings Goal</h3>
          <form id="createSavingsGoalForm">
            <div class="form-group">
              <label for="savingsToken">JWT Token</label>
              <input type="text" id="savingsToken" required>
            </div>
            <div class="form-group">
              <label for="savingsTitle">Title</label>
              <input type="text" id="savingsTitle" required placeholder="e.g. Emergency Fund">
            </div>
            <div class="form-group">
              <label for="savingsTargetAmount">Target Amount</label>
              <input type="number" id="savingsTargetAmount" required min="0" step="0.01">
            </div>
            <div class="form-group">
              <label for="savingsStartDate">Start Date</label>
              <input type="date" id="savingsStartDate" required>
            </div>
            <div class="form-group">
              <label for="savingsTargetDate">Target Date (optional)</label>
              <input type="date" id="savingsTargetDate">
            </div>
            <div class="form-group">
              <label for="savingsCategory">Category</label>
              <select id="savingsCategory">
                <option value="emergency_fund">Emergency Fund</option>
                <option value="retirement">Retirement</option>
                <option value="education">Education</option>
                <option value="home">Home</option>
                <option value="car">Car</option>
                <option value="vacation">Vacation</option>
                <option value="wedding">Wedding</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label for="savingsPriority">Priority</label>
              <select id="savingsPriority">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div class="form-group">
              <label for="savingsDescription">Description (optional)</label>
              <textarea id="savingsDescription" rows="3"></textarea>
            </div>
            <button type="submit">Create Savings Goal</button>
          </form>
          <div id="createSavingsGoalResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Get Savings Goals</h3>
          <form id="getSavingsGoalsForm">
            <div class="form-group">
              <label for="getSavingsGoalsToken">JWT Token</label>
              <input type="text" id="getSavingsGoalsToken" required>
            </div>
            <button type="submit">Get Savings Goals</button>
          </form>
          <div id="getSavingsGoalsResponse" class="response"></div>
        </div>
        
        <div class="test-panel">
          <h3>Add Contribution</h3>
          <form id="addContributionForm">
            <div class="form-group">
              <label for="contributionToken">JWT Token</label>
              <input type="text" id="contributionToken" required>
            </div>
            <div class="form-group">
              <label for="contributionGoalId">Goal ID</label>
              <input type="text" id="contributionGoalId" required>
            </div>
            <div class="form-group">
              <label for="contributionAmount">Amount</label>
              <input type="number" id="contributionAmount" required min="0" step="0.01">
            </div>
            <div class="form-group">
              <label for="contributionDate">Date</label>
              <input type="date" id="contributionDate" required>
            </div>
            <div class="form-group">
              <label for="contributionDescription">Description (optional)</label>
              <textarea id="contributionDescription" rows="2"></textarea>
            </div>
            <button type="submit">Add Contribution</button>
          </form>
          <div id="addContributionResponse" class="response"></div>
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
            
            // Remove token from URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        
        // Add Category Button for Budget Form
        document.getElementById('addCategoryBtn').addEventListener('click', () => {
          const categoriesDiv = document.getElementById('budgetCategories');
          const newRow = document.createElement('div');
          newRow.className = 'category-row';
          newRow.style.marginBottom = '10px';
          newRow.innerHTML = \`
            <input type="text" placeholder="Category" required>
            <input type="number" placeholder="Amount" required min="0" step="0.01">
            <button type="button" class="remove-category">Remove</button>
          \`;
          categoriesDiv.appendChild(newRow);
          
          // Add event listener to the remove button
          newRow.querySelector('.remove-category').addEventListener('click', () => {
            categoriesDiv.removeChild(newRow);
          });
        });
        
        // Add Income Form
        document.getElementById('addIncomeForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('addIncomeResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('incomeToken').value;
          
          try {
            const res = await fetch('/api/incomes', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: document.getElementById('incomeTitle').value,
                amount: parseFloat(document.getElementById('incomeAmount').value),
                category: document.getElementById('incomeCategory').value,
                date: document.getElementById('incomeDate').value,
                notes: document.getElementById('incomeNotes').value,
                recurring: document.getElementById('incomeRecurring').value === 'true'
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Income Entries Form
        document.getElementById('getIncomesForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getIncomesResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('getIncomesToken').value;
          
          try {
            const res = await fetch('/api/incomes', {
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
        
        // Add Expense Form
        document.getElementById('addExpenseForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('addExpenseResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('expenseToken').value;
          
          try {
            const res = await fetch('/api/expenses', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: document.getElementById('expenseTitle').value,
                amount: parseFloat(document.getElementById('expenseAmount').value),
                category: document.getElementById('expenseCategory').value,
                date: document.getElementById('expenseDate').value,
                notes: document.getElementById('expenseNotes').value,
                recurring: document.getElementById('expenseRecurring').value === 'true'
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Expense Entries Form
        document.getElementById('getExpensesForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getExpensesResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('getExpensesToken').value;
          
          try {
            const res = await fetch('/api/expenses', {
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
        
        // Create Budget Form
        document.getElementById('createBudgetForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('createBudgetResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('budgetToken').value;
          
          // Get all category rows
          const categoryRows = document.querySelectorAll('#budgetCategories .category-row');
          const categories = Array.from(categoryRows).map(row => {
            const inputs = row.querySelectorAll('input');
            return {
              name: inputs[0].value,
              plannedAmount: parseFloat(inputs[1].value)
            };
          });
          
          try {
            const res = await fetch('/api/budgets', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                name: document.getElementById('budgetName').value,
                startDate: document.getElementById('budgetStartDate').value,
                endDate: document.getElementById('budgetEndDate').value,
                totalPlannedIncome: parseFloat(document.getElementById('budgetTotalIncome').value),
                categories
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Budgets Form
        document.getElementById('getBudgetsForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getBudgetsResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('getBudgetsToken').value;
          
          try {
            const res = await fetch('/api/budgets', {
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
        
        // Create Savings Goal Form
        document.getElementById('createSavingsGoalForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('createSavingsGoalResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('savingsToken').value;
          
          try {
            const res = await fetch('/api/savings-goals', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                title: document.getElementById('savingsTitle').value,
                targetAmount: parseFloat(document.getElementById('savingsTargetAmount').value),
                startDate: document.getElementById('savingsStartDate').value,
                targetDate: document.getElementById('savingsTargetDate').value || null,
                category: document.getElementById('savingsCategory').value,
                priority: document.getElementById('savingsPriority').value,
                description: document.getElementById('savingsDescription').value
              }),
            });
            
            const data = await res.json();
            response.textContent = JSON.stringify(data, null, 2);
          } catch (error) {
            response.textContent = 'Error: ' + error.message;
          }
        });
        
        // Get Savings Goals Form
        document.getElementById('getSavingsGoalsForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('getSavingsGoalsResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('getSavingsGoalsToken').value;
          
          try {
            const res = await fetch('/api/savings-goals', {
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
        
        // Add Contribution Form
        document.getElementById('addContributionForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          const response = document.getElementById('addContributionResponse');
          response.textContent = 'Sending request...';
          
          const token = document.getElementById('contributionToken').value;
          const goalId = document.getElementById('contributionGoalId').value;
          
          try {
            const res = await fetch('/api/savings-goals/' + goalId + '/contributions', {
              method: 'POST',
              headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                amount: parseFloat(document.getElementById('contributionAmount').value),
                date: document.getElementById('contributionDate').value,
                description: document.getElementById('contributionDescription').value
              })
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
app.use('/api/incomes', incomeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);

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
  console.log(`Financial Service running on port ${PORT}`);
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