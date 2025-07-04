require('dotenv').config();


const fastify = require('fastify')({ logger: true });
const fastifyEnv = require('@fastify/env');
const fastifyCors = require('@fastify/cors');
// Register CORS plugin
fastify.register(fastifyCors, {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
});
fastify.register(require('@fastify/static'),{
  root: require('path').join(__dirname, 'public'), // Serve static files from the 'public' directory\\
  prefix: '/uploads/', // Optional: serve static files under the '/public' prefix
  decorateReply: false // Optional: do not decorate the reply object with static methods
});
const schema = {
  type: 'object',
  required: ['PORT'],
    properties: {
        PORT: {
        type: 'string',
        default: '3000'
        }
    }
};
const options = {
  confKey: 'config',
    schema: schema,
    data: process.env
};
//register custom plugin
fastify.register(require('./plugins/mongodb'));
fastify.register(require('./plugins/jwt'));
// Register environment variables plugin
fastify.register(fastifyEnv, options);
// Register routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
// Register a simple route
fastify.get('/health', async (request, reply) => {
    return { status: 'ok' };  
});






 fastify.get('/', async (request, reply) => {
    return { hello: 'world' };
});
const start = async () => {
  try {
    const PORT = process.env.PORT || 3000;
    await fastify.listen({PORT});
    fastify.log.info(`Server listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}



start();