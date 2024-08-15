// import { OAuth2Client } from 'google-auth-library';
const { OAuth2Client } = require('google-auth-library')
// import jwt from 'jsonwebtoken';
const jwt = require('jsonwebtoken')

const client = new OAuth2Client(REACT_APP_GOOGLE_CLIENT_ID);

const auth = async (req, res, next) => {
    try {
      console.log('Authorization header:', req.headers.authorization);
      if (!req.headers.authorization) {
        throw new Error('Authorization header is missing');
      }
    const token = req.headers.authorization.split(' ')[1];
    const googleToken = token.length > 1000;
    if (googleToken) {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: REACT_APP_GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      req.user = {
        id: payload.sub,
        name: payload.name,
        photoURL: payload.picture,
      };
    } else {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      const { id, name, photoURL } = decodedToken;
      req.user = { id, name, photoURL };
    }
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({
      success: false,
      message: 'Something is wrong with your authorization!',
    });
  }
};

module.exports = {
    auth,
}