const jwt = require('jsonwebtoken');

// Test the JWT token from the user
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTEsIm1vYmlsZSI6IjcwMjA3Mjc4NTQiLCJpYXQiOjE3NTQ4MjU1NDUsImV4cCI6MTc1NzQxNzU0NX0.1U9_HZL2bZomGguqkZq8ki9LnCepM4kNlVRFmJ9x2Zw';

console.log('🔍 Testing JWT token...');
console.log('Token:', testToken);

try {
  // Decode without verification first to see the payload
  const decoded = jwt.decode(testToken);
  console.log('📋 Decoded payload:', decoded);
  
  // Check if we have JWT_SECRET
  if (process.env.JWT_SECRET) {
    console.log('✅ JWT_SECRET is available');
    
    // Verify the token
    const verified = jwt.verify(testToken, process.env.JWT_SECRET);
    console.log('✅ Token verified successfully:', verified);
  } else {
    console.log('❌ JWT_SECRET is not available');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
