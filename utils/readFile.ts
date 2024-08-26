import fs from "fs";

export default function getFileData(file: string) {
  try {
    const data = fs.readFileSync(file, "utf8");
    return data;
  } catch (err) {
    console.error("Error reading file:", err);
    return null;
  }
}
