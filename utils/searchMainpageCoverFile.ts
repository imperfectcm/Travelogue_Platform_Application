import fs from "fs";

async function searchMainpageCoverFile(dir: string) {
  let mainpageCoverImageList = [];
  // read the contents of the directory
  const files = fs.readdirSync(dir);

  // search through the files
  for (const file of files) {
    mainpageCoverImageList.push(file);
  }

  return mainpageCoverImageList;
}

export let mainpageCoverList = searchMainpageCoverFile(
  "images/image_mainpage_cover"
);
