import axios from "axios";
import { DZone } from "../../models/DistributionZone";

export default async function saveZonesInDB() {
  const minPage = 1;
  const maxPage = 37;

  for (let i = minPage; i < maxPage; i++) {
    let response = await axios.get(
      `https://trefle.io/api/v1/distributions?token=${process.env.TREFLE_API}&page=${i}`
    );

    const zones: Array<any> = response.data.data;

    zones.forEach(async (zone) => {
      let newZone = new DZone({
        _id: zone.id,
        name: zone.name,
        parent: zone.parent !== null && zone.parent.id,
        fetched: 0,
      });

      try {
        await newZone.save();
      } catch (err) {
        console.log(err);
      }
    });
  }
}
