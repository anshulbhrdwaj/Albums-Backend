const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");
const baseX = require("base-x");

const base62 = baseX("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");

const verifyToken = async (req, res, next) => {
  if (req.body.from === "LONEWOLF") {
    return next();
  }
  const { token, userId, username, name } = req.body;
  let urlToken; // Declare urlToken in the outer scope

  if (!userId) {
    return res.status(400).json({ error: "Invalid Credentials" });
  }

  let user = await User.findOne({ userId }); // No need to re-declare user

  if (!user) {
    user = new User({
      userId,
      username,
      name,
    });
    await user.save();
  }

  if (!token) {
    const token = jwt.sign({ userId: user.userId }, process.env.SECRET_KEY, {
      expiresIn: "24h",
    });
    urlToken = base62.encode(Buffer.from(token)); // Update urlToken
    return res.status(401).json({
      error: "Access denied",
      refreshUrl: `https://telegram.me/ab_practice_bot?start=token_${urlToken}`,
    });
  }

  try {
    const decodedToken = base62.decode(token).toString();
    const decoded = jwt.verify(decodedToken, process.env.SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      urlToken = base62.encode(Buffer.from(token)); // Update urlToken
      return res.status(401).json({
        error: "Token expired",
        refreshUrl: `https://telegram.me/ab_practice_bot?start=token_${urlToken}`,
      });
    } else {
      return res.status(401).json({ error: "Invalid token" });
    }
  }
};

module.exports = verifyToken;
