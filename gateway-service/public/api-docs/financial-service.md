# Financial Service API

Base URL: `/api/financial` (via Gateway) or directly at `http://localhost:3002`

## Budget Endpoints

### Get User Budgets

Retrieves all budgets for the current user.

- **URL**: `/budget`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `month` (optional): Month for filtering (1-12)
  - `year` (optional): Year for filtering (YYYY)
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "budgets": [
        {
          "id": "budget-id-1",
          "userId": "user-id",
          "name": "Monthly Budget",
          "amount": 5000,
          "period": "monthly",
          "categories": [
            {
              "name": "Housing",
              "amount": 1500
            },
            {
              "name": "Food",
              "amount": 800
            }
          ],
          "month": 5,
          "year": 2023
        }
      ]
    },
    "message": "Budgets retrieved successfully"
  }
  ```

### Get Budget by ID

Retrieves a specific budget by its ID.

- **URL**: `/budget/:budgetId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `budgetId`: ID of the budget to retrieve
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "budget": {
        "id": "budget-id-1",
        "userId": "user-id",
        "name": "Monthly Budget",
        "amount": 5000,
        "period": "monthly",
        "categories": [
          {
            "name": "Housing",
            "amount": 1500
          },
          {
            "name": "Food",
            "amount": 800
          }
        ],
        "month": 5,
        "year": 2023
      }
    },
    "message": "Budget retrieved successfully"
  }
  ```

### Create Budget

Creates a new budget for the user.

- **URL**: `/budget`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Monthly Budget",
    "amount": 5000,
    "period": "monthly",
    "categories": [
      {
        "name": "Housing",
        "amount": 1500
      },
      {
        "name": "Food",
        "amount": 800
      }
    ],
    "month": 5,
    "year": 2023
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "budget": {
        "id": "budget-id-1",
        "userId": "user-id",
        "name": "Monthly Budget",
        "amount": 5000,
        "period": "monthly",
        "categories": [
          {
            "name": "Housing",
            "amount": 1500
          },
          {
            "name": "Food",
            "amount": 800
          }
        ],
        "month": 5,
        "year": 2023
      }
    },
    "message": "Budget created successfully"
  }
  ```

### Update Budget

Updates an existing budget.

- **URL**: `/budget/:budgetId`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `budgetId`: ID of the budget to update
- **Request Body**:
  ```json
  {
    "name": "Updated Monthly Budget",
    "amount": 5500,
    "categories": [
      {
        "name": "Housing",
        "amount": 1600
      },
      {
        "name": "Food",
        "amount": 900
      }
    ]
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "budget": {
        "id": "budget-id-1",
        "userId": "user-id",
        "name": "Updated Monthly Budget",
        "amount": 5500,
        "period": "monthly",
        "categories": [
          {
            "name": "Housing",
            "amount": 1600
          },
          {
            "name": "Food",
            "amount": 900
          }
        ],
        "month": 5,
        "year": 2023
      }
    },
    "message": "Budget updated successfully"
  }
  ```

### Delete Budget

Deletes a budget.

- **URL**: `/budget/:budgetId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `budgetId`: ID of the budget to delete
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Budget deleted successfully"
  }
  ```

## Expense Endpoints

### Get User Expenses

Retrieves all expenses for the current user.

- **URL**: `/expense`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (YYYY-MM-DD)
  - `endDate` (optional): End date for filtering (YYYY-MM-DD)
  - `category` (optional): Category for filtering
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "expenses": [
        {
          "id": "expense-id-1",
          "userId": "user-id",
          "amount": 75.50,
          "category": "Food",
          "description": "Grocery shopping",
          "date": "2023-05-15T00:00:00.000Z"
        }
      ]
    },
    "message": "Expenses retrieved successfully"
  }
  ```

### Create Expense

Records a new expense.

- **URL**: `/expense`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "amount": 75.50,
    "category": "Food",
    "description": "Grocery shopping",
    "date": "2023-05-15"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "expense": {
        "id": "expense-id-1",
        "userId": "user-id",
        "amount": 75.50,
        "category": "Food",
        "description": "Grocery shopping",
        "date": "2023-05-15T00:00:00.000Z"
      }
    },
    "message": "Expense recorded successfully"
  }
  ```

