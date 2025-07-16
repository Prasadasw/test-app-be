require('dotenv').config();

// Check for required environment variables
if (!process.env.JWT_SECRET) {
  console.error('❌ Fatal Error: JWT_SECRET is not defined in .env file');
  console.log('💡 Please create a .env file with JWT_SECRET and other required variables');
  process.exit(1);
}

const express = require('express');
const cors = require('cors');
const db = require('./models');
const sequelize = db.sequelize;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const adminRoutes = require('./routes/admin.routes');


app.use('/api/admins', adminRoutes);

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
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Database synchronized successfully');
    } catch (syncError) {
      console.error('❌ Error synchronizing database:', syncError);
      throw syncError;
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
    
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('\n❌ Fatal error during server startup:');
    console.error(error);
    process.exit(1);
  }
};

startServer();
