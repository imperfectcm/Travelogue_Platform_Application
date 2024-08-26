export async function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        src: reader.result,
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
