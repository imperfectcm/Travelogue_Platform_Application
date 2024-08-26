import fs from "fs";

export default function writeFile(filePath: string, content: string) {
  try {
    fs.writeFileSync(filePath, content);
    console.log("file create successfully");
  } catch (err) {
    console.error("Error writing file:", err);
  }
}
