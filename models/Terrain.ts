import mongoose from "mongoose";
import { IDZone } from "./DistributionZone";
import { IPlant } from "./Plant";
import { IUser } from "./User";

interface ITerrain extends mongoose.Document {
  name: string;
  zip: string;
  gmImageDirectory: string;
  user: IUser;
}

const TerrainSchema = new mongoose.Schema({
  name: {
    type: String,
    maxlength: 100,
  },
  zip: {
    type: String,
    unique: true,
  },
  gmImageDirectory: {
    type: String,
    unique: true,
  },
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "User",
  },
});

const Terrain = mongoose.model<ITerrain>("Terrain", TerrainSchema);

export { ITerrain, Terrain };
