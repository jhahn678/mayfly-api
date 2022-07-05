const notFound = (req, res) => {
    res.status(404).json({ message: 'Resource does not exist' })
}


const errorHandler = (err, req, res, next) => {
    console.log(err)
    res.status(err.status || 500).json({ message: err.message || 'Server Error'})
}

module.exports = { notFound, errorHandler }