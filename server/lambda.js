const serverless = require('serverless-http');
const { app, connectDB } = require('./index');

// Cache the serverless handler
const serverlessHandler = serverless(app);

module.exports.handler = async (event, context) => {
  // Ensure DB connection is established before processing request
  context.callbackWaitsForEmptyEventLoop = false;
  await connectDB();
  
  // Forward request to Express app
  return await serverlessHandler(event, context);
};
