//private dom element
import { nationArray } from "./util/countries.js";
import { formatDate } from "./util/formatDate.js";
import { readFile } from "./util/readFile.js";
import { test } from "./util/forTest.js";

const ImageTool = window.ImageTool;
const editorJs = document.getElementById("editorjs2");

const rightHeadSection = document.querySelector(".private-and-collect-btn");

const upLoadReminder = document.querySelector(".change-cover-reminder");

const privateHtml = document.querySelector(".html_content");
const privateProfile = document.querySelector("#author_profile");

const privateUsername = document.querySelector("#username");
let temparyBg;

// const privatLivingLocation = document.querySelector(
//   "#living_location"
// );

const privatCaption = document.querySelector("#caption");

const privateTitle = document.querySelector(".post-title");

const travelDetailUpperLayer = document.querySelector(
  ".travel-detail-upper-layer"
);

const travelDetailLowerLayer = document.querySelector(
  ".travel-detail-lower-layer"
);

const privateTag = document.querySelector(".tag-list");

// for edit post image
const privateImageBg = document.querySelector("#post-image-preview");

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

const navbarPublic = document.querySelector(".navbar-public");
const navbarPrivate = document.querySelector(".navbar-private");
const homePage = document.querySelector(".nav-home-page");
const homePageLogedIn = document.querySelector(".nav-home-page-pr");
const login = document.querySelector(".nav-login");
const registration = document.querySelector(".nav-registration");
const userPage = document.querySelector(".nav-user-page");
const logout = document.querySelector(".nav-logout");

// for edit title

const titleOverlay = document.querySelector(".overlay-edit-title");
const titleModal = document.querySelector(".modal-title");
const titleInput = document.querySelector(".title-edit-input");
const editTitleBtn = document.querySelector(".edit-title-btn");
const editCloseTitleBtn = document.querySelector(".edit-title-close-button");

// for edit tag
const editTagBtn = document.querySelector("#edit");
const tagOverlay = document.querySelector(".overlay-update-tags");
const tagModal = document.querySelector(".update-tags-modal ");
const tagUpdateCloseBtn = document.querySelector(".update-tags-modal-close");
const departureInput = document.querySelector("#departure_date");
const travelDatesInput = document.querySelector("#travel_dates");
const averageExpenseInput = document.querySelector("#average_expenditure");
const travellerCountsInput = document.querySelector("#traveller_counts");
const nationTagList = document.querySelector("#nation-tag-list");
const otherTagList = document.querySelector("#tag_list");
const otherTagInput = document.querySelector("#other-tags-input");
const otherTagBtn = document.querySelector("#add-other-tag-btn");
const nationInput = document.querySelector("#country-selector ");
const nationTagBtn = document.querySelector("#add-nation-tag-btn");
const editOptionalBtn = document.querySelector(".edit-option-info");
const editorContainer = document.querySelector(".editor-container ");
//dom element
const title = document.querySelector(".title");

const titleReminder = document.querySelector(".change-post-title-reminder");
const reminder = document.querySelector(".change-post-content-reminder");

let nationTagSet = new Set();
let otherTagListSet = new Set();

// counter for the editor js
let editorTrigger = 0;
// counter for the editor save button
let editorSaveBtn;

// editor js
let editor;

// public dom element

// get param id
let params = new URLSearchParams(window.location.search);
let postId = params.get("id");
// for hanlding session and indentify user is author or not
let postSession;

//fetch data

// logic to decide if user is loggin or not and the post id belong to the corresponding user id
// expect return true false value
async function checkSessionPost() {
  const result = await checkSessionApi();
  // check login or not
  if (!result.loggedIn) {
    postSession = "unlogin";
    return;
  } else {
    const data = await checkSessionMatchApi();
    if (data.match) {
      postSession = "login-private";
    } else {
      postSession = "login-public";
    }
  }
}

// ==================== Search tag ====================

window["searchTag"] = searchTag;
async function searchTag(tag) {
  window.location.href = `/?tag=${tag}`;
}

// ==================== Nav bar buttons ====================

homePage.addEventListener("click", async () => {
  window.location.href = "/";
});

homePageLogedIn.addEventListener("click", async () => {
  window.location.href = "/";
});

