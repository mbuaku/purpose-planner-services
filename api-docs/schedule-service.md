# Schedule Service API

Base URL: `/api/schedule` (via Gateway) or directly at `http://localhost:3005`

## Endpoints

### Get All Events

Retrieves all events for the authenticated user.

- **URL**: `/events`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (YYYY-MM-DD)
  - `endDate` (optional): End date for filtering (YYYY-MM-DD)
  - `category` (optional): Category for filtering
  - `includeRecurring` (optional): Include recurring events (true/false). Default: true
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "events": [
        {
          "id": "event-id-1",
          "userId": "user-id",
          "title": "Team Meeting",
          "description": "Weekly team sync",
          "startTime": "2023-06-01T14:00:00.000Z",
          "endTime": "2023-06-01T15:00:00.000Z",
          "location": "Conference Room A",
          "category": "work",
          "isRecurring": true,
          "recurringPattern": {
            "frequency": "weekly",
            "interval": 1,
            "daysOfWeek": [4],
            "endDate": "2023-12-31T00:00:00.000Z"
          },
          "isCompleted": false,
          "reminderTime": "2023-06-01T13:45:00.000Z",
          "priority": "medium",
          "attachments": [],
          "createdAt": "2023-05-15T00:00:00.000Z",
          "updatedAt": "2023-05-15T00:00:00.000Z"
        },
        {
          "id": "event-id-2",
          "userId": "user-id",
          "title": "Bible Study",
          "description": "Weekly Bible study group",
          "startTime": "2023-06-02T18:30:00.000Z",
          "endTime": "2023-06-02T20:00:00.000Z",
          "location": "Community Church",
          "category": "spiritual",
          "isRecurring": true,
          "recurringPattern": {
            "frequency": "weekly",
            "interval": 1,
            "daysOfWeek": [5],
            "endDate": null
          },
          "isCompleted": false,
          "reminderTime": "2023-06-02T18:00:00.000Z",
          "priority": "high",
          "attachments": [],
          "createdAt": "2023-05-16T00:00:00.000Z",
          "updatedAt": "2023-05-16T00:00:00.000Z"
        }
      ]
    },
    "message": "Events retrieved successfully"
  }
  ```

### Get Event by ID

Retrieves a specific event by its ID.

- **URL**: `/events/:eventId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `eventId`: ID of the event to retrieve
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "event": {
        "id": "event-id-1",
        "userId": "user-id",
        "title": "Team Meeting",
        "description": "Weekly team sync",
        "startTime": "2023-06-01T14:00:00.000Z",
        "endTime": "2023-06-01T15:00:00.000Z",
        "location": "Conference Room A",
        "category": "work",
        "isRecurring": true,
        "recurringPattern": {
          "frequency": "weekly",
          "interval": 1,
          "daysOfWeek": [4],
          "endDate": "2023-12-31T00:00:00.000Z"
        },
        "isCompleted": false,
        "reminderTime": "2023-06-01T13:45:00.000Z",
        "priority": "medium",
        "attachments": [],
        "createdAt": "2023-05-15T00:00:00.000Z",
        "updatedAt": "2023-05-15T00:00:00.000Z"
      }
    },
    "message": "Event retrieved successfully"
  }
  ```

### Create Event

Creates a new event for the authenticated user.

- **URL**: `/events`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Budget Review",
    "description": "Monthly budget review and planning",
    "startTime": "2023-06-05T10:00:00.000Z",
    "endTime": "2023-06-05T11:00:00.000Z",
    "location": "Home Office",
    "category": "financial",
    "isRecurring": true,
    "recurringPattern": {
      "frequency": "monthly",
      "interval": 1,
      "dayOfMonth": 5,
      "endDate": null
    },
    "reminderTime": "2023-06-05T09:45:00.000Z",
    "priority": "high"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "event": {
        "id": "event-id-3",
        "userId": "user-id",
        "title": "Budget Review",
        "description": "Monthly budget review and planning",
        "startTime": "2023-06-05T10:00:00.000Z",
        "endTime": "2023-06-05T11:00:00.000Z",
        "location": "Home Office",
        "category": "financial",
        "isRecurring": true,
        "recurringPattern": {
          "frequency": "monthly",
          "interval": 1,
          "dayOfMonth": 5,
          "endDate": null
        },
        "isCompleted": false,
        "reminderTime": "2023-06-05T09:45:00.000Z",
        "priority": "high",
        "attachments": [],
        "createdAt": "2023-05-20T00:00:00.000Z",
        "updatedAt": "2023-05-20T00:00:00.000Z"
      }
    },
    "message": "Event created successfully"
  }
  ```

