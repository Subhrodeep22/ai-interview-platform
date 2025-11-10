// Script to initialize MongoDB replica set
// This is run once to set up the replica set

rs.initiate({
  _id: "rs0",
  members: [
    {
      _id: 0,
      host: "localhost:27017"
    }
  ]
});

