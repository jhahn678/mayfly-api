const express = require('express')
const PORT = process.env.PORT || 7500
const cors = require('cors')
const connectMongoDB = require('./config/mongodb')
const { ApolloServer } = require('apollo-server-express')
const typeDefs = require('./graphql/typeDefs')
const resolvers = require('./graphql/resolvers')
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
        context: async ({ req }) => {
            const payload = await getAuthToken(req.headers.authorization)
            return { auth: payload }
        }
    })
    
    await server.start()
    server.applyMiddleware({ app, path: '/api'})

    const authRoutes = require('./routes/auth')
    const devRoutes = require('./routes/dev')

    app.use('/dev', devRoutes)
    app.use('/auth', authRoutes)
    app.use('/', (req, res) => {
        res.send('Mayfly API up and running')
    })

    app.use('*', (req, res) => {
        res.status(404).json({ message: 'Resource does not exist' })
    })

    app.use('*', (err, req, res, next) => {
        console.log(err)
        res.status(err.status || 500).json({ message: err.message || 'Server Error'})
    })

    app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`)
    })
}

startServer()