login.addEventListener("click", async () => {
  window.location.href = "/login";
});

registration.addEventListener("click", async () => {
  window.location.href = "/register";
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

// ==================== Change navbar ====================

async function changeNavBar() {
  let res = await fetch(`/auth/userInfo`);
  let response = await res.json();

  if (res.ok) {
    if (response.loggedIn) {
      navbarPrivate.classList.remove("hidden");
      // navbarPublic.classList.add("hidden");
      return;
    } else {
      navbarPublic.classList.remove("hidden");
      // navbarPrivate.classList.add("hidden");
      return;
    }
  }
}

changeNavBar();

const commentContainer = document.querySelector(".comment_container");
const commentInput = document.querySelector("#comment-input");
const commentSession = document.querySelector(".comments_session");

// load html data
async function loadData() {
  // first check sessin logic
  await checkSessionPost();

  if (postSession == "login-private") {
    await loadUI();
    editPost();
    commentInput.classList.remove("hidden");
    commentInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        createCommentApi();
      }
    });
  } else if (postSession == "login-public") {
    // logic for public page
    console.log("writing logic for public page");
    await loadUI();
    const result = await checkCollectionApi();
    reminder.style.display = "none";
    titleReminder.style.display = "none";
    upLoadReminder.style.display = "none";
    commentInput.classList.remove("hidden");
    commentInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        createCommentApi();
      }
    });
    const isCollected = result.collected;
    editTagBtn.style.display = "none";
    if (isCollected) {
      console.log("the post is already collected ");
      const collectBtn = document.createElement("button");
      collectBtn.textContent = "Cancel Collect";
      collectBtn.classList.add("collect_post");
      collectBtn.addEventListener("click", cancelCollectionApi);
      rightHeadSection.prepend(collectBtn);
    } else {
      console.log("the post is not collected yet ");
      const collectBtn = document.createElement("button");
      collectBtn.textContent = "Collect";
      collectBtn.classList.add("collect_post");
      collectBtn.addEventListener("click", collectionApi);
      rightHeadSection.prepend(collectBtn);
    }

    // const collectBtn = document.createElement("button");

    // collectBtn.textContent = "Collect";
    // collectBtn.classList.add("collect_post");
    // rightHeadSection.prepend(collectBtn);

    // diable the cancel publish & publish btn function
    const cancelButton = document.querySelector("#cancel-publish");
    if (cancelButton) {
      cancelButton.style.display = "none";
    }

    const publishButton = document.querySelector("#publish");
    if (publishButton) {
      publishButton.style.display = "none";
    }
  } else if (postSession == "unlogin") {
    console.log("for non login users................");
    await loadUI();
    titleReminder.style.display = "none";
    reminder.style.display = "none";
    upLoadReminder.style.display = "none";
    // diable the cancel publish & publish btn function
    const cancelButton = document.querySelector("#cancel-publish");
    if (cancelButton) {
      cancelButton.style.display = "none";
    }

    const publishButton = document.querySelector("#publish");
    if (publishButton) {
      publishButton.style.display = "none";
    }
    editTagBtn.style.display = "none";
  }
}

