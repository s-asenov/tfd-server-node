import mongoose from "mongoose";
import { ITerrain } from "./Terrain";

interface ITerrainKey extends mongoose.Document {
  _id: string;
  terrain: ITerrain;
  createdOn: Date;
  expiringOn: Date;
}

const TerrainKeySchema = new mongoose.Schema({
  _id: {
    type: String,
    maxlength: 255,
  },
  terrain: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Terrain",
  },
  expiringOn: Date,
  createdOn: Date,
});

const TerrainKey = mongoose.model<ITerrain>("TerrainKey", TerrainKeySchema);

export { ITerrainKey, TerrainKey };
