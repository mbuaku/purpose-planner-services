# Spiritual Service API

Base URL: `/api/spiritual` (via Gateway) or directly at `http://localhost:3003`

## Bible Reading Endpoints

### Get Reading Plans

Retrieves all available Bible reading plans.

- **URL**: `/bible-reading/plans`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "plans": [
        {
          "id": "plan-id-1",
          "title": "One Year Bible",
          "description": "Read through the entire Bible in one year",
          "duration": 365,
          "category": "full",
          "readings": [
            {
              "day": 1,
              "passages": ["Genesis 1-3", "Matthew 1"]
            },
            {
              "day": 2,
              "passages": ["Genesis 4-6", "Matthew 2"]
            }
          ]
        },
        {
          "id": "plan-id-2",
          "title": "New Testament in 90 Days",
          "description": "Read through the New Testament in 90 days",
          "duration": 90,
          "category": "new-testament",
          "readings": [
            {
              "day": 1,
              "passages": ["Matthew 1-4"]
            },
            {
              "day": 2,
              "passages": ["Matthew 5-7"]
            }
          ]
        }
      ]
    },
    "message": "Reading plans retrieved successfully"
  }
  ```

### Get User Reading Progress

Retrieves the user's Bible reading progress.

- **URL**: `/bible-reading/progress`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `planId` (optional): ID of the specific plan
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "progress": {
        "planId": "plan-id-1",
        "planTitle": "One Year Bible",
        "startDate": "2023-01-01T00:00:00.000Z",
        "currentDay": 140,
        "completedReadings": 138,
        "onTrack": true,
        "lastCompletedDate": "2023-05-19T00:00:00.000Z",
        "upcomingReadings": [
          {
            "day": 141,
            "date": "2023-05-21T00:00:00.000Z",
            "passages": ["Deuteronomy 11-13", "Mark 14:1-26"]
          },
          {
            "day": 142,
            "date": "2023-05-22T00:00:00.000Z",
            "passages": ["Deuteronomy 14-16", "Mark 14:27-53"]
          }
        ]
      }
    },
    "message": "Reading progress retrieved successfully"
  }
  ```

### Start Reading Plan

Starts a new Bible reading plan for the user.

- **URL**: `/bible-reading/plans/:planId/start`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Parameters**:
  - `planId`: ID of the reading plan to start
- **Request Body**:
  ```json
  {
    "startDate": "2023-05-21"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "plan": {
        "id": "plan-id-2",
        "title": "New Testament in 90 Days",
        "startDate": "2023-05-21T00:00:00.000Z",
        "currentDay": 1,
        "todaysReadings": ["Matthew 1-4"]
      }
    },
    "message": "Reading plan started successfully"
  }
  ```

### Log Completed Reading

Logs a completed Bible reading.

- **URL**: `/bible-reading/log`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "planId": "plan-id-1",
    "day": 140,
    "passages": ["Deuteronomy 8-10", "Mark 13:14-37"],
    "notes": "Reflected on the importance of remembering God's faithfulness",
    "dateCompleted": "2023-05-20"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "reading": {
        "id": "reading-id-1",
        "userId": "user-id",
        "planId": "plan-id-1",
        "day": 140,
        "passages": ["Deuteronomy 8-10", "Mark 13:14-37"],
        "notes": "Reflected on the importance of remembering God's faithfulness",
        "dateCompleted": "2023-05-20T00:00:00.000Z"
      }
    },
    "message": "Reading logged successfully"
  }
  ```

### Get Reading History

Retrieves the user's Bible reading history.

- **URL**: `/bible-reading/history`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (YYYY-MM-DD)
  - `endDate` (optional): End date for filtering (YYYY-MM-DD)
  - `planId` (optional): ID of the specific plan
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "history": [
        {
          "id": "reading-id-1",
          "userId": "user-id",
          "planId": "plan-id-1",
          "planTitle": "One Year Bible",
          "day": 140,
          "passages": ["Deuteronomy 8-10", "Mark 13:14-37"],
          "notes": "Reflected on the importance of remembering God's faithfulness",
          "dateCompleted": "2023-05-20T00:00:00.000Z"
        },
        {
          "id": "reading-id-2",
          "userId": "user-id",
          "planId": "plan-id-1",
          "planTitle": "One Year Bible",
          "day": 139,
          "passages": ["Deuteronomy 5-7", "Mark 12:28-44"],
          "notes": "",
          "dateCompleted": "2023-05-19T00:00:00.000Z"
        }
      ]
    },
    "message": "Reading history retrieved successfully"
  }
  ```

## Prayer Endpoints

### Get User Prayers

Retrieves all prayers for the authenticated user.

