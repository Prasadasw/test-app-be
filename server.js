require('dotenv').config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ Fatal Error: JWT_SECRET is not defined in .env file');
  console.log('💡 Please create a .env file with JWT_SECRET and other required variables');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./models');
const sequelize = db.sequelize;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`);
  console.log('📱 Headers:', req.headers);
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Handle text/plain content type and parse as JSON (React Native fix)
app.use((req, res, next) => {
  if (req.headers['content-type'] === 'text/plain;charset=UTF-8' && req.method === 'POST') {
    console.log('🔧 Converting text/plain to JSON parsing...');
    let data = '';
    req.setEncoding('utf8');
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        req.body = JSON.parse(data);
        console.log('✅ Successfully parsed text/plain as JSON:', req.body);
        next();
      } catch (error) {
        console.error('❌ Failed to parse text/plain as JSON:', error);
        next();
      }
    });
  } else {
    next();
  }
});

// Debug middleware to check if body was parsed
app.use((req, res, next) => {
  console.log('🔍 Body after parsing:', req.body);
  next();
});

// Serve static files from the public directory
app.use('/public', express.static(path.join(__dirname, 'public')));

// Serve uploaded files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const adminRoutes = require('./routes/admin.routes');
const programRoutes = require('./routes/program.routes');
const testRoutes = require('./routes/test.routes');
const questionRoutes = require('./routes/question.routes');
const studentRoutes = require('./routes/student.routes');
const enrollmentRoutes = require('./routes/enrollment.routes');
// Admin routes
app.use('/api/admins', adminRoutes);

app.use('/api/students', studentRoutes);


// Program routes
app.use('/api/programs', programRoutes);

app.use('/api/tests', testRoutes);

app.use('/api/questions', questionRoutes);

app.use('/api/enrollments', enrollmentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Admin API' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();    
    try {
      // Disable alter and force sync in production
      const syncOptions = {
        force: false,
        alter: process.env.NODE_ENV !== 'production' // Only alter in non-production
      };
      
      await sequelize.sync(syncOptions);
      console.log('✅ Database synchronized successfully');
    } catch (syncError) {
      console.error('❌ Error synchronizing database:', syncError);
      // Don't exit in development to allow manual fixes
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }
    }
    
    const modelNames = Object.keys(db)
      .filter(modelName => 
        modelName !== 'sequelize' && 
        modelName !== 'Sequelize' && 
        typeof db[modelName] === 'object' && 
        db[modelName] !== null
      );
    
    if (modelNames.length === 0) {
    } else {
      modelNames.forEach(modelName => {
        console.log(`- ${modelName}`);
      });
    }
    
    const server = app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    });

    // Store server reference for unhandled rejections
    process.server = server;
  } catch (error) {
    console.error('\n❌ Fatal error during server startup:');
    console.error(error);
    process.exit(1);
  }
};

startServer();
