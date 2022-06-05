module.exports = catchAsync = (func) => (req, res, next) => {
    func(req, res).catch(err => next(err))
}