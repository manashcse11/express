class NotFoundError extends Error {
    constructor(message, type) {
        super(message);
        this.name = "NotFoundError";
        this.type = type;
    }
}

module.exports.NotFoundError = NotFoundError;