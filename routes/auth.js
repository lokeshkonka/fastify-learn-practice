const authController = require('../controllers/authController');
const fastify = require('fastify')({ logger: true });

module.exports = async function (fastify, opts) {
  // Register routes for authentication
  fastify.post('/register', authController.register);
  fastify.post('/login', authController.login);
  fastify.get('/profile', { preValidation: [fastify.authenticate] }, authController.profile);
  
  // Optional: Add a route to test authentication
  fastify.get('/test-auth', { preValidation: [fastify.authenticate] }, async (request, reply) => {
    return { message: 'Authentication successful!' };
  });
}