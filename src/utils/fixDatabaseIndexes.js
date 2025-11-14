const mongoose = require('mongoose');
const connectDB = require('../config/database');
require('dotenv').config();

const fixIndexes = async () => {
  try {
    await connectDB();
    
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');
    
    // Get all indexes
    const indexes = await usersCollection.indexes();
    console.log('Current indexes on users collection:', indexes);
    
    // Check if phone_1 index exists
    const phoneIndex = indexes.find(idx => idx.name === 'phone_1');
    
    if (phoneIndex) {
      console.log('Found phone_1 index, dropping it...');
      await usersCollection.dropIndex('phone_1');
      console.log('✅ phone_1 index dropped successfully');
    } else {
      console.log('No phone_1 index found');
    }
    
    // List remaining indexes
    const remainingIndexes = await usersCollection.indexes();
    console.log('Remaining indexes:', remainingIndexes.map(idx => idx.name));
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing indexes:', error);
    process.exit(1);
  }
};

fixIndexes();

