import fs from "fs";
import { Product } from "../src";
import path from "path";
import { ProductToWrite } from "../src/file-writer";
import { argv } from "yargs";

export class FileRenamer {
  constructor(private filePath: string) {
  }

  async rename() {
    const product = JSON.parse((await fs.promises.readFile(this.filePath)).toString()) as Product<unknown>;
    const fileName = ProductToWrite.getProductFileName(product);
    const dirName = path.dirname(this.filePath);
    const newPath = path.join(dirName, fileName);
    if (newPath !== this.filePath) {
      console.log("Rename", path.basename(this.filePath), path.basename(newPath));
      await fs.promises.rename(this.filePath, newPath);
    }
  }
}

(async () => {

  var { argv } = require("yargs");

  const files = argv.dir ? (await fs.promises.readdir(argv.dir)).map(f => path.join(argv.dir, f))
    : [argv.file];

  await Promise.all(files.map(file => new FileRenamer(file).rename()));
})();
