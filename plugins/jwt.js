const fp = require('fastify-plugin');
const jwt = require('jsonwebtoken');


module.exports = fp(async (fastify) => {  
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            const authHeader = request.headers.authorization;
            if (!authHeader) {
                return reply.status(401).send({ error: 'Authorization header is missing' });
            }
            const token = authHeader.split(' ')[1];
            if (!token) {
                return reply.status(401).send({ error: 'Token is missing' });
            }
            jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
                if (err) {
                    return reply.status(401).send({ error: 'Invalid token' });
                }
                request.user = decoded; // Attach user info to request
                // Continue processing after successful verification
            });
        } catch (error) {
            reply.status(500).send({ error: 'Internal Server Error' });
        }
    });

    fastify.decorate('generateToken', (payload) => {
        return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    });
});