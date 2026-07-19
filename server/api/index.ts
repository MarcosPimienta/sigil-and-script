// Vercel serverless entry point — auto-discovered via api/ directory convention
import app from '../src/index';

export default app;
module.exports = app; // CommonJS compat for @vercel/node
