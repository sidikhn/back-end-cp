const jwt = require('jsonwebtoken');

function generateToken(payload) {
  const secretKey = 'sidik';
  if (!secretKey) {
    throw new Error('JWT secret key is not defined');
  }
  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

function checkToken(req, res, next) {
  let token = req.get('authorization');
  if (token) {
    token = token.slice(7);
    const secretKey = 'sidik';
    if (!secretKey) {
      return res.json({
        error: true,
        message: 'JWT secret key is not defined',
      });
    }
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        res.json({
          error: true,
          message: 'Invalid token',
        });
      } else {
        req.decoded = decoded; // Attach decoded token to request
        next();
      }
    });
  } else {
    res.json({
      error: true,
      message: 'Access denied, unauthorized user',
    });
  }
}

module.exports = {
  generateToken,
  checkToken,
};
