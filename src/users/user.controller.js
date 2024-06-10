const { checkUserExists, create, getUserByID, getUsers, updateUser, deleteUser, getUserbyEmail } = require('./user.service');
const { genSaltSync, hashSync } = require('bcrypt');
const bcrypt = require('bcrypt');
const { generateToken } = require('../../auth/validate');

const hashPassword = (password) => {
  const salt = genSaltSync(10);
  return hashSync(password, salt);
};

module.exports = {
  createUser: (req, res) => {
    const body = req.body;
    console.log('Create User:', body); // Log input data
    checkUserExists(body.username, body.email, (err, userExists) => {
      if (err) {
        console.error('Error checking user existence:', err);
        return res.status(500).json({
          error: true,
          message: 'Database connection error',
        });
      }

      if (userExists.usernameExists) {
        return res.status(400).json({
          error: true,
          message: 'Username already exists',
        });
      }

      if (userExists.emailExists) {
        return res.status(400).json({
          error: true,
          message: 'Email already registered',
        });
      }

      body.password = hashPassword(body.password);
      console.log('Hashed Password:', body.password); // Log hashed password

      create(body, (err, results) => {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({
            error: true,
            message: 'Failed to create user',
          });
        }

        if (results.affectedRows > 0) {
          return res.status(200).json({
            error: false,
            message: 'User Created',
          });
        } else {
          return res.status(500).json({
            error: true,
            message: 'Failed to create user',
          });
        }
      });
    });
  },
  getUserByID: (req, res) => {
    const id = req.params.id;
    console.log('Get User By ID:', id); // Log input ID
    getUserByID(id, (err, results) => {
      if (err) {
        console.error('Error getting user by ID:', err);
        return res.status(500).json({
          error: true,
          message: 'Internal server error',
        });
      }
      if (!results) {
        return res.json({
          error: true,
          message: 'User not found',
        });
      }
      return res.json({
        error: false,
        message: 'User found!',
        dataUser: results,
      });
    });
  },
  getUsers: (req, res) => {
    console.log('Get Users'); // Log action
    getUsers((err, results) => {
      if (err) {
        console.error('Error getting users:', err);
        return res.status(500).json({
          error: true,
          message: 'Internal server error',
        });
      }
      return res.json({
        error: false,
        message: 'Users fetched successfully',
        listUsers: results,
      });
    });
  },
  updateUser: (req, res) => {
    const id = req.params.id;
    const body = req.body;
    console.log('Update User:', id, body); // Log input data
    body.password = hashPassword(body.password);

    updateUser({ id, ...body }, (err, results) => {
      if (err) {
        console.error('Error updating user:', err);
        return res.status(500).json({
          error: true,
          message: 'Internal server error',
        });
      }
      if (results.affectedRows === 0) {
        return res.json({
          error: true,
          message: 'User not found or no changes made',
        });
      }
      return res.json({
        error: false,
        message: 'Data user updated successfully',
      });
    });
  },
  deleteUser: (req, res) => {
    const id = req.params.id;
    console.log('Delete User:', id); // Log input ID
    deleteUser(id, (err) => {
      if (err) {
        console.error('Error deleting user:', err);
        if (err.notFound) {
          return res.status(404).json({
            error: true,
            message: 'User not found',
          });
        }
        return res.status(500).json({
          error: true,
          message: 'Internal server error',
        });
      }
      return res.json({
        error: false,
        message: 'User deleted successfully',
      });
    });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log('Login Attempt:', email); // Log login attempt
      const results = await getUserbyEmail(email);

      if (!results) {
        return res.json({
          error: true,
          message: 'Invalid email or password',
        });
      }

      const passwordMatch = await bcrypt.compare(password, results.password);

      if (passwordMatch) {
        results.password = undefined;
        const jsontoken = generateToken({ result: results });

        return res.json({
          error: false,
          message: 'Login successful',
          loginResult: {
            userId: results.id,
            name: results.username,
            token: jsontoken,
          },
        });
      } else {
        console.error('Password mismatch for user:', results.email);
        return res.json({
          error: true,
          message: 'Invalid email or password',
        });
      }
    } catch (error) {
      console.error('Error in login:', error);
      return res.status(500).json({
        error: true,
        message: 'Internal server error',
      });
    }
  },
};
