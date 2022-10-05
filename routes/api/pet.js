const debug = require('debug')('app:routes:api:pet');
const debugError = require('debug')('app:error');
const { parse } = require('dotenv');
const express = require('express');
const { nanoid } = require('nanoid');
const dbModule = require('../../database');
const Joi = require('joi');
const validId = require('../../middleware/validId');
const validBody = require('../../middleware/validBody');


//create a router
const router = express.Router();

  const newPetSchema = Joi.object({
    species: Joi.string().trim().min(1).pattern(/^[^0-9]+$/, 'not numbers').required(),
    name: Joi.string().trim().min(1).required(),
    age: Joi.number().integer().min(0).max(1000).required(),
    gender: Joi.string().trim().length(1).required(),
  });

  const updatePetSchema = Joi.object({
    species: Joi.string().trim().min(1).pattern(/^[^0-9]+$/, 'not numbers'),
    name: Joi.string().trim().min(1),
    age: Joi.number().integer().min(0).max(1000),
    gender: Joi.string().trim().length(1),
  });


//define routes
router.get('/api/pet/list', async (req, res, next) => {
  try {
    const pets = await dbModule.findAllPets();
    res.json(pets);
  } catch (err) {
    next(err);
  }
});

//find by id
router.get('/api/pet/:petId', validId('petId'), async (req, res, next) => {
  try {
  const petId = req.petId;
  const pet = await dbModule.findPetById(petId);
      if (!pet) {
        res.status(404).json({ error: ` ${petId} Pet not found` });
      } else {
        res.json(pet);
      }
  } catch (err) {
    next (err);
  }
});

//create
router.put('/api/pet/new', validBody(newPetSchema), async (req, res, next) => {
  try {
    const pet = req.body;
    pet._id = newId();
    debug(`insert pet`, pet);
  
    await dbModule.insertOnePet(pet);
    res.json({ message: 'Pet created' });
  } catch (err) {
    next(err);
  }
});

//update
router.put('/api/pet/:petId', validId('petId'), validBody(updatePetSchema), async (req, res, next) => {
  try{
    const petId = req.petId;
    const update = req.body;
    debug(`update pet ${petId}`, update);

    const pet = await dbModule.findPetById(petId);
    if (!pet) {
      res.status(404).json({ error: ` ${petId} Pet not found` });
    } else {
      await dbModule.updateOnePet(petId, update);
      res.json({ message: ` ${petId} Pet updated` });
    }
  } catch (err) {
    next(err);
  }
});

//delete
router.delete('/api/pet/:petId', validId('petId'), async (req, res, next) => {
 try{
      const petId = req.petId;
      debug(`Delete pet ${petId}`);

    const pet = await dbModule.findPetById(petId);
    if (!pet) {
      res.status(404).json({ error: ` ${petId} Pet not found` });
    } else {
      await dbModule.deleteOnePet(petId);
      res.json({ message: ` ${petId} Pet deleted` });
    }
  } catch (err) {
    next(err);
 }
});

//export router
module.exports = router;
