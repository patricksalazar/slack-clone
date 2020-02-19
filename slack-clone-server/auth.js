import jwt from 'jsonwebtoken';
import _ from 'lodash';
import bcrypt from 'bcrypt';

export const createTokens = async (user, secret, secret2) => {
  const createToken = jwt.sign(
    {
      user: _.pick(user, ['id', 'username'])
    },
    secret,
    {
      expiresIn: '1h'
    }
  );

  const createRefreshToken = jwt.sign(
    {
      user: _.pick(user, 'id', 'username')
    },
    secret2,
    {
      expiresIn: '7d'
    }
  );

  return [createToken, createRefreshToken];
};

export const refreshTokens = async (refreshToken, models, SECRET, SECRET2) => {
  let userId = 0;
  try {
    const {
      user: { id }
    } = jwt.decode(refreshToken);
    userId = id;
  } catch (err) {
    return {};
  }

  if (!userId) {
    return {};
  }

  const user = await models.User.findOne({ where: { id: userId }, raw: true });

  if (!user) {
    return {};
  }

  const refreshSecret = user.password + SECRET2;
  try {
    jwt.verify(refreshToken, refreshSecret);
  } catch (err) {
    return {};
  }

  const [newToken, newRefreshToken] = await createTokens(
    user,
    SECRET,
    user.refreshSecret
  );
  return {
    token: newToken,
    refreshToken: newRefreshToken,
    user
  };
};

export const tryLogin = async (email, password, models, SECRET, SECRET2) => {
  const user = await models.User.findOne({ where: { email }, raw: true });
  if (!user) {
    // user with provided email not found
    return {
      ok: false,
      errors: [{ path: 'email', message: 'Wrong email' }]
    };
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    // bad password
    return {
      ok: false,
      errors: [{ path: 'password', message: 'Wrong password' }]
    };
  }

  const refreshTokenSecret = user.password + SECRET2;

  const [token, refreshToken] = await createTokens(
    user,
    SECRET,
    refreshTokenSecret
  );

  return {
    ok: true,
    token,
    refreshToken
  };
};

export const findUser = (token, SECRET) => {
  if (token) {
    try {
      const { user } = jwt.verify(token, SECRET);
      return user;
    } catch (err) {
      throw err;
    }
  }
  return null;
};

export const getUser = (req, res, models, SECRET, SECRET2) => {
  // Get the user token from the headers
  const token = req.headers['x-token'] || '';
  const refreshToken = req.headers['x-refresh-token'] || '';

  if (token) {
    try {
      const { user } = jwt.verify(token, SECRET);
      req.user = user;
      return user;
    } catch (err) {
      const newTokens = refreshTokens(
        token,
        refreshToken,
        models,
        SECRET,
        SECRET2
      );
      if (newTokens.token && newTokens.refreshToken) {
        res.set('Access-Control-Expose-Headers', 'x-token, x-refresh-token');
        res.set('x-token', newTokens.token);
        res.set('x-refresh-token', newTokens.refreshToken);
      }
      req.user = newTokens.user;
      return newTokens.user;
    }
  }
};
