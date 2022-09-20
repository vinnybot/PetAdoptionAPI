const debug = require('debug')('app:server');
const debugError = require('debug')('app:error');
const express = require('express');
const { nanoid } = require('nanoid');

const petsArray = [
  { _id: '1', name: 'Fido' },
  { _id: '2', name: 'Watson' },
  { _id: '3', name: 'Loki' },
];

//construct express app
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//define routes
app.get('/api/pet/list', (req, res, next) => {
  res.json(petsArray);
});
app.get('/api/pet/:petId', (req, res, next) => {
  const petId = req.params.petId;

  const foundPet = petsArray.find((x) => x._id == petId);
  if (!foundPet) {
    res.status(404).json({ error: 'Pet Not Found' });
  } else {
    res.json(foundPet);
  }
});
//create
app.put('/api/pet/new', (req, res, next) => {
  const petId = nanoid();
  const { species, name, gender } = req.body;
  const age = parseInt(req.body.age);
  const pet = {
    _id: petId,
    species, //species:species,
    name,
    age,
    gender,
  };

  //validation
  if (!species) {
    res.status(400).json({ error: 'Species required' });
  } else if (!name) {
    res.status(400).json({ error: 'Name required' });
  } else if (!gender) {
    res.status(400).json({ error: 'Gender required' });
  } else if (!age) {
    res.status(400).json({ error: 'Age required' });
  } else {
    petsArray.push(pet);
    res.json(pet);
  }
});
//update
app.put('/api/pet/:petId', (req, res, next) => {
  const petId = req.params.petId;
  const { species, name, gender, age } = req.body;

  const pet = petsArray.find((x) => x._id == petId);
  if (!pet) {
    res.status(404).json({ error: 'Pet Not Found' });
  } else {
    if (species != undefined) {
      pet.species = species;
    }
    if (name != undefined) {
      pet.name = name;
    }
    if (age != undefined) {
      pet.age = parseInt(age);
    }
    if (gender != undefined) {
      pet.gender = gender;
    }
    res.json(pet);
  }
});

//delete
app.delete('/api/pet/:petId', (req, res, next) => {
  const petId = req.params.petId;
  const index = petsArray.findIndex((x) => x._id == petId);
  if (index < 0) {
    res.status(404).json({ error: 'Pet Not Found' });
  } else {
    petsArray.splice(index, 1);
    res.json({ message: 'Pet deleted' });
  }
});

//start listening for requests
const port = process.env.PORT || 5001;
app.listen(port, () => {
  debug(`Server running at http://localhost:${port}`);
});