- **URL**: `/prayers`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `category` (optional): Category for filtering
  - `status` (optional): Status for filtering (active, answered)
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "prayers": [
        {
          "id": "prayer-id-1",
          "userId": "user-id",
          "title": "Wisdom for Career Decision",
          "description": "Seeking God's guidance for a potential job change",
          "category": "career",
          "isAnswered": false,
          "dateCreated": "2023-05-10T00:00:00.000Z",
          "lastPrayedFor": "2023-05-20T00:00:00.000Z",
          "timesPrayedFor": 5,
          "answerNotes": null,
          "dateAnswered": null,
          "reminderFrequency": "daily"
        },
        {
          "id": "prayer-id-2",
          "userId": "user-id",
          "title": "Uncle John's Health",
          "description": "Praying for healing after his surgery",
          "category": "health",
          "isAnswered": true,
          "dateCreated": "2023-04-15T00:00:00.000Z",
          "lastPrayedFor": "2023-05-18T00:00:00.000Z",
          "timesPrayedFor": 18,
          "answerNotes": "Surgery was successful, doctor reports full recovery expected",
          "dateAnswered": "2023-05-18T00:00:00.000Z",
          "reminderFrequency": null
        }
      ]
    },
    "message": "Prayers retrieved successfully"
  }
  ```

### Create Prayer

Creates a new prayer request.

- **URL**: `/prayers`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Financial Provision",
    "description": "Praying for wisdom and provision for upcoming expenses",
    "category": "financial",
    "reminderFrequency": "weekly"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "prayer": {
        "id": "prayer-id-3",
        "userId": "user-id",
        "title": "Financial Provision",
        "description": "Praying for wisdom and provision for upcoming expenses",
        "category": "financial",
        "isAnswered": false,
        "dateCreated": "2023-05-21T00:00:00.000Z",
        "lastPrayedFor": null,
        "timesPrayedFor": 0,
        "answerNotes": null,
        "dateAnswered": null,
        "reminderFrequency": "weekly"
      }
    },
    "message": "Prayer created successfully"
  }
  ```

### Update Prayer

Updates an existing prayer.

- **URL**: `/prayers/:prayerId`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `prayerId`: ID of the prayer to update
- **Request Body**:
  ```json
  {
    "title": "Financial Wisdom and Provision",
    "description": "Seeking God's guidance for financial stewardship and provision for upcoming expenses",
    "category": "financial"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "prayer": {
        "id": "prayer-id-3",
        "userId": "user-id",
        "title": "Financial Wisdom and Provision",
        "description": "Seeking God's guidance for financial stewardship and provision for upcoming expenses",
        "category": "financial",
        "isAnswered": false,
        "dateCreated": "2023-05-21T00:00:00.000Z",
        "lastPrayedFor": null,
        "timesPrayedFor": 0,
        "answerNotes": null,
        "dateAnswered": null,
        "reminderFrequency": "weekly",
        "updatedAt": "2023-05-21T01:30:00.000Z"
      }
    },
    "message": "Prayer updated successfully"
  }
  ```

### Log Prayer Time

Logs a prayer session for a specific prayer.

- **URL**: `/prayers/:prayerId/log`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Parameters**:
  - `prayerId`: ID of the prayer
- **Request Body**:
  ```json
  {
    "notes": "Feeling peace about this situation after praying",
    "date": "2023-05-21",
    "duration": 10
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "prayer": {
        "id": "prayer-id-3",
        "lastPrayedFor": "2023-05-21T00:00:00.000Z",
        "timesPrayedFor": 1
      }
    },
    "message": "Prayer time logged successfully"
  }
  ```

### Mark Prayer as Answered

Marks a prayer as answered.

- **URL**: `/prayers/:prayerId/answer`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Parameters**:
  - `prayerId`: ID of the prayer to mark as answered
- **Request Body**:
  ```json
  {
    "answerNotes": "God provided wisdom through a conversation with a mentor and a timely tax refund",
    "dateAnswered": "2023-05-22"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "prayer": {
        "id": "prayer-id-3",
        "isAnswered": true,
        "answerNotes": "God provided wisdom through a conversation with a mentor and a timely tax refund",
        "dateAnswered": "2023-05-22T00:00:00.000Z"
      }
    },
    "message": "Prayer marked as answered"
  }
  ```

### Delete Prayer

Deletes a prayer.

- **URL**: `/prayers/:prayerId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `prayerId`: ID of the prayer to delete
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Prayer deleted successfully"
  }
  ```

## Prayer Session Endpoints

### Get Prayer Sessions

Retrieves all prayer sessions for the authenticated user.