async function loadUI() {
  const { authorProfile, collectionCount, nationTag, otherTag, post } =
    await privatePostApi(~~postId);
  const html = await privateHtmlApi(~~postId);
  const comments = (await commentsApi()).data;
  // { comment, created_a, profile_pic, username }
  const commentHtml = comments.map(
    (comment) => ` 
<div class="comment_item">
  <div>
    <img
      class="comment_author_profile comment_author_profile_cropper"
      src=/${comment.profile_pic}
      alt="image"
    />
  </div>
  <div class="comment_right_content">
    <div class="comment_author_name">${comment.username}</div>
    <div class="comment_content">${comment.comment}</div>
    <div class="comment_create_time">${new Date(comment.created_at)
        .toISOString()
        .slice(0, 10)}</div>
  </div>
</div>
`
  )
    .join("");

  commentContainer.innerHTML = commentHtml;

  privateHtml.innerHTML = html;

  privateProfile.src = "/" + authorProfile[0].profile_pic;
  //
  if (post.status == "public") {
    rightHeadSection.innerHTML = `
    <button id="cancel-publish">Set Private</button>
    <div class="collection"><span class="fa fa-star checked"> ${collectionCount}</span>
  `;
  } else if (post.status == "private") {
    rightHeadSection.innerHTML = `
    <button id="publish">Set Public</button>
    <div class="collection"><span class="fa fa-star checked"> ${collectionCount}</span>
  `;
  }

  const setPrivateBtn = document.querySelector("#cancel-publish");
  const setPublicBtn = document.querySelector("#publish");

  privateUsername.textContent = "Traveller: " + authorProfile[0].username;
  // privatLivingLocation.textContent = authorProfile[0].living_location
  //   ? authorProfile[0].living_location
  //   : "";
  privatCaption.textContent = authorProfile[0].caption
    ? authorProfile[0].caption
    : "";
  const otherTagDOM = otherTag
    .map(
      (tag) =>
        `<span onclick="searchTag('${tag.tag_name}')">#${tag.tag_name}</span>`
    )
    .join("");

  // nation tag
  const nationDom = nationTag
    .map(
      (
        tag
      ) => `<span onclick="searchTag('${tag.tag_name}')">#${tag.tag_name}</span>
`
    )
    .join("");

  titleInput.value = post?.title;
  const imageBg = post?.post_image;
  temparyBg = post?.post_image;

  const departureDate = new Date(post?.departure_date)
    .toISOString()
    .slice(0, 10);
  const travelDays = post?.travel_days;
  const travellerCounts = post?.traveller_counts;
  const expenditure = post?.average_expenditure;
  if (imageBg) {
    privateImageBg.src = "/" + imageBg;
    previewImage.src = "/" + imageBg;
  }
  if (departureDate) {
    let departureElement = document.createElement("span");
    departureElement.id = "departure_date";
    departureElement.textContent = `Departure Date : ${departureDate} `;
    travelDetailUpperLayer.append(departureElement);
  }
  if (travelDays) {
    let travleDaysElement = document.createElement("span");
    travleDaysElement.id = "travel_days";
    travleDaysElement.textContent = `Travel Dates : ${travelDays} `;
    travelDetailUpperLayer.append(travleDaysElement);
  }
  if (expenditure) {
    let averageExpenditureElement = document.createElement("span");
    averageExpenditureElement.id = "average_expenditure";
    averageExpenditureElement.textContent = `Expense Per Person : $${expenditure} `;
    travelDetailLowerLayer.append(averageExpenditureElement);
  }
  if (travellerCounts) {
    let travellerCountsElement = document.createElement("span");
    travellerCountsElement.id = "traveller_counts";
    travellerCountsElement.textContent = `No. Of Travellers : ${travellerCounts} `;
    travelDetailLowerLayer.append(travellerCountsElement);
  }

  privateTitle.textContent = post.title;
  privateTag.innerHTML = nationDom;
  privateTag.innerHTML += otherTagDOM;
}

