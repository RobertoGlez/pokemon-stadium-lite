const mongoose = require('mongoose');

async function clearDb() {
    await mongoose.connect('mongodb://localhost:27017/pokemon-stadium-lite');
    await mongoose.connection.db.dropDatabase();
    console.log("Database cleared");
    process.exit(0);
}

clearDb().catch(console.error);
