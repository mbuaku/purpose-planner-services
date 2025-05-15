# Dashboard Service API

Base URL: `/api/dashboard` (via Gateway) or directly at `http://localhost:3006`

## Endpoints

### Get User Dashboard

Retrieves the user's dashboard configuration and data.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "dashboard": {
        "id": "dashboard-id",
        "userId": "user-id",
        "title": "My Dashboard",
        "widgets": [
          {
            "id": "widget-id-1",
            "type": "financial-summary",
            "position": {
              "row": 0,
              "column": 0
            },
            "size": {
              "width": 2,
              "height": 1
            },
            "config": {}
          }
        ]
      }
    },
    "message": "Dashboard retrieved successfully"
  }
  ```

### Create Dashboard

Creates a new dashboard for the user.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "My Dashboard",
    "widgets": []
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "dashboard": {
        "id": "dashboard-id",
        "userId": "user-id",
        "title": "My Dashboard",
        "widgets": []
      }
    },
    "message": "Dashboard created successfully"
  }
  ```

### Update Dashboard

Updates a user's dashboard configuration.

- **URL**: `/`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Updated Dashboard Title",
    "widgets": [
      {
        "id": "widget-id-1",
        "type": "financial-summary",
        "position": {
          "row": 1,
          "column": 0
        },
        "size": {
          "width": 2,
          "height": 1
        },
        "config": {}
      }
    ]
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "dashboard": {
        "id": "dashboard-id",
        "userId": "user-id",
        "title": "Updated Dashboard Title",
        "widgets": [
          {
            "id": "widget-id-1",
            "type": "financial-summary",
            "position": {
              "row": 1,
              "column": 0
            },
            "size": {
              "width": 2,
              "height": 1
            },
            "config": {}
          }
        ]
      }
    },
    "message": "Dashboard updated successfully"
  }
  ```

### Add Widget

Adds a new widget to the user's dashboard.

- **URL**: `/widget`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "type": "spiritual-tracker",
    "position": {
      "row": 2,
      "column": 1
    },
    "size": {
      "width": 1,
      "height": 1
    },
    "config": {
      "showPrayers": true,
      "showReadings": true
    }
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "widget": {
        "id": "widget-id-2",
        "type": "spiritual-tracker",
        "position": {
          "row": 2,
          "column": 1
        },
        "size": {
          "width": 1,
          "height": 1
        },
        "config": {
          "showPrayers": true,
          "showReadings": true
        }
      }
    },
    "message": "Widget added successfully"
  }
  ```

### Update Widget

Updates an existing widget on the user's dashboard.

- **URL**: `/widget/:widgetId`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `widgetId`: ID of the widget to update
- **Request Body**:
  ```json
  {
    "position": {
      "row": 1,
      "column": 1
    },
    "size": {
      "width": 2,
      "height": 1
    },
    "config": {
      "showPrayers": false,
      "showReadings": true
    }
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "widget": {
        "id": "widget-id-2",
        "type": "spiritual-tracker",
        "position": {
          "row": 1,
          "column": 1
        },
        "size": {
          "width": 2,
          "height": 1
        },
        "config": {
          "showPrayers": false,
          "showReadings": true
        }
      }
    },
    "message": "Widget updated successfully"
  }
  ```

### Delete Widget

Removes a widget from the user's dashboard.

- **URL**: `/widget/:widgetId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `widgetId`: ID of the widget to delete
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Widget deleted successfully"
  }
  ```