import { Router } from "express";
import * as fs from "fs";
import crypto from "crypto";
import archiver from "archiver";
import { Terrain } from "../models/Terrain";
import { User } from "../models/User";
import { getPlantsFromZone } from "../src/PlantsRetriever";
import axios from "axios";
import { DZone, IDZone } from "../models/DistributionZone";
import { IPlant } from "../models/Plant";
import saveZonesInDB from "../src/services/ZoneUploader";
import { TerrainKey } from "../models/TerrainKey";

const router = Router();

interface IMapRequest {
  images: {
    gmImage: string;
    elevation: string;
  };
  name: string;
  lat: number | string;
  lng: number | string;
}

router.post("/map", async (req, res) => {
  const body: IMapRequest = req.body;
  const now = new Date();
  const userId = res.locals.user.id;

  const uid = crypto.randomBytes(20).toString("hex");
  const name = userId + now.getTime() / 1000 + uid;

  const output = fs.createWriteStream(`${__dirname}/../zip/${name}.zip`);
  const archive = archiver("zip");
  archive.pipe(output);

  let zone: IDZone;

  const request = await axios.get(
    `http://api.geonames.org/countrySubdivisionJSON?lat=${body.lat}&lng=${body.lng}&username=${process.env.GEONAMES_API}`
  );

  if (request.data.adminName1) {
    zone = await DZone.findOne({ name: request.data.adminName1 });
  }

  if (zone === null) {
    zone = await DZone.findOne({ name: request.data.countryName });
  }

  zone.fetched += 1;
  await zone.save();

  let plants: Array<IPlant>;

  if (zone) {
    plants = await getPlantsFromZone(zone);
  } else {
    plants = [];
  }

  let plantsJson = JSON.stringify(plants, null, 4);
  let objJsonB64 = Buffer.from(plantsJson).toString("base64");

  let eleBuf = Buffer.from(body.images.elevation, "base64");
  let jsonBuf = Buffer.from(objJsonB64, "base64");

  archive.append(eleBuf, { name: `${name}.jpg` });
  archive.append(jsonBuf, { name: `${name}.json` });

  archive.finalize();

  const gmImageDirectory = `${__dirname}/../gmImages/${name}.jpg`;

  fs.writeFileSync(gmImageDirectory, body.images.gmImage, "base64");

  try {
    const user = await User.findById(userId);

    const terrain = new Terrain({
      name: body.name,
      zip: name,
      gmImageDirectory: name,
      user: user,
    });

    const saved = await terrain.save();

    res.json(saved);
  } catch (err) {
    res.json(404);
  }
});

router.get("/terrains", async (req, res) => {
  const userId = res.locals.user.id;

  try {
    const user = await User.findById(userId);
    const terrains = await Terrain.find({
      user: user,
    });

    res.json(terrains);
  } catch (err) {
    res.json(err);
  }
});

router.post("/upload-zones", async (req, res) => {
  try {
    await saveZonesInDB();

    res.json("success");
  } catch (err) {
    res.json(err);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    let terrain = await Terrain.findById(req.params.id);

    let terrainKeys = await TerrainKey.find({ terrain: terrain });

    await terrain.delete();
    await TerrainKey.deleteMany(terrainKeys);

    res.json("Success!");
  } catch (err) {
    console.log(err);

    res.send(404);
  }
});

export default router;
