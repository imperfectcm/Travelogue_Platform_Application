import { isHTML } from "./util/isHtml.js";
import { readFile } from "./util/readFile.js";
import { nationArray } from "./util/countries.js";
import { test } from "./util/forTest.js";

const ImageTool = window.ImageTool;
const saveBtn = document.querySelector("#save");
const output = document.querySelector("#output");
const content = document.querySelector("#editorjs");
const cancelClear = document.querySelector("#cancel-clear");
const clear = document.querySelector("#clear");
const reminder = document.querySelector("#reminder");
//create value
const title = document.querySelector("#title");
const departurDate = document.querySelector("#departure_date");
const averageExpense = document.querySelector("#average_expenditure");
const travellerCount = document.querySelector("#traveller_counts");
const travelDays = document.querySelector("#travel_dates");

//other tag
const otherTagInput = document.querySelector("#other-tags-input");
const tagListElements = document.querySelector("#tag_list");
const addOtherBtn = document.querySelector("#add-other-tag-btn");
//nation tag
const countrySelector = document.getElementById("country-selector");
const addNationTagBtn = document.getElementById("add-nation-tag-btn");
const nationListElements = document.getElementById("nation-tag-list");
//publish
const publishBtn = document.querySelector("#publish");

//Nav bar
const navbarPrivate = document.querySelector(".navbar-private");
const homePageLogedIn = document.querySelector(".nav-home-page-pr");
const userPage = document.querySelector(".nav-user-page");
const logout = document.querySelector(".nav-logout");

//cover image handle
const postImage = document.querySelector(".post-image");
const imageOverlay = document.querySelector(".overlay-upload-image");
const imageModal = document.querySelector(".modal-upload-image");
const imageModelContent = document.querySelector(
  ".upload-image-modal-content "
);
const closeImageUploadBtn = document.querySelector(
  ".upload-image-modal-close-button"
);
const previewImage = document.getElementById("preview-image");
const imageUpload = document.getElementById("image-input");
const uploadImgBtn = document.getElementById("upload-image-button");
const postImagePreview = document.getElementById("post-image-preview");

const tryClearArcticle = document.querySelector(".try-clear");
const toConfirmClear = document.querySelector(".to-confirm-clear");

// ==================== Nav bar buttons ====================

homePageLogedIn.addEventListener("click", async () => {
  window.location.href = "/";
});

userPage.addEventListener("click", async () => {
  let res = await fetch(`/auth/userInfo`);
  let response = await res.json();
  if (res.ok) {
    window.location.href = `/blog?user=${response.userInfo.id}`;
  }
});

logout.addEventListener("click", async () => {
  let res = await fetch(`/auth/logout`, {
    method: "POST",
  });
  if (res.ok) {
    Swal.fire({
      icon: "success",
      title: "Logged Out Successfully",
      showConfirmButton: false,
      timer: 1500,
    }).then(() => {
      window.location.href = "/";
    });
  }
});

//const edjsParser = edjsHTML();
const parser = new edjsParser();
let editContent = "";
//set to store tags
let nationTagList = new Set();
let otherTagList = new Set();
let coverImage;

const editor = new EditorJS({
  holder: "editorjs",

  tools: {
    header: {
      class: Header,
      inlineToolbar: true,
    },

    underline: Underline,

    // paragraph: simpleDay,

    fontSize: FontSizeTool,

    list: {
      class: List,
      inlineToolbar: true,
    },

    embed: {
      class: Embed,
      inlineToolbar: true,
      config: {
        services: {
          youtube: true,
          // coub: true
        },
      },
    },

    Color: {
      class: window.ColorPlugin, // if load from CDN, please try: window.ColorPlugin
      inlineToolbar: true,
      config: {
        colorCollections: [
          "#EC7878",
          "#9C27B0",
          "#673AB7",
          "#3F51B5",
          "#0070FF",
          "#03A9F4",
          "#00BCD4",
          "#4CAF50",
          "#8BC34A",
          "#CDDC39",
          "#FFF",
        ],
        defaultColor: "#CDDC39",
        type: "text",
        customPicker: true, // add a button to allow selecting any colour
      },
    },
    Marker: {
      class: ColorPlugin, // if load from CDN, please try: window.ColorPlugin
      inlineToolbar: true,
      config: {
        defaultColor: "#FFBF00",
        type: "marker",
        icon: `<svg fill="#000000" height="200px" width="200px" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M17.6,6L6.9,16.7c-0.2,0.2-0.3,0.4-0.3,0.6L6,23.9c0,0.3,0.1,0.6,0.3,0.8C6.5,24.9,6.7,25,7,25c0,0,0.1,0,0.1,0l6.6-0.6 c0.2,0,0.5-0.1,0.6-0.3L25,13.4L17.6,6z"></path> <path d="M26.4,12l1.4-1.4c1.2-1.2,1.1-3.1-0.1-4.3l-3-3c-0.6-0.6-1.3-0.9-2.2-0.9c-0.8,0-1.6,0.3-2.2,0.9L19,4.6L26.4,12z"></path> </g> <g> <path d="M28,29H4c-0.6,0-1-0.4-1-1s0.4-1,1-1h24c0.6,0,1,0.4,1,1S28.6,29,28,29z"></path> </g> </g></svg>`,
      },
    },

    image: {
      class: ImageTool,
      inlineToolbar: true,
      config: {
        uploader: {
          uploadByFile: async (file) => {
            // Handle file upload client-side
            // You can use a library like FileReader to read the file
            // and store it in-memory or in the browser's localStorage
            const fileData = await readFile(file);
            return {
              success: 1,
              file: { url: fileData.src },
            };
          },
        },
      },
    },
  },

  onReady: async () => {
    const editorBoared = document.querySelector(".codex-editor__redactor");
    editorBoared.style.setProperty("pointer-events", "none");

    editorBoared.style.opacity = 0.5;
    editorBoared.tabindex = -1;
    // editor.configuration.set("placeholder", "Enter your content here");

    title.addEventListener("input", function () {
      if (title.value.trim() !== "") {
        editorBoared.style.setProperty("pointer-events", "auto");
        editorBoared.style.opacity = 1;
        editorBoared.tabindex = 1;
        reminder.style.opacity = 0;
      }
    });

    if (isHTML(editContent)) {
      await editor.blocks.renderFromHTML(htmlContent);
    } else {
      return;
    }
  },

  autofocus: false,
  placeholder: "write your story...",
  data: {},
});

