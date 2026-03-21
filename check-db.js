const mongoose = require('mongoose');
require('dotenv').config();

const checkDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const users = await mongoose.connection.collection('users').find({}).toArray();
    console.log('Users in database:', users.length);
    
    if (users.length > 0) {
      console.log('Admin user:', users.find(u => u.role === 'admin'));
    } else {
      console.log('No users found - database is empty');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkDB();
