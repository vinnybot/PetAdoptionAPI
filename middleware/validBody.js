const { ObjectId } = require('mongodb');

const validBody = (schema) => {
    return (req, res, next) => {
        try {
            const validateResult = schema.validate(req.body, { abortEarly: false })
            if (validateResult.error) {
                return res.status(400).json({error: validateResult.error});
            } else {
                req.body = validateResult.value;
                next();
            }
        } catch (err) {
            next (err)
        }
    }
}

module.exports = validBody;