### Update Expense

Updates an existing expense.

- **URL**: `/expense/:expenseId`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `expenseId`: ID of the expense to update
- **Request Body**:
  ```json
  {
    "amount": 82.75,
    "description": "Grocery shopping (updated)"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "expense": {
        "id": "expense-id-1",
        "userId": "user-id",
        "amount": 82.75,
        "category": "Food",
        "description": "Grocery shopping (updated)",
        "date": "2023-05-15T00:00:00.000Z"
      }
    },
    "message": "Expense updated successfully"
  }
  ```

### Delete Expense

Deletes an expense.

- **URL**: `/expense/:expenseId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `expenseId`: ID of the expense to delete
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Expense deleted successfully"
  }
  ```

## Income Endpoints

### Get User Income

Retrieves all income records for the current user.

- **URL**: `/income`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (YYYY-MM-DD)
  - `endDate` (optional): End date for filtering (YYYY-MM-DD)
  - `source` (optional): Source for filtering
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "income": [
        {
          "id": "income-id-1",
          "userId": "user-id",
          "amount": 3000,
          "source": "Salary",
          "description": "Monthly salary",
          "date": "2023-05-01T00:00:00.000Z"
        }
      ]
    },
    "message": "Income records retrieved successfully"
  }
  ```

### Create Income

Records a new income.

- **URL**: `/income`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "amount": 3000,
    "source": "Salary",
    "description": "Monthly salary",
    "date": "2023-05-01"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "income": {
        "id": "income-id-1",
        "userId": "user-id",
        "amount": 3000,
        "source": "Salary",
        "description": "Monthly salary",
        "date": "2023-05-01T00:00:00.000Z"
      }
    },
    "message": "Income recorded successfully"
  }
  ```

## Savings Goal Endpoints

### Get Savings Goals

Retrieves all savings goals for the current user.

- **URL**: `/savings-goal`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "savingsGoals": [
        {
          "id": "goal-id-1",
          "userId": "user-id",
          "name": "Emergency Fund",
          "targetAmount": 10000,
          "currentAmount": 5000,
          "targetDate": "2023-12-31T00:00:00.000Z",
          "description": "Emergency fund for unexpected expenses"
        }
      ]
    },
    "message": "Savings goals retrieved successfully"
  }
  ```

### Create Savings Goal

Creates a new savings goal.

- **URL**: `/savings-goal`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Emergency Fund",
    "targetAmount": 10000,
    "currentAmount": 5000,
    "targetDate": "2023-12-31",
    "description": "Emergency fund for unexpected expenses"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "savingsGoal": {
        "id": "goal-id-1",
        "userId": "user-id",
        "name": "Emergency Fund",
        "targetAmount": 10000,
        "currentAmount": 5000,
        "targetDate": "2023-12-31T00:00:00.000Z",
        "description": "Emergency fund for unexpected expenses"
      }
    },
    "message": "Savings goal created successfully"
  }
  ```

### Update Savings Goal

Updates an existing savings goal.

- **URL**: `/savings-goal/:goalId`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `goalId`: ID of the savings goal to update
- **Request Body**:
  ```json
  {
    "currentAmount": 6000,
    "targetAmount": 12000
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "savingsGoal": {
        "id": "goal-id-1",
        "userId": "user-id",
        "name": "Emergency Fund",
        "targetAmount": 12000,
        "currentAmount": 6000,
        "targetDate": "2023-12-31T00:00:00.000Z",
        "description": "Emergency fund for unexpected expenses"
      }
    },
    "message": "Savings goal updated successfully"
  }
  ```

### Delete Savings Goal

Deletes a savings goal.

- **URL**: `/savings-goal/:goalId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `goalId`: ID of the savings goal to delete
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Savings goal deleted successfully"
  }
  ```