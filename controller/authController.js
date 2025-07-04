const User = require('../models/user');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

exports.register = async (request, reply) => {
try {
    const { username, email, password } = request.body;
    if (!username || !email || !password) {
        return reply.status(400).send({ error: 'Username, email, and password are required' });
    }   
    await bcrypt.hash(password, 12, async (err, hash) => {
        if (err) {
            return reply.status(500).send({ error: 'Error hashing password' });
        }
        const user = new User({
            username,
            email,
            password: hash
        });
        await user.save();
        reply.status(201).send({ message: 'User registered successfully' });
    });

} catch (error) {
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}

exports.login = async (request, reply) => {
  try {
    const { email, password } = request.body;
    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return reply.status(401).send({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    reply.send({ token });
  } catch (error) {
    reply.status(500).send({ error: 'Internal Server Error' });
  }
exports.forgotPassword = async (request, reply) => {
    try {
        const { email } = request.body;
        if (!email) {
            return reply.status(400).send({ error: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return reply.status(404).send({ error: 'User not found' });
        }

        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set token and expiration on user
        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

        await user.save();

        // In a real app, send the resetToken via email to the user
        // For now, just return it in the response for testing
        reply.send({ message: 'Password reset token generated', resetToken });
    } catch (error) {
        reply.status(500).send({ error: 'Internal Server Error' });
    }
};}
exports.resetPassword = async (request, reply) => {
  try {
    const { resetToken, newPassword } = request.body;
    if (!resetToken || !newPassword) {
      return reply.status(400).send({ error: 'Reset token and new password are required' });
    }

    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return reply.status(400).send({ error: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    reply.send({ message: 'Password has been reset successfully' });
  } catch (error) {
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}
exports.logout = async (request, reply) => {
  try {
    // Invalidate the token by not returning it or by implementing a token blacklist
    reply.send({ message: 'Logged out successfully' });
  } catch (error) {
    reply.status(500).send({ error: 'Internal Server Error' });
  }
}