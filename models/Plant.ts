import mongoose from "mongoose";

interface IPlant extends mongoose.Document {
  scientificName: string;
  commonName?: string;
  imageUrl?: string;
  description: string;
}

const PlantSchema = new mongoose.Schema({
  scientificName: String,
  commonName: String,
  imageUrl: String,
  description: String,
});

const Plant = mongoose.model<IPlant>("Plant", PlantSchema);

export { IPlant, Plant };
