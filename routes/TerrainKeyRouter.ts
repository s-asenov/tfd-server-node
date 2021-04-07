import crypto from "crypto";
import { Router } from "express";
import { Terrain } from "../models/Terrain";
import { TerrainKey } from "../models/TerrainKey";

const router = Router();

router.get("/:id", async (req, res) => {
  try {
    const key = await TerrainKey.findById(req.params.id);

    res.json(key);
  } catch (err) {
    res.send(404);
  }
});

router.get("/keys/:id", async (req, res) => {
  try {
    const key = await TerrainKey.find({ terrain: req.params.id });

    res.json(key);
  } catch (err) {
    res.send(404);
  }
});

router.post("/:id", async (req, res) => {
  let terrain = await Terrain.findById(req.params.id);

  let now = new Date();
  let hourLater = new Date();

  hourLater.setHours(hourLater.getHours() + 1);

  let key = new TerrainKey({
    id: res.locals.user.id + "-" + crypto.randomBytes(40).toString("hex"),
    terrain: terrain,
    createdOn: now,
    expiringOn: hourLater,
  });

  try {
    const saved = await key.save();

    res.json(saved);
  } catch (err) {
    res.send(404);
  }
});