function editPost() {
  const setPrivateBtn = document.querySelector("#cancel-publish");
  const setPublicBtn = document.querySelector("#publish");

  if (setPrivateBtn) {
    setPrivateBtn.addEventListener("click", async () => {
      console.log("set private");
      await setPrivateApi();
      await Swal.fire({
        title: "set Private successfully ",
        text: "set Private successfully",
        icon: "success",
      });
      window.location.reload();
    });
  }

  if (setPublicBtn) {
    setPublicBtn.addEventListener("click", async () => {
      console.log("set public");
      await setPublicApi();
      await Swal.fire({
        title: "set Public successfully ",
        text: "set Public successfully",
        icon: "success",
      });
      window.location.reload();
    });
  }
  //add other tag
  otherTagBtn.addEventListener("click", () => {
    const tag = otherTagInput.value;
    if (tag.trim() == "") {
      return;
    }
    if (!otherTagListSet.has(tag)) {
      otherTagListSet.add(tag);

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
        tagMark.remove();
        otherTagListSet.delete(tag);
      });

      // Append the delete button to the tag element
      tagElement.appendChild(deleteButton);
      tagMark.appendChild(tagElement);

      otherTagList.appendChild(tagMark);
      otherTagInput.value = "";
    }
  });

  //add nation tag
  nationTagBtn.addEventListener("click", () => {
    const tag = nationInput.value;
    if (tag.trim() == "") {
      return;
    }
    if (!nationTagSet.has(tag)) {
      nationTagSet.add(tag);

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
        tagMark.remove();
        nationTagSet.delete(tag);
      });

      // Append the delete button to the tag element
      tagElement.appendChild(deleteButton);
      tagMark.appendChild(tagElement);

      nationTagList.appendChild(tagMark);
    }
  });

  //edit image
  const changeCoverReminder = document.querySelector(".change-cover-reminder");
  changeCoverReminder.addEventListener("dblclick", () => {
    showModal(imageOverlay, imageModal);
  });
  privateImageBg.addEventListener("dblclick", () => {
    showModal(imageOverlay, imageModal);
  });
  closeImageUploadBtn.addEventListener("click", () => {
    hideModal(imageOverlay, imageModal);
    previewImage.src = "/" + temparyBg;
    privateImageBg.src = "/" + temparyBg;
    imageUpload.value = "";
    // temparyBg
  });
  closeImageUploadBtn.addEventListener("click", uploadImage);
  imageUpload.addEventListener("change", uploadImage);
  uploadImgBtn.addEventListener("click", apiUploadImage);
  //edit title
  const changeTitleReminder = document.querySelector(
    ".change-post-title-reminder"
  );
  changeTitleReminder.addEventListener("dblclick", () => {
    showModal(titleOverlay, titleModal);
  });
  privateTitle.addEventListener("dblclick", () => {
    showModal(titleOverlay, titleModal);
  });

  editTitleBtn.addEventListener("click", apiEditTitle);

  editCloseTitleBtn.addEventListener("click", () => {
    hideModal(titleOverlay, titleModal);
    // edit tag and optional infor
  });

  // edit load editor js

  privateHtml.addEventListener("dblclick", async () => {
    try {
      commentSession.style.display = "none";
      //edit save
      editorSaveBtn = document.querySelector("#save_editor");
      editorSaveBtn.addEventListener("click", apiSaveEditor);
      // set up editor js
      const json = await privateJsonApi(postId);
      privateHtml.classList.add("hidden");
      editorContainer.style.display = "flex";

      if (editorTrigger == 0) {
        editor = new EditorJS({
          holder: "editorjs2",

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
            console.log("Editor.js is ready to work!");
          },

          autofocus: false,
          placeholder: "write your story...",
          data: json,
        });
      }
      editorTrigger++;
    } catch (err) {
      console.err(err);
    }
  });

  editorJs.addEventListener("dblclick", () => {
    commentSession.style.display = "flex";
    privateHtml.classList.remove("hidden");
    editorContainer.style.display = "none";
    editorSaveBtn.removeEventListener("click", apiSaveEditor);
  });

  //  for add the tags
  editTagBtn.addEventListener("click", async () => {
    showModal(tagOverlay, tagModal);
    createCountrySelector(nationArray);
    const { nationTag, otherTag, post } = await privatePostApi(~~postId);

    departureInput.value = new Date(post.departure_date)
      .toISOString()
      .slice(0, 10);

    travelDatesInput.value = post.travel_days;
    averageExpenseInput.value = post.average_expenditure;
    travellerCountsInput.value = post.traveller_counts;

    // update set according to the fetched data
    otherTag.forEach((tag) => otherTagListSet.add(tag.tag_name));

    const otherTagArray = Array.from(otherTagListSet);

    otherTagArray.forEach((tag) => {
      const tagMark = document.createElement("div");
      tagMark.classList.add("tag-mark");
      const tagElement = document.createElement("div");
      tagElement.textContent = tag;
      tagElement.classList.add("tag");
      // Create a delete button element
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "❌";
      deleteButton.classList.add("delete-btn");

      // Add a click event listener to the delete button
      deleteButton.addEventListener("click", () => {
        otherTagListSet.delete(tag);
        tagMark.remove();
      });

      // Append the delete button to the tag element
      tagElement.appendChild(deleteButton);
      tagMark.appendChild(tagElement);
      otherTagList.appendChild(tagMark);
    });

    // nation tag
    nationTag.forEach((tag) => nationTagSet.add(tag.tag_name));
    const nationTagArray = Array.from(nationTagSet);
    nationTagArray.forEach((tag) => {
      const tagMark = document.createElement("div");
      tagMark.classList.add("tag-mark");
      const tagElement = document.createElement("div");
      tagElement.textContent = tag;
      tagElement.classList.add("tag");
      // Create a delete button element
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "❌";
      deleteButton.classList.add("delete-btn");

      // Add a click event listener to the delete button
      deleteButton.addEventListener("click", () => {
        nationTagSet.delete(tag);
        tagMark.remove();
      });

      // Append the delete button to the tag element
      tagElement.appendChild(deleteButton);
      tagMark.appendChild(tagElement);
      nationTagList.appendChild(tagMark);
    });

    ////////////////////////////////////////////////////////////////////////////////
  });

  // for closing the edit tag modal and clear the set data for tags
  tagUpdateCloseBtn.addEventListener("click", () => {
    hideModal(tagOverlay, tagModal);
    otherTagList.innerHTML = "";
    nationTagList.innerHTML = "";
    otherTagListSet.clear();
    nationTagSet.clear();
  });

  editOptionalBtn.addEventListener("click", () => {
    console.log("edit starting now...");
    //logic for departurDate
    const date = departureInput.value ? departureInput.value : null;
    //logic for travel dates

    let dayCount;
    if (travelDatesInput.value) {
      dayCount = Number(travelDatesInput.value);
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
    //logic for average expense
    let averageExpenditure;
    if (averageExpenseInput.value) {
      averageExpenditure = Number(averageExpenseInput.value);
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
    if (travellerCountsInput.value) {
      travelCount = Number(travellerCountsInput.value);
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

    // logic for tags
    let otherTags;
    let nationTags;
    otherTags = otherTagListSet.size == 0 ? null : [...otherTagListSet];
    nationTags = nationTagSet.size == 0 ? null : [...nationTagSet];

    const jsonData = {
      postId,
      userId: 1,
      departureDate: date,
      travelDays: dayCount,
      travellerCounts: travelCount,
      averageExpenditure: averageExpenditure,
      nationTag: nationTags,
      otherTag: otherTags,
    };
    updateOptionInforApi(jsonData);
  });
}

// logic for model upload image//
// Show the modal and overlay
function showModal(overlay, modal) {
  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");
}

// Hide the modal and overlay
function hideModal(overlay, modal) {
  overlay.classList.add("hidden");
  modal.classList.add("hidden");
}

//api
async function apiEditTitle(event) {
  if (!titleInput.value.trim()) {
    Swal.fire({
      title: "Title error",
      text: "Please wirte title for post",
      icon: "question",
    });
    return;
  } else {
    try {
      const jsonData = {
        updateTitle: titleInput.value,
        postId: ~~postId,
      };
      const response = await fetch("/post/updateTitle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        await Swal.fire({
          title: "Upload title success",
          text: "Upload title success",
          icon: "success",
        });
        window.location.reload();
      }
    } catch (err) { }
  }
}