// Function to add a tag to the list
function addTag(tag, set, parentElement) {
  if (!set.has(tag)) {
    set.add(tag);

    // create a base for new tag
    const tagMark = document.createElement("div");
    tagMark.classList.add("tag-mark");
    // create a new tag
    const tagElement = document.createElement("div");
    tagElement.textContent = tag;
    tagElement.classList.add("tag");
    // Create a delete button element
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.classList.add("delete-btn");

    // Add a click event listener to the delete button
    deleteButton.addEventListener("click", () => {
      removeSet(tag, set);
      tagMark.remove();
    });

    // Append the delete button to the tag element
    tagElement.appendChild(deleteButton);
    tagMark.appendChild(tagElement);

    parentElement.appendChild(tagMark);
  }
}

function removeSet(tag, set) {
  // Remove the tag from the Set
  set.delete(tag);
}

//add other tag
addOtherBtn.addEventListener("click", () => {
  const tag = otherTagInput.value.trim();
  if (tag) {
    addTag(tag, otherTagList, tagListElements);
    otherTagInput.value = "";
  } else {
    console.log("please fill in something");
  }
});
//add nation tag
addNationTagBtn.addEventListener("click", () => {
  const tag = countrySelector.value;
  if (tag) {
    addTag(tag, nationTagList, nationListElements);
    countrySelector.value = "";
  } else {
    console.log("please fill in something");
  }
});

function createCountrySelector(countryList) {
  // Loop through the countryList array and create <option> elements
  countryList.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    countrySelector.appendChild(option);
  });
}

travelDays.addEventListener("change", template);
function template() {
  // Clear the existing blocks
  console.log(this.value);
  if (this.value < 1) {
    alert("must be large than 1");
    return;
  }

  if (this.value > 10) {
    alert("must be less than 10");
    return;
  }

  // Dynamically create and insert the new blocks
  for (let i = 1; i <= parseInt(this.value); i++) {
    editor.blocks.insert("header", {
      text: `𖤓 Day ${i}`,
      level: 2,
    });
    editor.blocks.insert("paragraph", {
      text: `⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯⋯`,
    });

    editor.blocks.insert("paragraph", {
      text: `This is the content for Day ${i}.`,
    });
  }
  travelDays.removeEventListener("change", template);
}

tryClearArcticle.addEventListener("click", async () => {
  imageOverlay.classList.remove("hidden");
  toConfirmClear.classList.remove("hidden");
});

cancelClear.addEventListener("click", async () => {
  imageOverlay.classList.add("hidden");
  toConfirmClear.classList.add("hidden");
});

clear.addEventListener("click", async () => {
  editor.blocks.clear();
  imageOverlay.classList.add("hidden");
  toConfirmClear.classList.add("hidden");
});

publishBtn.addEventListener("click", () => {
  createAritlce("public");
});

saveBtn.addEventListener("click", () => {
  createAritlce("private");
});

