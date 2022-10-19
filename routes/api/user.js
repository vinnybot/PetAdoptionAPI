//imports
const express = require("express");
const debug = require("debug")("app:api:user");
const Joi = require("joi");
const validBody = require("../../middleware/validBody");

const {
  newId,
  insertUser,
  updateUser,
  getUserById,
  getUserByEmail,
} = require("../../database");

const registerSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().trim().min(8).required(),
  fullName: Joi.string().trim().min(1).required(),
});

//create router
const router = new express.Router();

//define routes
router.post("/register", validBody(registerSchema), async (req, res, next) => {
  try {
    // grab data from user
    const user = { 
        ...req.body, 
        _id: newId(), 
        createdDate: new Date(),
        role: 'customer',
     };
     
    const dbResult = await insertUser(user);
    debug('register result:', dbResult);

    res.json({message: 'New User Registered!' })
  } catch (err) {
    next(err);
  }
});

//export router
module.exports = router;