- **URL**: `/prayer-sessions`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (YYYY-MM-DD)
  - `endDate` (optional): End date for filtering (YYYY-MM-DD)
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "sessions": [
        {
          "id": "session-id-1",
          "userId": "user-id",
          "title": "Morning Prayer",
          "description": "Daily morning devotional time",
          "date": "2023-05-21T06:00:00.000Z",
          "duration": 30,
          "prayersIncluded": ["prayer-id-1", "prayer-id-3"],
          "notes": "Focused on surrender and trust today",
          "location": "Home",
          "scriptureReferences": ["Psalm 5", "Proverbs 3:5-6"]
        },
        {
          "id": "session-id-2",
          "userId": "user-id",
          "title": "Evening Reflection",
          "description": "Bedtime prayer",
          "date": "2023-05-20T22:00:00.000Z",
          "duration": 15,
          "prayersIncluded": ["prayer-id-1", "prayer-id-2"],
          "notes": "Grateful for God's provision today",
          "location": "Home",
          "scriptureReferences": ["Psalm 23"]
        }
      ]
    },
    "message": "Prayer sessions retrieved successfully"
  }
  ```

### Create Prayer Session

Records a new prayer session.

- **URL**: `/prayer-sessions`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Lunch Break Prayer",
    "description": "Quick midday reflection",
    "date": "2023-05-21T12:30:00.000Z",
    "duration": 10,
    "prayersIncluded": ["prayer-id-1", "prayer-id-3"],
    "notes": "Focused on work challenges and seeking wisdom",
    "location": "Office",
    "scriptureReferences": ["James 1:5"]
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "session": {
        "id": "session-id-3",
        "userId": "user-id",
        "title": "Lunch Break Prayer",
        "description": "Quick midday reflection",
        "date": "2023-05-21T12:30:00.000Z",
        "duration": 10,
        "prayersIncluded": ["prayer-id-1", "prayer-id-3"],
        "notes": "Focused on work challenges and seeking wisdom",
        "location": "Office",
        "scriptureReferences": ["James 1:5"],
        "createdAt": "2023-05-21T12:40:00.000Z"
      }
    },
    "message": "Prayer session recorded successfully"
  }
  ```

### Get Prayer Insights

Retrieves prayer statistics and insights for the authenticated user.

- **URL**: `/prayer-insights`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `period` (optional): Period for statistics (week, month, year, all). Default: month
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "insights": {
        "totalMinutesPraying": 480,
        "totalSessions": 22,
        "totalPrayers": 15,
        "answeredPrayers": 4,
        "topCategories": [
          {
            "category": "family",
            "count": 5
          },
          {
            "category": "personal growth",
            "count": 4
          },
          {
            "category": "financial",
            "count": 3
          }
        ],
        "weeklyTrend": [
          {
            "week": "2023-W18",
            "sessions": 5,
            "minutes": 95
          },
          {
            "week": "2023-W19",
            "sessions": 6,
            "minutes": 125
          },
          {
            "week": "2023-W20",
            "sessions": 7,
            "minutes": 160
          },
          {
            "week": "2023-W21",
            "sessions": 4,
            "minutes": 100
          }
        ]
      }
    },
    "message": "Prayer insights retrieved successfully"
  }
  ```

## Journal Endpoints

### Get Journal Entries

Retrieves all journal entries for the authenticated user.

- **URL**: `/journal`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `startDate` (optional): Start date for filtering (YYYY-MM-DD)
  - `endDate` (optional): End date for filtering (YYYY-MM-DD)
  - `tags` (optional): Comma-separated tags for filtering
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "entries": [
        {
          "id": "entry-id-1",
          "userId": "user-id",
          "title": "Morning Reflections",
          "content": "Today I was struck by the passage in Psalms...",
          "date": "2023-05-21T00:00:00.000Z",
          "tags": ["gratitude", "scripture", "morning"],
          "scriptureReferences": ["Psalm 34:4-7"],
          "mood": "peaceful",
          "createdAt": "2023-05-21T06:30:00.000Z",
          "updatedAt": "2023-05-21T06:30:00.000Z"
        },
        {
          "id": "entry-id-2",
          "userId": "user-id",
          "title": "Struggles with Patience",
          "content": "I found myself getting frustrated today when...",
          "date": "2023-05-20T00:00:00.000Z",
          "tags": ["growth", "challenges", "patience"],
          "scriptureReferences": ["James 1:2-4"],
          "mood": "reflective",
          "createdAt": "2023-05-20T21:45:00.000Z",
          "updatedAt": "2023-05-20T21:45:00.000Z"
        }
      ]
    },
    "message": "Journal entries retrieved successfully"
  }
  ```

### Get Journal Entry

Retrieves a specific journal entry by its ID.

