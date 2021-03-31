import { Router } from "express";
import { IUser, User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const accessTokenSecret = process.env.SECRET;

const router = Router();

router.post("/register", async (req, res) => {
  const token = req.headers.authorization;

  if (token) {
    res.sendStatus(401);
  }

  const body: IUser = req.body;

  let hash = bcrypt.hashSync(body.password, 10);

  const user = new User({
    email: body.email,
    password: hash,
    firstName: body.firstName,
    lastName: body.lastName,
  });

  try {
    const saved = await user.save();
    const accessToken = jwt.sign({ id: user._id }, accessTokenSecret, {
      expiresIn: "1h",
    });

    res.json({
      accessToken,
      saved,
    });
  } catch (err) {
    res.json(err);
  }
});

router.post("/login", async (req, res) => {
  const token = req.headers.authorization;

  if (token) {
    res.sendStatus(401);
  }

  const { email, password } = req.body;

  const user = await User.findOne({ email: email }).exec();

  if (user && bcrypt.compareSync(password, user.password)) {
    const accessToken = jwt.sign({ id: user._id }, accessTokenSecret, {
      expiresIn: "1h",
    });

    res.json({
      accessToken,
    });
  } else {
    res.send("Username or password incorrect");
  }
});

router.get("/user", (req, res) => {
  const token = req.headers.authorization;

  if (token) {
    jwt.verify(token, accessTokenSecret, async (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }

      const response = await User.findById(user.id);
      res.json(response);
    });
  } else {
    res.sendStatus(401);
  }
});

export default router;
