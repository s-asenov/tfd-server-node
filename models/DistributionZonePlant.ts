import mongoose from "mongoose";
import { IDZone } from "./DistributionZone";
import { IPlant } from "./Plant";

interface IDZonePlant extends mongoose.Document {
  zone: IDZone;
  plant: IPlant;
}

const DZonePlantSchema = new mongoose.Schema({
  plant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Plant",
  },
  zone: {
    type: Number,
    ref: "DZone",
  },
});

const DZonePlant = mongoose.model<IDZonePlant>("DZonePlant", DZonePlantSchema);

export { IDZonePlant, DZonePlant };
