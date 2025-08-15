# Test Completion and Results API Documentation

## Overview
This document describes the APIs available for tracking test completion and displaying test results in the test application.

## Base URL
```
http://localhost:5000/api
```

## Authentication
- **Student APIs**: Require `authenticateStudent` middleware
- **Admin APIs**: Require `authenticateAdmin` middleware
- Include JWT token in Authorization header: `Bearer <token>`

---

## 1. Student Test Completion APIs

### 1.1 Get Students Who Have Completed Tests
**Admin Access Only**

```http
GET /students/completed-tests
```

**Query Parameters:**
- `test_id` (optional): Filter by specific test ID
- `program_id` (optional): Filter by program ID
- `status` (optional): Filter by submission status (`submitted`, `under_review`, `result_released`)

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": [
    {
      "student": {
        "id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "mobile": "1234567890",
        "qualification": "B.Tech"
      },
      "completed_tests": [
        {
          "test_id": 1,
          "test_title": "JavaScript Basics",
          "program_name": "Web Development",
          "submission_id": 5,
          "status": "result_released",
          "submitted_at": "2024-01-15T10:30:00Z",
          "total_score": 85,
          "max_score": 100,
          "percentage": 85.0,
          "time_taken": 45
        }
      ]
    }
  ]
}
```

### 1.2 Get Student's Test Completion Summary
**Admin Access Only**

```http
GET /students/{studentId}/test-summary
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_completed_tests": 3,
    "tests_by_status": {
      "submitted": 1,
      "under_review": 0,
      "result_released": 2
    },
    "average_score": 82.5,
    "average_percentage": 82.5,
    "completed_tests": [
      {
        "test_id": 1,
        "test_title": "JavaScript Basics",
        "program_name": "Web Development",
        "submission_id": 5,
        "status": "result_released",
        "submitted_at": "2024-01-15T10:30:00Z",
        "total_score": 85,
        "max_score": 100,
        "percentage": 85.0,
        "time_taken": 45
      }
    ]
  }
}
```

---

## 2. Test Result APIs (Student Access)

### 2.1 Get All My Test Results
**Student Access Only**

```http
GET /test-submissions/my-results
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 5,
      "test_title": "JavaScript Basics",
      "score": 85,
      "total_marks": 100,
      "percentage": 85.0,
      "status": "released",
      "submitted_at": "2024-01-15T10:30:00Z",
      "reviewed_at": "2024-01-16T09:00:00Z"
    }
  ]
}
```

### 2.2 Get Detailed Test Result
**Student Access Only**

```http
GET /test-submissions/result/{submissionId}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submission_id": 5,
    "test": {
      "id": 1,
      "title": "JavaScript Basics",
      "description": "Test your JavaScript knowledge",
      "total_marks": 100,
      "duration": 60
    },
    "performance": {
      "total_score": 85,
      "max_score": 100,
      "percentage": 85.0,
      "total_questions": 20,
      "correct_answers": 17,
      "incorrect_answers": 3,
      "accuracy": 85.0
    },
    "timing": {
      "started_at": "2024-01-15T09:45:00Z",
      "submitted_at": "2024-01-15T10:30:00Z",
      "time_taken": 45
    },
    "answers": [
      {
        "question_id": 1,
        "question": {
          "id": 1,
          "question_text": "What is JavaScript?",
          "option_a": "A programming language",
          "option_b": "A markup language",
          "option_c": "A styling language",
          "option_d": "A database",
          "correct_option": "A",
          "marks": 5
        },
        "selected_option": "A",
        "correct_option": "A",
        "is_correct": true,
        "marks_obtained": 5,
        "max_marks": 5
      }
    ]
  }
}
```

### 2.3 Get Performance Analytics
**Student Access Only**

```http
GET /test-submissions/analytics
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_tests": 3,
    "average_score": 82.5,
    "average_percentage": 82.5,
    "best_performance": {
      "test_title": "JavaScript Basics",
      "score": 85,
      "percentage": 85.0,
      "submitted_at": "2024-01-15T10:30:00Z"
    },
    "recent_performance": [
      {
        "test_title": "JavaScript Basics",
        "score": 85,
        "percentage": 85.0,
        "submitted_at": "2024-01-15T10:30:00Z"
      }
    ],
    "performance_trend": [
      {
        "month": "2024-01",
        "average_percentage": 82.5
      }
    ]
  }
}
```

---

## 3. Admin Result Review APIs

### 3.1 Get All Submitted Tests for Review
**Admin Access Only**

```http
GET /result-review/submissions
```

**Query Parameters:**
- `status` (optional): Filter by status (`submitted`, `under_review`, `result_released`)
- `test_id` (optional): Filter by test ID
- `program_id` (optional): Filter by program ID
- `student_id` (optional): Filter by student ID

### 3.2 Get Detailed Submission for Review
**Admin Access Only**

```http
GET /result-review/submission/{submissionId}
```

### 3.3 Review and Score Submission
**Admin Access Only**

```http
PUT /result-review/review/{submissionId}
```

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "marks_obtained": 5,
      "admin_notes": "Excellent answer"
    }
  ],
  "admin_notes": "Overall good performance",
  "total_score": 85
}
```

