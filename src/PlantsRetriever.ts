import axios from "axios";
import dotenv from "dotenv";
import { IPlant, Plant } from "../models/Plant";
import { DZone, IDZone } from "../models/DistributionZone";
import { DZonePlant } from "../models/DistributionZonePlant";
dotenv.config();

const token = process.env.TREFLE_API;

async function getPlantsFromZone(zone: IDZone) {
  const zoneId = zone._id;

  let pushed: Array<any>;
  let existing: Array<any>;

  if (zone.fetched > 1) {
    const plants = await DZonePlant.find({ zone: zone }).exec();

    return plants;
  }

  const init = await getPlantsFromPage(1, zoneId);

  pushed = init.pushed;
  existing = init.existing;

  for (let i = 2; i <= init.total / 20; i++) {
    const plants = await getPlantsFromPage(i, zoneId);

    pushed = [...pushed, ...plants.pushed];
    existing = [...existing, ...plants.existing];
  }

  return [...new Set([...existing, ...pushed])];
}

async function getPlantsFromPage(page: number, zoneId: number) {
  const req = await axios.get(
    `https://trefle.io/api/v1/distributions/${zoneId}/plants?page=${page}&token=${token}`
  );

  const plants: Array<Object> = req.data.data;

  const total = req.data.meta.total;

  const scientificNames = plants.map((pl) => {
    return pl["scientific_name"];
  });

  const existingPlants = await Plant.find({
    scientificName: {
      $in: scientificNames,
    },
  });

  let pushed = [];
  let pushedDZPlants = [];
  let existing: Array<IPlant> = [];

  for (let i = 0; i < plants.length; i++) {
    const el = plants[i];

    for (var j = 0; j < existingPlants.length; j++) {
      if (existingPlants[j].scientificName === el["scientific_name"]) {
        existing.push(existingPlants[j]);

        break;
      }
    }

    let newPlant = {
      scientificName: el["scientific_name"],
      commonName: el["common_name"],
      imageUrl: el["image_url"],
      description: "",
    };

    let newDZonePlant = {
      zone: zoneId,
      plant: newPlant,
    };

    pushed.push(newPlant);
    pushedDZPlants.push(newDZonePlant);
  }

  try {
    await Plant.collection.insertMany(pushed);
    await DZonePlant.collection.insertMany(pushedDZPlants);
  } catch (err) {
    console.log(err);
  }

  return {
    pushed,
    existing,
    total,
  };
}

export { getPlantsFromZone };
