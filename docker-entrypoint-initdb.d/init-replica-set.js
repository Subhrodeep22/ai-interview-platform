// Initialize MongoDB replica set for Prisma
// This script runs automatically when MongoDB container starts for the first time

try {
  const status = rs.status();
  print('Replica set already initialized');
} catch (e) {
  // Replica set not initialized, initialize it
  print('Initializing replica set...');
  rs.initiate({
    _id: 'rs0',
    members: [
      {
        _id: 0,
        host: 'ai-interview-mongodb:27017'
      }
    ]
  });
  print('Replica set initialized successfully');
}

