import { FileUpdater } from "../scraper";
import skate2011 from "./manual-definitions/Fanatic_Skate_2011.json";

(async () => {
  const brandCrawler = new FileUpdater();

  // Manually add the Skate 2011
  await brandCrawler.createFileFromJson(skate2011);
})();
