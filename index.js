const express = require('express')
const { createServer } = require('http')
const { ApolloServerPluginDrainHttpServer } = require("apollo-server-core");
const { ApolloServer } = require('apollo-server-express')
const { makeExecutableSchema } = require('@graphql-tools/schema');
const { WebSocketServer } = require('ws');
const { useServer } = require('graphql-ws/lib/use/ws');
const cors = require('cors')
const connectMongoDB = require('./config/mongodb')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
const getAuthToken = require('./utils/getAuthToken')
const authRoutes = require('./routes/auth')
const devRoutes = require('./routes/dev')
const { notFound, errorHandler } = require('./controllers/errors')
const PORT = process.env.PORT || 7500



require('dotenv').config();

connectMongoDB()

async function startServer() {

    const app = express();
    
    const httpServer = createServer(app);

    const schema = makeExecutableSchema({ typeDefs, resolvers })

    const wsServer = new WebSocketServer({
        server: httpServer,
        path: '/ws',
    });
    
    const serverCleanup = useServer({ 
        schema: schema,
        // context: async (ctx) => {
        //     const payload = await getAuthToken(req.headers.authorization)
        //     return { auth: payload ? payload : null }
        // },
    }, wsServer);

    const server = new ApolloServer({ 
        schema: schema,
        csrfPrevention: true,
        context: async ({ req }) => {
            const payload = await getAuthToken(req.headers.authorization)
            return { auth: payload || null }
        },
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer: httpServer }),
            {
              async serverWillStart() {
                return {
                  async drainServer() {
                    await serverCleanup.dispose();
                  }
                }
              }
            }
        ]
    })
    
    await server.start()

    server.applyMiddleware({ app, path: '/api'})

    app.use(cors())
    app.use(express.json())
    app.use('/dev', devRoutes)
    app.use('/auth', authRoutes)
    app.get('/', (req, res) => res.send('This is the Mayfly API!'))
    app.use('*', notFound)
    app.use('*', errorHandler)

    httpServer.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`)
    })

}

startServer()
