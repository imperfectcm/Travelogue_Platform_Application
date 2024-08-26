const dropZone = document.querySelector("#drop_zone");
const dropZoneMsg = document.querySelector("#drop_zone p");
const input = document.querySelector("input");

dropZone.addEventListener("click", (e) => {
  input.click();
  input.onchange = (e) => {
    uploadSearch(e.target.files[0]);
  };
});

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
});

dropZone.addEventListener("drop", async (e) => {
  e.preventDefault();

  if (e.dataTransfer.items[0].kind != "file") {
    dropZoneMsg.textContent = "Error: Not a file";
    throw new Error("Not a file");
  }

  if (e.dataTransfer.items.length > 1) {
    dropZoneMsg.textContent = "Error: Cannot upload multiple files";
    throw new Error("Multiple Files not allowed");
  }

  const fileDrag = e.dataTransfer.files[0];

  const isFile = await new Promise((resolve) => {
    const fr = new FileReader();
    fr.onprogress = (e) => {
      if (e.loaded > 50) {
        fr.abort();
        resolve(true);
      }
    };
    fr.onload = () => {
      resolve(true);
    };
    fr.onerror = () => {
      resolve(false);
    };
    fr.readAsArrayBuffer(fileDrag);
  });

  if (!isFile) {
    dropZoneMsg.textContent = "Error: Not a file (cannot be a folder)";
    throw new Error("Couldn't read file");
  }
  // resultByGoogleVision(fileDrag[0]);

  uploadSearch(fileDrag);
});

async function uploadSearch(file) {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch("/searchRouter/googleVision", {
    method: "POST",
    body: fd,
  });

  const result = await res.json();

  if (res.status == 200) {
    dropZoneMsg.textContent = `The landmark is from country : "${result}"`;
    setTimeout(() => {
      window.location = "../?tag=" + result;
    }, "2000");
  } else {
    dropZoneMsg.textContent = result;
  }
}
