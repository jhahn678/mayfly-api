const express = require('express')
const PORT = process.env.PORT || 5001
const cors = require('cors')
const connectMongoDB = require('./config/mongodb')
const { ApolloServer } = require('apollo-server-express')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers/user')
const getAuthToken = require('./utils/getAuthToken')

require('dotenv').config();

connectMongoDB()

async function startServer(){
    const app = express();
    app.use(cors())
    app.use(express.json())

    const server = new ApolloServer({ 
        typeDefs, 
        resolvers,
        csrfPrevention: true,
        context: ({ req }) => ({
            auth: getAuthToken(req.headers.authorization)
        })
    })
    
    await server.start()
    server.applyMiddleware({ app, path: '/api'})

    const authRoutes = require('./routes/auth')

    app.use('/auth', authRoutes)
    app.use('/', (req, res) => {
        res.send('Mayfly API up and running')
    })
    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`)
    })
}

startServer()