function uploadImage(event) {
  console.log("image upload");
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
      privateImageBg.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  }

  const formData = new FormData();
  formData.append("image", imageFile);
}

loadData();

// for loading nation selector
function createCountrySelector(countryList) {
  // Loop through the countryList array and create <option> elements
  countryList.forEach((country) => {
    const option = document.createElement("option");
    option.value = country;
    option.textContent = country;
    nationInput.appendChild(option);
  });
}

// api
async function apiSaveEditor() {
  console.log("saving start");
  const parser = new edjsParser();
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
  const jsonData = {
    // hard code for user id //
    postId,
    json: editObj,
    html: editHtml,
  };
  try {
    const response = await fetch("/post//updateEditor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
  } catch (err) {
    console.log(err);
    return;
  }
  await Swal.fire({
    title: "Update Content success",
    text: "Update Content success",
    icon: "success",
  });
  window.location.reload();
}

async function apiUploadImage() {
  const imageData = imageUpload.files[0];
  if (!imageData) {
    Swal.fire({
      icon: "error",
      title: "Please provide image for upload  ",
      text: "Something went wrong!",
    });
    imageOverlay.classList.add("hidden");
    imageModal.classList.add("hidden");

    return;
  }

  const formData = new FormData();
  formData.append("image", imageData);
  formData.append("postId", ~~postId);

  // api logic
  try {
    const response = await fetch("/post/updatePost", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      await Swal.fire({
        title: "Upload image success",
        text: "Upload image success",
        icon: "success",
      });
      window.location.reload();
    }
  } catch (err) {
    console.log(err);
    return;
  }
}
async function privatePostApi(postId) {
  try {
    const response = await fetch("/post/getPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ postId }),
    });

    const data = await response.json();
    return data.resultData;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function privateHtmlApi(postId) {
  try {
    const response = await fetch("/post/getPostHtml", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: postId }),
    });

    const data = await response.json();

    privateHtml.innerHTML = data.data;
    return data.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function privateJsonApi(postId) {
  try {
    const response = await fetch("/post/getPostJson", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: postId }),
    });

    const data = await response.json();

    return data.data;
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function updateOptionInforApi(jsonData) {
  try {
    const response = await fetch("/post/updattags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
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
    const postId = responseData.postId;
    Swal.fire({
      title: "Updating Post...",
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
            window.location.reload();
          });
        }, 2000);
      },
    });
    console.log(responseData);
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