### 3.4 Release Result to Student
**Admin Access Only**

```http
PUT /result-review/release/{submissionId}
```

**Request Body:**
```json
{
  "admin_notes": "Result released successfully"
}
```

### 3.5 Get Submission Statistics
**Admin Access Only**

```http
GET /result-review/stats
```

**Query Parameters:**
- `test_id` (optional): Filter by test ID
- `program_id` (optional): Filter by program ID

---

## 4. Test Submission Status APIs

### 4.1 Get Submission Status
**Student Access Only**

```http
GET /test-submissions/status/{testId}
```

### 4.2 Get Submitted Answers (After Result Release)
**Student Access Only**

```http
GET /test-submissions/answers/{submissionId}
```

---

## 5. Test Management APIs

### 5.1 Start a Test
**Student Access Only**

```http
POST /test-submissions/start/{testId}
```

### 5.2 Submit Test Answers
**Student Access Only**

```http
POST /test-submissions/submit/{submissionId}
```

**Request Body:**
```json
{
  "answers": [
    {
      "question_id": 1,
      "selected_option": "A"
    }
  ]
}
```

---

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

Common HTTP Status Codes:
- `200`: Success
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

---

## Usage Examples

### Frontend Integration Examples

#### 1. Display Student's Test Results
```javascript
// Get all results
const response = await fetch('/api/test-submissions/my-results', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const results = await response.json();

// Display results in UI
results.data.forEach(result => {
  console.log(`${result.test_title}: ${result.percentage}%`);
});
```

#### 2. Show Detailed Result
```javascript
// Get detailed result for a specific submission
const response = await fetch(`/api/test-submissions/result/${submissionId}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const result = await response.json();

// Display detailed performance
console.log(`Score: ${result.data.performance.total_score}/${result.data.performance.max_score}`);
console.log(`Accuracy: ${result.data.performance.accuracy}%`);
```

#### 3. Admin Dashboard - Students with Completed Tests
```javascript
// Get students who completed tests
const response = await fetch('/api/students/completed-tests?status=result_released', {
  headers: {
    'Authorization': `Bearer ${adminToken}`
  }
});
const data = await response.json();

// Display in admin dashboard
data.data.forEach(student => {
  console.log(`${student.student.first_name} completed ${student.completed_tests.length} tests`);
});
```

---

## Notes

1. **Result Release**: Students can only see detailed results after admins release them
2. **Authentication**: All APIs require proper authentication tokens
3. **Status Flow**: `in_progress` → `submitted` → `under_review` → `result_released`
4. **Performance**: Analytics are calculated only for released results
5. **Security**: Students can only access their own data, admins can access all data