async function createAritlce(status) {
  // title is necessary for publish (string required)

  if (title.value.trim() == "") {
    Swal.fire({
      title: "Title missed",
      text: "Title is necessary for publish",
      icon: "question",
    });

    return;
  } else console.log(title.value);
  // the departure date (date or null)
  const date = departurDate.value ? departurDate.value : null;
  // the count of travel day  (number or null)
  let dayCount;
  if (travelDays.value) {
    dayCount = Number(travelDays.value);
    if (!Number.isInteger(dayCount) || dayCount < 0) {
      Swal.fire({
        title: "Integer needed",
        text: "An integer number is necessary for travelDays",
        icon: "error",
      });
      return;
    }
  } else {
    dayCount = null;
  }
  // the expenditure (number or null)
  let averageExpenditure;
  if (averageExpense.value) {
    averageExpenditure = Number(averageExpense.value);
    if (!Number.isInteger(averageExpenditure) || averageExpenditure < 0) {
      Swal.fire({
        title: "Integer needed",
        text: "An integer number is necessary for averageExpense",
        icon: "error",
      });
      return;
    }
  } else {
    averageExpenditure = null;
  }
  // the travller count (number or null)
  let travelCount;
  if (travellerCount.value) {
    travelCount = Number(travellerCount.value);
    if (!Number.isInteger(travelCount) || travelCount < 0) {
      Swal.fire({
        title: "Integer needed",
        text: "An integer number is necessary for travller count",
        icon: "error",
      });
      return;
    }
  } else {
    travelCount = null;
  }
  // get the object dat of editor
  const editObj = await editor.save();

  if (editObj.blocks.length == 0 || test(editObj.blocks[0].data.text?.trim())) {
    Swal.fire({
      title: "Empty content",
      text: "Please write something in the blog",
      icon: "warning",
    });
    return;
  }

  // get the html data of editor
  const editHtml = parser.parse(editObj);
  let otherTags;
  let nationTags;
  otherTags = otherTagList.size == 0 ? null : [...otherTagList];
  nationTags = nationTagList.size == 0 ? null : [...nationTagList];

  const jsonData = {
    title: title.value,
    departureDate: date,
    travelDays: dayCount,
    travellerCounts: travelCount,
    averageExpenditure: averageExpenditure,
    content_json: editObj,
    content_html: editHtml,
    status: status,
    nationTag: nationTags,
    otherTag: otherTags,
  };
  console.table(jsonData);
  publishApi(jsonData);
}

//loop the nation array to create selector
createCountrySelector(nationArray);

//fetch data
async function publishApi(jsonData) {
  try {
    const response = await fetch("/post/publishPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    if (response.status == 400) {
      Swal.fire({
        title: "Please log in for creating post ",
        text: "Please log in for creating post",
        icon: "warning",
      });
      return;
    }
    if (response.status == 413) {
      Swal.fire({
        title: "UpLoad Post pass the max ",
        text: "Please reduce the size of upload posts",
        icon: "warning",
      });
      return;
    } else if (!response.ok) {
      Swal.fire({
        title: "Internal error",
        text: "Please refresh the page, sorry for inconvenience caused..",
        icon: "warning",
      });
      return;
    }

    const responseData = await response.json();
    const postId = ~~responseData.postId;

    try {
      apiUploadImage(postId);

      Swal.fire({
        title: "Creating Post...",
        showCancelButton: false,
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();

          setTimeout(() => {
            Swal.fire({
              icon: "success",
              title: "Post Created Successfully!",
              showConfirmButton: false,
              timer: 1500,
            }).then(() => {
              window.location.href = `/post_page?id=${postId}`;
            });
          }, 2000);
        },
      });
    } catch (err) {
      console.error("Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

//Preview cover image
postImage.addEventListener("dblclick", showModal);
closeImageUploadBtn.addEventListener("click", hideModal);
closeImageUploadBtn.addEventListener("click", uploadImage);
imageUpload.addEventListener("change", uploadImage);
uploadImgBtn.addEventListener("click", () => {
  imageOverlay.classList.add("hidden");
  imageModal.classList.add("hidden");
});

function showModal() {
  imageOverlay.classList.remove("hidden");
  imageModal.classList.remove("hidden");
}

let temBg = "/mainpage_1.jpg";
// Hide the modal and overlay
function hideModal() {
  imageOverlay.classList.add("hidden");
  imageModal.classList.add("hidden");
  postImagePreview.src = temBg;
  previewImage.src = temBg;
}

function uploadImage(event) {
  coverImage = event.target.files[0];

  let imageFile = event.target.files?.[0];
  if (imageFile && !imageFile.type.match(/image\/(jpeg|png|gif)/)) {
    Swal.fire({
      title: "Wrong file format",
      text: "only accept img file format",
      icon: "warning",
    });
    event.target.value = "";
    return;
  } else {
    let reader = new FileReader();
    reader.onload = function (e) {
      previewImage.src = e.target.result;
      postImagePreview.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  }
}

async function apiUploadImage(postId) {
  if (coverImage) {
    const formData = new FormData();
    formData.append("image", coverImage);
    formData.append("postId", postId);

    // api logic
    try {
      const response = await fetch("/post/updatePost", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        console.log("Upload image success");
      }
    } catch (err) {
      console.log(err);
      return;
    }
  }
}
