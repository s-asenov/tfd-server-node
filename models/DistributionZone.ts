import mongoose from "mongoose";

interface IDZone extends mongoose.Document {
  _id: number;
  name: string;
  parent?: number;
  fetched: number;
}

const DZoneSchema = new mongoose.Schema({
  _id: Number,
  name: {
    type: String,
    unique: true,
  },
  parent: {
    type: mongoose.Schema.Types.Number,
    ref: "DZone",
  },
  fetched: Number,
});

const DZone = mongoose.model<IDZone>("DZone", DZoneSchema);

export { IDZone, DZone };