async function setPrivateApi() {
  const jsonData = {
    postId,
  };

  try {
    const response = await fetch("/post/setPrivate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    const result = await response.json();
    console.log("setPrivate", result);
    return result;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function setPublicApi() {
  const jsonData = {
    postId,
  };
  try {
    const response = await fetch("/post/setPublic", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    const result = await response.json();
    console.log("setPublic", result);
    return result;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function checkCollectionApi() {
  const jsonData = {
    postId,
  };
  try {
    const response = await fetch("/post/checkCollection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function collectionApi() {
  console.log("collection start now ..... ");
  const jsonData = {
    postId,
  };
  try {
    const response = await fetch("/post/collectPost", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    const result = await response.json();
    console.log(result);
    await Swal.fire({
      title: "Successfuily add into collection",
      text: "Successfuily add into collection",
      icon: "success",
    });
    window.location.reload();
  } catch (err) {
    Swal.fire({
      title: "Failure add into collection",
      text: "Please refresh and try it again",
      icon: "warning",
    });
    console.log(err);
    return;
  }
}

async function cancelCollectionApi() {
  console.log("cancel collection now....");

  const jsonData = {
    postId,
  };
  try {
    const response = await fetch("/post/cancelCollection", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    const result = await response.json();
    console.log(result);
    await Swal.fire({
      title: "Successfuily cancel collection",
      text: "Successfuily cancel collection",
      icon: "success",
    });
    window.location.reload();
  } catch (err) {
    Swal.fire({
      title: "Failure to cancel collection",
      text: "Please refresh and try it again",
      icon: "warning",
    });
    console.log(err);
    return;
  }
}

// for session  handling

async function checkSessionApi() {
  try {
    const response = await fetch("/auth/userInfo", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Add any necessary authentication headers here
      },
    });

    if (response.ok) {
      const userData = await response.json();

      return userData;
    } else {
      console.error("Error fetching user information:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// for session match postId
async function checkSessionMatchApi() {
  const jsonData = {
    postId,
  };

  try {
    const response = await fetch("/post/checkSessionMatch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    if (response.ok) {
      const data = await response.json();

      return data;
    } else {
      console.error("Error fetching user information:", response.status);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

// get comments
async function commentsApi() {
  const jsonData = {
    postId,
  };

  try {
    const response = await fetch("/post/getComments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    const result = await response.json();

    return result;
  } catch (err) {
    console.log(err);
    return;
  }
}

async function createCommentApi() {
  console.log("create comments now ....");
  const content = commentInput.value;
  if (content.trim() == "") {
    // Swal.fire({
    //   title: "Integer needed",
    //   text: "An integer number is necessary for travelDays",
    //   icon: "error",
    //   stopKeydownPropagation: false,
    // });
    alert("please write something for comments");
    return;
  }
  const jsonData = {
    postId,
    comment: content,
  };
  try {
    const response = await fetch("/post/createComment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });
    const result = await response.json();
    console.log("comments", result);
    await Swal.fire({
      title: "create comment successfully ",
      text: "create comment successfully ",
      icon: "success",
    });
    window.location.reload();
  } catch (err) {
    console.log(err);
  }
}
