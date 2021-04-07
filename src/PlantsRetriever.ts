import axios from "axios";
import dotenv from "dotenv";
import { IPlant, Plant } from "../models/Plant";
import { IDZone } from "../models/DistributionZone";
import { DZonePlant } from "../models/DistributionZonePlant";
dotenv.config();

const token = process.env.TREFLE_API;
let global = {};

async function getPlantsFromZone(zone: IDZone) {
  const zoneId = zone._id;

  let pushed: Array<any>;
  let existing: Array<any>;

  if (zone.fetched > 1) {
    const plants = await DZonePlant.find({ zone: zone }).lean().exec();

    return plants.map((dzPlant) => dzPlant.plant);
  }

  const init = await getPlantsFromPage(1, zone);

  pushed = init.pushed;
  existing = init.existing;

  for (let i = 2; i <= init.total / 20; i++) {
    const plants = await getPlantsFromPage(i, zone);

    pushed = [...pushed, ...plants.pushed];
    existing = [...existing, ...plants.existing];
  }

  return [...new Set([...existing, ...pushed])];
}

async function getPlantsFromPage(page: number, zone: IDZone) {
  let zoneId = zone._id;

  const req = await axios.get(
    `https://trefle.io/api/v1/distributions/${zoneId}/plants?page=${page}&token=${token}`
  );

  const plantsR: Array<Object> = req.data.data;

  let plants = [
    ...new Map(plantsR.map((item) => [item["scientific_name"], item])).values(),
  ];

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
    let found = false;

    for (var j = 0; j < existingPlants.length; j++) {
      if (existingPlants[j].scientificName === el["scientific_name"]) {
        existing.push(existingPlants[j]);
        found = true;

        break;
      }
    }

    let plant;

    if (!found) {
      plant = {
        scientificName: el["scientific_name"],
        commonName: el["common_name"],
        imageUrl: el["image_url"],
        description: "",
      };

      let newDZonePlant = {
        zone: zoneId,
        plant: plant,
      };

      pushed.push(plant);
      pushedDZPlants.push(newDZonePlant);
    } else {
      plant = existing[existing.length - 1];
      let existingDZPlant = await DZonePlant.findOne({
        plant: plant,
        zone: zone,
      });

      if (existingDZPlant === null) {
        let newDZonePlant = {
          zone: zoneId,
          plant: existing,
        };

        pushedDZPlants.push(newDZonePlant);
      }
    }

    global[plant.scientificName] = plant;
  }

  try {
    pushed.length && (await Plant.collection.insertMany(pushed));
    pushedDZPlants.length &&
      (await DZonePlant.collection.insertMany(pushedDZPlants));
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
