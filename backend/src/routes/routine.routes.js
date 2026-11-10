const express = require('express');
const {
    createNewRoutine,
    getMyRoutines,
    getRoutine,
    updateRoutineDetails,
    deleteRoutineById,
    addExercise,
    removeExercise,
    updateExerciseInRoutine,
} = require('../controllers/routine.controller');
const {
    validateCreateRoutine,
    validateUpdateRoutine,
    validateAddExercise,
    validateUpdateRoutineExercise,
} = require('../middlewares/validateBody');

const routineRouter = express.Router();

routineRouter.post('/', validateCreateRoutine, createNewRoutine);
routineRouter.get('/', getMyRoutines);
routineRouter.get('/:id', getRoutine);
routineRouter.put('/:id', validateUpdateRoutine, updateRoutineDetails);
routineRouter.delete('/:id', deleteRoutineById);

routineRouter.post('/:id/exercises', validateAddExercise, addExercise);
routineRouter.delete('/:id/exercises/:exerciseId', removeExercise);
routineRouter.patch('/:id/exercises/:exerciseId', validateUpdateRoutineExercise, updateExerciseInRoutine);

module.exports = routineRouter;
