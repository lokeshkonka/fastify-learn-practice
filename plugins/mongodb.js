const fp =require('fastify-plugin');
const fastifyMongodb = require('@fastify/mongodb');
const mongoose = require('mongoose');
module.exports = fp(async (fastify, opts) => {
try {
    await mongoose.connect(process.env.MONGODB_URL);
    fastify.decorate('mongo', mongoose.connection);
    fastify.log.info('MongoDB connected successfully');
} catch (error) {
    fastify.log.error('MongoDB connection error:', error);
    process.exit(1);
}

fastify.register(fastifyMongodb);

  fastify.decorate('mongodb', fastify.mongo.db);
});