- **URL**: `/journal/:entryId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `entryId`: ID of the journal entry to retrieve
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "entry": {
        "id": "entry-id-1",
        "userId": "user-id",
        "title": "Morning Reflections",
        "content": "Today I was struck by the passage in Psalms...",
        "date": "2023-05-21T00:00:00.000Z",
        "tags": ["gratitude", "scripture", "morning"],
        "scriptureReferences": ["Psalm 34:4-7"],
        "mood": "peaceful",
        "createdAt": "2023-05-21T06:30:00.000Z",
        "updatedAt": "2023-05-21T06:30:00.000Z"
      }
    },
    "message": "Journal entry retrieved successfully"
  }
  ```

### Create Journal Entry

Creates a new journal entry.

- **URL**: `/journal`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "title": "Weekly Reflection",
    "content": "As I look back on this week, I'm reminded of God's faithfulness in several areas...",
    "date": "2023-05-21",
    "tags": ["weekly", "gratitude", "reflection"],
    "scriptureReferences": ["Lamentations 3:22-24", "Psalm 103:1-5"],
    "mood": "grateful"
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "entry": {
        "id": "entry-id-3",
        "userId": "user-id",
        "title": "Weekly Reflection",
        "content": "As I look back on this week, I'm reminded of God's faithfulness in several areas...",
        "date": "2023-05-21T00:00:00.000Z",
        "tags": ["weekly", "gratitude", "reflection"],
        "scriptureReferences": ["Lamentations 3:22-24", "Psalm 103:1-5"],
        "mood": "grateful",
        "createdAt": "2023-05-21T15:20:00.000Z",
        "updatedAt": "2023-05-21T15:20:00.000Z"
      }
    },
    "message": "Journal entry created successfully"
  }
  ```

### Update Journal Entry

Updates an existing journal entry.

- **URL**: `/journal/:entryId`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `entryId`: ID of the journal entry to update
- **Request Body**:
  ```json
  {
    "title": "Weekly Reflection and Prayer",
    "content": "As I look back on this week, I'm reminded of God's faithfulness in several areas...\n\nAdding a prayer of gratitude: Lord, thank you for...",
    "tags": ["weekly", "gratitude", "reflection", "prayer"]
  }
  ```
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "entry": {
        "id": "entry-id-3",
        "userId": "user-id",
        "title": "Weekly Reflection and Prayer",
        "content": "As I look back on this week, I'm reminded of God's faithfulness in several areas...\n\nAdding a prayer of gratitude: Lord, thank you for...",
        "date": "2023-05-21T00:00:00.000Z",
        "tags": ["weekly", "gratitude", "reflection", "prayer"],
        "scriptureReferences": ["Lamentations 3:22-24", "Psalm 103:1-5"],
        "mood": "grateful",
        "updatedAt": "2023-05-21T15:45:00.000Z"
      }
    },
    "message": "Journal entry updated successfully"
  }
  ```

### Delete Journal Entry

Deletes a journal entry.

- **URL**: `/journal/:entryId`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `entryId`: ID of the journal entry to delete
- **Success Response**: 
  ```json
  {
    "success": true,
    "message": "Journal entry deleted successfully"
  }
  ```

### Get Journal Tags

Retrieves all tags used in the user's journal entries.

- **URL**: `/journal/tags`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "tags": [
        {
          "name": "gratitude",
          "count": 12
        },
        {
          "name": "scripture",
          "count": 8
        },
        {
          "name": "prayer",
          "count": 7
        },
        {
          "name": "challenges",
          "count": 5
        },
        {
          "name": "growth",
          "count": 5
        }
      ]
    },
    "message": "Journal tags retrieved successfully"
  }
  ```

### Get Journal Insights

Retrieves journal statistics and insights for the authenticated user.

- **URL**: `/journal/insights`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `period` (optional): Period for insights (month, quarter, year). Default: month
- **Success Response**: 
  ```json
  {
    "success": true,
    "data": {
      "insights": {
        "totalEntries": 42,
        "entriesThisPeriod": 8,
        "topTags": [
          {
            "tag": "gratitude",
            "count": 12
          },
          {
            "tag": "scripture",
            "count": 8
          },
          {
            "tag": "prayer",
            "count": 7
          }
        ],
        "topScriptures": [
          {
            "reference": "Psalms",
            "count": 15
          },
          {
            "reference": "Proverbs",
            "count": 8
          },
          {
            "reference": "Romans",
            "count": 6
          }
        ],
        "moodTrends": [
          {
            "mood": "grateful",
            "count": 14
          },
          {
            "mood": "peaceful",
            "count": 10
          },
          {
            "mood": "reflective",
            "count": 8
          }
        ],
        "journalingStreak": 5,
        "longestStreak": 14
      }
    },
    "message": "Journal insights retrieved successfully"
  }
  ```