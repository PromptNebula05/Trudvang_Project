import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { json } from 'express';

import { connectDB } from './db.js';
import { typeDefs, resolvers } from './graphql/schema.js';
import { verifyToken, extractBearerToken } from './auth.js';

import originRoutes from './routes/originRoutes.js';
import archetypeRoutes from './routes/archetypeRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import characterRoutes from './routes/characterRoutes.js';
import userRoutes from './routes/userRoutes.js';

const PORT = process.env.PORT || 4000;

async function start() {
    await connectDB();

    const app = express();
    app.use(cors());
    app.use(json());

    // REST routes
    app.use('/api/origins', originRoutes);
    app.use('/api/archetypes', archetypeRoutes);
    app.use('/api/skills', skillRoutes);
    app.use('/api/equipment', equipmentRoutes);
    app.use('/api/characters', characterRoutes);
    app.use('/api/users', userRoutes);

    // Apollo GraphQL middleware
    const apolloServer = new ApolloServer({ typeDefs, resolvers });
    await apolloServer.start();

    app.use(
        '/graphql',
        json(),
        expressMiddleware(apolloServer, {
            context: async ({ req }) => {
                const token = extractBearerToken(req.headers['authorization']);
                const user = token ? await verifyToken(token) : null;
                return { user };
            }
        })
    );

    app.listen(PORT, () => {
        console.log(`REST API listening on http://localhost:${PORT}`);
        console.log(`Apollo GraphQL ready at http://localhost:${PORT}/graphql`);
    });
}

start();