### Update Event

Updates an existing event.

- **URL**: `/events/:eventId`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `eventId`: ID of the event to update
- **Query Parameters**:
  - `updateRecurring` (optional): Update all future recurring instances (true/false). Default: false
- **Request Body**:
  ```json
  {
    "title": "Updated Budget Review",
    "location": "Virtual Meeting",
    "priority": "medium"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "event": {
        "id": "event-id-3",
        "userId": "user-id",
        "title": "Updated Budget Review",
        "description": "Monthly budget review and planning",
        "startTime": "2023-06-05T10:00:00.000Z",
        "endTime": "2023-06-05T11:00:00.000Z",
        "location": "Virtual Meeting",
        "category": "financial",
        "isRecurring": true,
        "recurringPattern": {
          "frequency": "monthly",
          "interval": 1,
          "dayOfMonth": 5,
          "endDate": null
        },
        "isCompleted": false,
        "reminderTime": "2023-06-05T09:45:00.000Z",
        "priority": "medium",
        "attachments": [],
        "updatedAt": "2023-05-21T00:00:00.000Z"
      }
    },
    "message": "Event updated successfully"
  }
  ```

### Mark Event as Completed

Marks an event as completed.

- **URL**: `/events/:eventId/complete`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Parameters**:
  - `eventId`: ID of the event to mark as completed
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "event": {
        "id": "event-id-3",
        "isCompleted": true,
        "updatedAt": "2023-06-05T11:05:00.000Z"
      }
    },
    "message": "Event marked as completed"
  }
  ```

### Delete Event

Deletes an event.

- **URL**: `/events/:eventId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `eventId`: ID of the event to delete
- **Query Parameters**:
  - `deleteRecurring` (optional): Delete all future recurring instances (true/false). Default: false
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Event deleted successfully"
  }
  ```

### Add Attachment to Event

Adds an attachment to an event.

- **URL**: `/events/:eventId/attachments`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content Type**: `multipart/form-data`
- **URL Parameters**:
  - `eventId`: ID of the event to add attachment to
- **Form Parameters**:
  - `attachment`: The file to attach (max 10MB)
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "attachment": {
        "id": "attachment-id-1",
        "filename": "budget_template.xlsx",
        "url": "https://example.com/attachments/budget_template.xlsx",
        "size": 25600,
        "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "uploadedAt": "2023-05-21T10:30:00.000Z"
      }
    },
    "message": "Attachment added successfully"
  }
  ```

### Delete Attachment

Removes an attachment from an event.

- **URL**: `/events/:eventId/attachments/:attachmentId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `eventId`: ID of the event
  - `attachmentId`: ID of the attachment to remove
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Attachment removed successfully"
  }
  ```

### Get Calendar Overview

Retrieves a calendar overview for the specified period.

- **URL**: `/calendar`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `month` (required): Month (1-12)
  - `year` (required): Year (YYYY)
  - `view` (optional): Calendar view (month, week, day). Default: month
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "calendar": {
        "month": 6,
        "year": 2023,
        "days": [
          {
            "date": "2023-06-01",
            "events": [
              {
                "id": "event-id-1",
                "title": "Team Meeting",
                "startTime": "2023-06-01T14:00:00.000Z",
                "endTime": "2023-06-01T15:00:00.000Z",
                "category": "work",
                "isCompleted": false
              }
            ]
          },
          {
            "date": "2023-06-02",
            "events": [
              {
                "id": "event-id-2",
                "title": "Bible Study",
                "startTime": "2023-06-02T18:30:00.000Z",
                "endTime": "2023-06-02T20:00:00.000Z",
                "category": "spiritual",
                "isCompleted": false
              }
            ]
          },
          {
            "date": "2023-06-05",
            "events": [
              {
                "id": "event-id-3",
                "title": "Updated Budget Review",
                "startTime": "2023-06-05T10:00:00.000Z",
                "endTime": "2023-06-05T11:00:00.000Z",
                "category": "financial",
                "isCompleted": false
              }
            ]
          }
        ]
      }
    },
    "message": "Calendar overview retrieved successfully"
  }
  ```

### Get Event Statistics

Retrieves event statistics for the authenticated user.

- **URL**: `/stats`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `period` (optional): Period for statistics (week, month, year). Default: month
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "totalEvents": 25,
        "completedEvents": 18,
        "completionRate": 72,
        "byCategory": {
          "work": 10,
          "spiritual": 8,
          "financial": 5,
          "personal": 2
        },
        "byPriority": {
          "high": 8,
          "medium": 12,
          "low": 5
        }
      }
    },
    "message": "Event statistics retrieved successfully"
  }
  ```