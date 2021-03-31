import mongoose from "mongoose";

interface IUser extends mongoose.Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  create?: Date;
}

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    minlength: 6,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  create: {
    type: Date,
    default: Date.now(),
  },
});

const User = mongoose.model<IUser>("User", UserSchema);

export { IUser, User };
