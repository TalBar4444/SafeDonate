const express = require('express');
const userController = require('../controllers/userController');

const userRouter = express.Router();

// Get list of all users in the system
userRouter.get('/allUsers', userController.getAllUsers);

// Get list of favorite associations for a specific user
userRouter.get('/favorite/:userId', userController.getFavoriteAssociations);

// Get user details by their ID
userRouter.get('/:id', userController.getUserById);

// Check if an association exists in user's favorites
userRouter.post('/updateExist/:userId', userController.existUserFavorite);

// Add a new association to user's favorites
userRouter.put('/updateAdd/:userId', userController.addUserFavorite);

// Remove an association from user's favorites
userRouter.put('/updateRemove/:userId', userController.removeUserFavorite);

// Delete a specific user by their ID
userRouter.delete('/deleteUserById/:id', userController.deleteUserById);

// Delete all users from the system
userRouter.delete('/deleteAllUsers', userController.deleteAllUsers);

module.exports = userRouter;