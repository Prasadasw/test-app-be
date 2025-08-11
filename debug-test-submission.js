const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testData = {
  testId: 2, // Replace with actual test ID
  submissionId: 1, // Replace with actual submission ID
  answers: [
    {
      question_id: 1,
      selected_option: 'a'
    },
    {
      question_id: 2,
      selected_option: 'b'
    }
  ]
};

async function testStartTest() {
  try {
    console.log('🚀 Testing startTest endpoint...');
    const response = await axios.post(`${BASE_URL}/test-submissions/start/${testData.testId}`, {}, {
      headers: {
        'Authorization': 'Bearer YOUR_STUDENT_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ startTest response:', response.data);
  } catch (error) {
    console.error('❌ startTest error:', error.response?.data || error.message);
  }
}

async function testSubmitTest() {
  try {
    console.log('📝 Testing submitTest endpoint...');
    const response = await axios.post(`${BASE_URL}/test-submissions/submit/${testData.submissionId}`, {
      answers: testData.answers
    }, {
      headers: {
        'Authorization': 'Bearer YOUR_STUDENT_TOKEN_HERE', // Replace with actual token
        'Content-Type': 'application/json'
      }
    });
    console.log('✅ submitTest response:', response.data);
  } catch (error) {
    console.error('❌ submitTest error:', error.response?.data || error.message);
  }
}

async function runTests() {
  console.log('🧪 Running API tests...');
  await testStartTest();
  await testSubmitTest();
  console.log('✅ Tests completed');
}

runTests();
