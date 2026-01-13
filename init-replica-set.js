// Initialize MongoDB replica set using Node.js
const { MongoClient } = require('mongodb');

async function initReplicaSet() {
  const uri = 'mongodb://localhost:27017/?directConnection=true';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const admin = client.db('admin');
    
    // Check if replica set is already initialized
    try {
      const status = await admin.command({ replSetGetStatus: 1 });
      console.log('✅ Replica set already initialized:', status.set);
    } catch (error) {
      if (error.codeName === 'NotYetInitialized') {
        console.log('Initializing replica set...');
        const config = {
          _id: 'rs0',
          members: [{ _id: 0, host: 'localhost:27017' }]
        };
        
        const result = await admin.command({ replSetInitiate: config });
        console.log('✅ Replica set initialized successfully!');
        console.log(result);
        
        // Wait for replica set to become primary
        console.log('Waiting for replica set to elect primary...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        const status = await admin.command({ replSetGetStatus: 1 });
        console.log('Replica set status:', status.set, '-', status.myState);
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initReplicaSet();
