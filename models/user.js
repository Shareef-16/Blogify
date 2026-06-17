const { Schema, model } = require('mongoose');
const { createHmac, randomBytes } = require('crypto');
const { createTokenForUser } = require('../services/authentication');

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    salt: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    profileImageURL: {
      type: String,
      default: '/images/default.png',
    },

    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', function () {
  if (!this.isModified('password')) return;

  const salt = randomBytes(16).toString('hex');

  const hashedPassword = createHmac('sha256', salt)
    .update(this.password)
    .digest('hex');

  this.salt = salt;
  this.password = hashedPassword;
});

userSchema.static('matchPasswordAndGenerateToken', async function (email, password) {
  const user = await this.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  const userProvidedHash = createHmac('sha256', user.salt)
    .update(password)
    .digest('hex');

  if (user.password !== userProvidedHash) {
    throw new Error('Invalid password');
  }

  const token =createTokenForUser(user);
  return token;
});

const User = model('user', userSchema);

module.exports = User;