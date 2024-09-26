const User = require('../models/userModel.js');
const jwt = require('jsonwebtoken');
const cookie = require('cookie');

// Create JWT token
// const createToken = (id) => {
//   return jwt.sign({ id }, process.env.jwtSecret, { expiresIn: '3d' });
// }

// // verify token validity
// module.exports.verifyToken = async function verifyToken(req, res) {
//   const { token } = req.body;

//   try {
//     // Attempt to verify the token
//     const decoded = jwt.verify(token, process.env.jwtSecret);
//     const user = await User.findById(decoded.id);

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     return res.status(200).json(user);

//   } catch (error) {
//     // Handle specific JWT errors
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(400).json({ user: null, message: 'Token invalid' });
//     }

//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ user: null, message: 'Token expired' });
//     }

//     // General server error
//     return res.status(500).json({ message: 'Internal server error' });

//   }
// }

// // User signup
// module.exports.signup = async function signup(req, res) {
//   try {
//     const { firstName, lastName, email, password, } = req.body;

//     // Check for required fields
//     if (!firstName) {
//       return res.status(400).json({ message: 'firstName is Missing' });
//     }
//     if (!lastName) {
//       return res.status(400).json({ message: 'lastName is Missing' });
//     }

//     if (!email) {
//       return res.status(400).json({ message: 'Email is missing' });
//     }
//     if (!password) {
//       return res.status(400).json({ message: 'Password is Missing' });
//     }

//     // Check for existing user
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email is already in use' });
//     }

//     // Create new user
//     const newUser = await User.create({ firstName, lastName, email, password });

//     const token = createToken(newUser._id);
//     res.cookie("token", token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 });  // 3 days

//     console.log("Succesful signup");
//     return res.status(200).json({ token });
//   } catch (error) {
//     console.error('Signup Error: ', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
//}

// User login
// module.exports.login = async function login(req, res) {
//   try {
//     const { email, password } = req.body;

//     // Check for required fields
//     if (!email || !password) {
//       return res.status(400).json({ message: 'Missing email or password' });
//     }

//     // Check for existing user
//     const user = await User.findOne({ email, password });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Create JWT
//     const token = createToken(user._id);
//     res.cookie("token", token, { httpOnly: true, maxAge: 3 * 24 * 60 * 60 });  // 3 days

//     console.log("Succesful login");
//     return res.status(200).json({ token });
//   } catch (error) {
//     console.error('Login Error: ', error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// Get all users
module.exports.getAllUsers = async function getAllUsers(req, res) {
  try {
    const users = await User.find({});
    return res.status(200).json({ count: users.length, data: users });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
}

// Get a specific user by ID
module.exports.getUserById = async function getUserById(req, res) {
  try {
    const user = await User.findById(req.params.id);

    if (!user) return res.status(404).send({ message: 'user not found' });
    return res.status(200).send(user);

  } catch (error) {
    console.error(error.message);

    res.status(500).send({ message: error.message });
  }
}

// Check if assocoation exist in the user's favorite list
module.exports.existUserFavorite = async function existUserFavorite(req, res) {
  const { userId } = req.params;
  const { associationNumber } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (!associationNumber) {
      return res.send({ message: 'Send all required fields' });
    }

    const associationExists = user.Association.some(
      (assoc) => assoc.associationNumber === associationNumber
    );

    return res.status(200).json({ exists: associationExists });

  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error', error });
  }
};

// Update and add assocoation to the user's favorites assocoation list
module.exports.addUserFavorite = async function addUserFavorite(req, res) {
  const { userId } = req.params;
  const { associationName, associationNumber } = req.body

  try {
    const user = await User.findById(userId);

    if (!associationName || !associationNumber) {
      return res.json({ message: 'Send all required fields' });
    }

    user.Association.push({ associationName, associationNumber });
    const result = await User.findByIdAndUpdate(userId, user);

    if (!result) {
      return res.status(404).send({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'User updated successfully', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
}

// Update and remove assocoation from the user's favorite assocoation list
module.exports.removeUserFavorite = async function removeUserFavorite(req, res) {
  const { userId } = req.params;
  const { associationNumber } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate existence of assos in request body
    if (!associationNumber) {
      return res.json({ message: 'Send all required fields' });
    }

    // Update Association array using filter
    user.Association = user.Association.filter(
      (existingAssoc) => existingAssoc.associationNumber !== associationNumber);

    await user.save();  // Save changes to database

    return res.status(200).json({ message: 'User association removed from favorites' });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: 'Internal server error', error });
  }
}

// get the favorite associations of the user
module.exports.getFavoriteAssociations = async function getFavoriteAssociations(req, res) {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId)
    
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    const favoriteAssociations = user.Association.map(assoc => ({
      name: assoc.associationName,
      number: assoc.associationNumber
    }));

    return res.status(200).json({ favoriteAssociations })

  } catch (error) {
    return res.status(500).json({ message: "Error fetching favorite associations", error });
  }
}

// Remove user from DB
module.exports.deleteUserById = async function deleteUserById(req, res) {
  const userId = req.params.id;
  try {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.status(200).json({ message: 'User deleted successfully', user });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting user', error });
  }
};

// Remove all users from DB
module.exports.deleteAllUsers = async function deleteAllUsers(req, res) {
  try {
    const result = await User.deleteMany({});
    return res.status(200).json({ message: 'All users have been deleted', result });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting users', error });
  }
};