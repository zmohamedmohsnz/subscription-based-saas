// why not put the DB connection directly in `server.js`?
// we keep it separate for scalability. As the project grows,
// some scripts may need to access the DB outside the server lifecycle.
// Keeping the connection separate lets those scripts use the DB
// without starting the server.

// why we disable automatic indexes creation in production ?
// building indexes can be an expensive operation on large collections
// as it can consume huge resources and hurt performance so in production,
// we usually create indexes manually during a controlled deployment or migration.

import mongoose from 'mongoose';
import env from './env.js';

const connectToDB = async (uri) => {
  await mongoose.connect(
    uri,
    { autoIndex: env.nodeEnv !== 'production' }
  );

  return mongoose.connection;
};

export default connectToDB;
