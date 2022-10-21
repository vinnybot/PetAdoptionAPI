//imports
const express = require("express");
const debug = require("debug")("app:api:user");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const validBody = require("../../middleware/validBody");
const validId = require("../../middleware/validId");

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

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().trim().min(8).required(),
});

const updateSchema = Joi.object({
  password: Joi.string().trim().min(8),
  fullName: Joi.string().trim().min(1),
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
      role: "customer",
    };
    //hash password
    const saltRounds = parseInt(config.get("auth.saltRounds"));
    user.password = await bcrypt.hash(user.password, saltRounds);

    if (await getUserByEmail(user.email)) {
      res.status(400).json({ error: `Email ${user.email} is already in use` });
    } else {
      const dbResult = await insertUser(user);
      debug("register result:", dbResult);

      //issue token
      const authPayload = {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };

      const authSecret = config.get("auth.secret");
      const authOptions = { expiresIn: config.get("auth.tokenExpiresIn") };
      const authToken = jwt.sign(authPayload, authSecret, authOptions);

      //create a cookie
      const cookieOptions = {
        httpOnly: true,
        maxAge: parseInt(config.get("auth.cookieMaxAge")),
      };
      res.cookie("authToken", authToken, cookieOptions);

      res.json({
        message: "New User Registered!",
        userId: user._id,
        token: authToken,
      });
    }
  } catch (err) {
    next(err);
  }
});

router.post("/login", validBody(loginSchema), async (req, res, next) => {
  try {
    const login = req.body;
    const user = await getUserByEmail(login.email);

    if (user && (await bcrypt.compare(login.password, user.password))) {
      //issue token
      const authPayload = {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      };

      const authSecret = config.get("auth.secret");
      const authOptions = { expiresIn: config.get("auth.tokenExpiresIn") };
      const authToken = jwt.sign(authPayload, authSecret, authOptions);

      //create a cookie
      const cookieOptions = {
        httpOnly: true,
        maxAge: parseInt(config.get("auth.cookieMaxAge")),
      };
      res.cookie("authToken", authToken, cookieOptions);

      res.json({
        message: "Welcome Back!",
        userId: user._id,
        token: authToken,
      });
    } else {
      res.status(400).json({ error: "Invalid Credentials!" });
    }
  } catch (err) {
    next(err);
  }
});
router.put("/me", validBody(updateSchema), async (req, res, next) => {
  // self service update
  try {
    if (!req.auth) {
      return res.status(400).json({error: 'You must be logged in.'});
    }

    const userId = newId(req.auth._id);
    const update = req.body;

    if (update.password) {
      const saltRounds = parseInt(config.get('auth.saltRounds'));
      update.password = await bcrypt.hash(update.password, saltRounds);
    }


    const dbResult = await updateUser(userId, update);
    debug('update me result:', dbResult);

    res.json({message: "User Updated!"});

  } catch (err) {
    next (err)
  }
});

router.put(
  "/:userId",
  validId("userId"),
  validBody(updateSchema),
  async (req, res, next) => {
    // admin update
    try {
      const userId = req.userId;
      const update = req.body;

      if (update.password) {
        const saltRounds = parseInt(config.get('auth.saltRounds'));
        update.password = await bcrypt.hash(update.password, saltRounds);
      }

      const dbResult = await updateUser(userId, update);
      debug('update result:', dbResult);

      if (dbResult.matchedCount > 0) {
        res.json({message: 'User Updated!', userId});
      } else {
        res.status(404).json({error: 'User not found!'});
      }
    } catch (err) {
      next(err);
    }
  }
);

//export router
module.exports = router;
