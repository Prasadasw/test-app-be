# Test Application Backend

A comprehensive backend system for managing student test enrollments, submissions, and result reviews.

## Features

### Student Flow
1. **Test Enrollment Request**: Students can request enrollment to tests
2. **Admin Approval**: Admins approve/reject enrollment requests
3. **Test Access**: Students get access to tests after approval
4. **Test Submission**: Students can start tests, answer questions, and submit
5. **Result Viewing**: Students can view results after admin releases them

### Admin Flow
1. **Enrollment Management**: Review and approve/reject student enrollment requests
2. **Test Submission Review**: Review submitted test answers and score them
3. **Result Release**: Release results to students after review
4. **Statistics**: View submission statistics and performance metrics

## API Endpoints

### Authentication
- `POST /api/students/register` - Student registration
- `POST /api/students/login` - Student login
- `POST /api/admins/login` - Admin login

### Student Routes
- `GET /api/students/profile` - Get student profile with test results
- `POST /api/enrollments/request` - Request test enrollment
- `GET /api/enrollments/my-requests` - Get student's enrollment requests
- `GET /api/enrollments/check-access/:testId` - Check test access
- `GET /api/tests/available` - Get available tests for enrollment

### Test Submission Routes (Student)
- `POST /api/test-submissions/start/:testId` - Start a test
- `POST /api/test-submissions/submit/:submissionId` - Submit test answers
- `GET /api/test-submissions/status/:testId` - Get submission status
- `GET /api/test-submissions/answers/:submissionId` - Get submitted answers (after result release)

### Result Review Routes (Admin)
- `GET /api/result-review/submissions` - Get all submitted tests for review
- `GET /api/result-review/submission/:submissionId` - Get detailed submission for review
- `PUT /api/result-review/review/:submissionId` - Review and score submission
- `PUT /api/result-review/release/:submissionId` - Release result to student
- `GET /api/result-review/stats` - Get submission statistics

### Admin Routes
- `GET /api/admins/profile` - Get admin profile
- `GET /api/enrollments/admin/requests` - Get all enrollment requests
- `PUT /api/enrollments/admin/requests/:enrollmentId` - Update enrollment status

### Test Management
- `POST /api/tests` - Create new test
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get test by ID
- `GET /api/tests/by-program/:programId` - Get tests by program

### Question Management
- `POST /api/questions` - Create new question
- `GET /api/questions/by-test/:testId` - Get questions by test

## Database Models

### Core Models
- **Student**: Student information and authentication
- **Admin**: Admin information and authentication
- **Program**: Educational programs
- **Test**: Test definitions with questions
- **Question**: Individual test questions with options

### New Models
- **TestEnrollment**: Student enrollment requests and approvals
- **TestSubmission**: Student test submissions and results
- **StudentAnswer**: Individual student answers for questions

## Test Submission Flow

1. **Student starts test** (`POST /api/test-submissions/start/:testId`)
   - Creates submission record
   - Returns questions without correct answers
   - Sets status to 'in_progress'

2. **Student submits answers** (`POST /api/test-submissions/submit/:submissionId`)
   - Saves all student answers
   - Updates submission status to 'submitted'
   - Calculates time taken

3. **Admin reviews submission** (`PUT /api/result-review/review/:submissionId`)
   - Reviews each answer
   - Assigns marks and notes
   - Updates status to 'under_review'
   - Calculates total score and percentage

4. **Admin releases result** (`PUT /api/result-review/release/:submissionId`)
   - Updates status to 'result_released'
   - Student can now view their results

5. **Student views results** (`GET /api/test-submissions/answers/:submissionId`)
   - Only accessible after result release
   - Shows questions, answers, correct answers, and scores

## Authentication

The system uses JWT tokens for authentication. Different middleware functions ensure proper access control:

- `authenticateStudent`: Ensures user is a student
- `authenticateAdmin`: Ensures user is an admin
- `authMiddleware`: General authentication for both user types

## Environment Variables

Required environment variables:
- `JWT_SECRET`: Secret key for JWT token generation
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production)

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables in `.env` file
3. Run database migrations: `npm run migrate`
4. Start server: `npm start`

## Database Schema

The system automatically creates the necessary database tables and relationships when the server starts. Make sure your database configuration is correct in `config/config.json`.