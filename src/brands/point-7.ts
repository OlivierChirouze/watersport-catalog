import { FileUpdater } from "../scraper";
import salt2014 from "./manual-definitions/Point-7_Salt_2014.json";

(async () => {
  const brandCrawler = new FileUpdater();

  // Manually add Salt 2014
  await brandCrawler.createFileFromJson(salt2014);
})();
