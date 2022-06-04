module.exports = class AuthError extends Error{
    constructor(status=400, message='Authentication error'){
        super()
        this.status = status;
        this.message = message;
    }
}