# Profile Service API

Base URL: `/api/profile` (via Gateway) or directly at `http://localhost:3004`

## Endpoints

### Get User Profile

Retrieves the profile of the authenticated user.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "profile": {
        "id": "profile-id",
        "userId": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "birthDate": "1990-01-01T00:00:00.000Z",
        "occupation": "Software Developer",
        "bio": "Passionate about personal growth",
        "location": {
          "city": "New York",
          "state": "NY",
          "country": "USA"
        },
        "profilePicture": "https://example.com/profiles/john.jpg",
        "preferences": {
          "theme": "light",
          "notifications": {
            "email": true,
            "push": true
          },
          "privacySettings": {
            "showFinancialStats": false,
            "showSpiritualJourney": true
          }
        },
        "createdAt": "2023-01-15T00:00:00.000Z",
        "updatedAt": "2023-05-20T00:00:00.000Z"
      }
    },
    "message": "Profile retrieved successfully"
  }
  ```

### Create User Profile

Creates a profile for the authenticated user.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "birthDate": "1990-01-01",
    "occupation": "Software Developer",
    "bio": "Passionate about personal growth",
    "location": {
      "city": "New York",
      "state": "NY",
      "country": "USA"
    }
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "profile": {
        "id": "profile-id",
        "userId": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "birthDate": "1990-01-01T00:00:00.000Z",
        "occupation": "Software Developer",
        "bio": "Passionate about personal growth",
        "location": {
          "city": "New York",
          "state": "NY",
          "country": "USA"
        },
        "profilePicture": null,
        "preferences": {
          "theme": "light",
          "notifications": {
            "email": true,
            "push": true
          },
          "privacySettings": {
            "showFinancialStats": true,
            "showSpiritualJourney": true
          }
        },
        "createdAt": "2023-05-20T00:00:00.000Z",
        "updatedAt": "2023-05-20T00:00:00.000Z"
      }
    },
    "message": "Profile created successfully"
  }
  ```

### Update User Profile

Updates the profile of the authenticated user.

- **URL**: `/`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "firstName": "Johnny",
    "lastName": "Doe",
    "bio": "Updated bio with new information",
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "country": "USA"
    }
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "profile": {
        "id": "profile-id",
        "userId": "user-id",
        "firstName": "Johnny",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "birthDate": "1990-01-01T00:00:00.000Z",
        "occupation": "Software Developer",
        "bio": "Updated bio with new information",
        "location": {
          "city": "San Francisco",
          "state": "CA",
          "country": "USA"
        },
        "profilePicture": "https://example.com/profiles/john.jpg",
        "preferences": {
          "theme": "light",
          "notifications": {
            "email": true,
            "push": true
          },
          "privacySettings": {
            "showFinancialStats": false,
            "showSpiritualJourney": true
          }
        },
        "updatedAt": "2023-05-21T00:00:00.000Z"
      }
    },
    "message": "Profile updated successfully"
  }
  ```

### Upload Profile Picture

Uploads a profile picture for the authenticated user.

- **URL**: `/picture`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content Type**: `multipart/form-data`
- **Form Parameters**:
  - `profilePicture`: The image file to upload (JPEG, PNG, WebP formats supported, max 5MB)
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "profilePicture": "https://example.com/profiles/john_123456.jpg"
    },
    "message": "Profile picture uploaded successfully"
  }
  ```

### Delete Profile Picture

Removes the profile picture of the authenticated user.

- **URL**: `/picture`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Profile picture removed successfully"
  }
  ```

### Update User Preferences

Updates the preferences for the authenticated user.

- **URL**: `/preferences`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "theme": "dark",
    "notifications": {
      "email": false,
      "push": true
    },
    "privacySettings": {
      "showFinancialStats": false,
      "showSpiritualJourney": false
    }
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "preferences": {
        "theme": "dark",
        "notifications": {
          "email": false,
          "push": true
        },
        "privacySettings": {
          "showFinancialStats": false,
          "showSpiritualJourney": false
        }
      }
    },
    "message": "Preferences updated successfully"
  }
  ```

### Get User Stats

Retrieves aggregated statistics for the authenticated user.

- **URL**: `/stats`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `period` (optional): The period for stats calculation (daily, weekly, monthly, yearly, all). Default: monthly
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "stats": {
        "spiritual": {
          "prayerSessions": 15,
          "bibleReadings": 12,
          "journalEntries": 8
        },
        "financial": {
          "budgetAdherence": 92,
          "savingsGoalProgress": 45,
          "expenseCategories": [
            {
              "name": "Housing",
              "percentage": 40
            },
            {
              "name": "Food",
              "percentage": 20
            },
            {
              "name": "Transportation",
              "percentage": 15
            },
            {
              "name": "Other",
              "percentage": 25
            }
          ]
        },
        "schedule": {
          "completedEvents": 28,
          "missedEvents": 3,
          "upcomingEvents": 12
        }
      }
    },
    "message": "User stats retrieved successfully"
  }
  ```

### Export User Data

Exports all user data as a downloadable file.

- **URL**: `/export`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `format` (optional): Export format (json, csv). Default: json
- **Success Response**: 
  - A downloadable file with all user data
  - HTTP Content-Type header will be set to appropriate MIME type
  - HTTP Content-Disposition header will be set to attachment

### Delete User Profile

Deletes the profile of the authenticated user.

- **URL**: `/`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Profile deleted successfully"
  }
  ```