var searchParams = new URLSearchParams(window.location.search);
const userId = searchParams.get("user");

const navbarPublic = document.querySelector(".navbar-public");
const navbarPrivate = document.querySelector(".navbar-private");
const homePage = document.querySelector(".nav-home-page");
const homePageLogedIn = document.querySelector(".nav-home-page-pr");
const login = document.querySelector(".nav-login");
const registration = document.querySelector(".nav-registration");
const userPage = document.querySelector(".nav-user-page");
const logout = document.querySelector(".nav-logout");

const blogImagePreview = document.querySelector("#blog-image-preview");
const profilePic = document.querySelector(".userpage-profile-pic img");

//cover image handle
const blogImage = document.querySelector(".blog-image");
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

const authorName = document.querySelector(".content-username");
const authorCaption = document.querySelector(".content-caption");
const authorLivingLocation = document.querySelector(".content-from");

const myPostBtn = document.querySelector(".mypost-btn");
const collectBtn = document.querySelector(".collect-btn");
const createBtn = document.querySelector(".create-btn");

const postListArea = document.querySelector(".post-list-area");
const loader = document.querySelector(".loader-container");

let pageCount = 1;
let haveMorePosts = true;
let noMorePostReminder = false;
let isLoadingPosts = false;
let sortingOption = "created_at";
let sortingDirecction = "desc";

let temparyBg;
let temparyProlfile;

// ==================== Display main page ====================

async function displayUserpage() {
  await fetchUserBlog(userId);
  await getAllPosts();
  await changeNavBar();
}

displayUserpage();

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

// ==================== Display user info ====================

async function fetchUserBlog(userId) {
  let res = await fetch("/auth/userInfo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId: userId }),
  });

  let response = await res.json();

  if (res.ok) {
    loadBlogUI(response.result);
  }
}

function loadBlogUI(fetchData) {
  if (fetchData.blog_image) {
    blogImagePreview.src = "/" + fetchData.blog_image;
    previewImage.src = "/" + fetchData.blog_image;
    temparyBg = "/" + fetchData.blog_image;
  } else {
    blogImagePreview.src = "/mainpage_1.jpg";
    previewImage.src = "/mainpage_1.jpg";
  }

  if (fetchData.profile_pic) {
    profilePic.src = "/" + fetchData.profile_pic;
    previewProfile.src = "/" + fetchData.profile_pic;
    temparyProlfile = "/" + fetchData.profile_pic;
  } else {
    profilePic.src = "/default-icon.jpg";
    profilePic.src = "/" + fetchData.profile_pic;
  }

  authorName.textContent = fetchData.username;
  nameInput.value = fetchData.username;
  temName = fetchData.username;

  if (fetchData.living_location) {
    authorLivingLocation.textContent = fetchData.living_location;
    locationInput.value = fetchData.living_location;
    temLocation = fetchData.living_location;
  }

  if (fetchData.caption) {
    authorCaption.textContent = fetchData.caption;
    captionInput.value = fetchData.caption;
    temCaption = fetchData.caption;
  }
}

// ==================== Get posts about user ====================

async function getAllPosts() {
  if (haveMorePosts == false) return;

  let res = await fetch(`/post/getUserPosts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page: pageCount,
      perPage: 4,
      orderDirection: sortingDirecction,
      orderBy: sortingOption,
      userId: userId,
    }),
  });

  let response = await res.json();

  if (response.data.length < 4 || !response.data?.length) {
    loader.innerHTML = `
    There are no more posts&nbsp;&nbsp;&nbsp;
      <span class="no-more-loader"></span>
      `;
    noMorePostReminder = true;
    haveMorePosts = false;
  }

  if (res.ok) {
    if (response.message == "There are no more posts") {
      if (noMorePostReminder == false) {
        loader.innerHTML = `
              ${response.message}&nbsp;&nbsp;&nbsp;
              <span class="no-more-loader"></span>
              `;
        noMorePostReminder = true;
        haveMorePosts = false;
      }
      return;
    }

    for (let post of response.data) {
      let nationTagList;
      let otherTagList;
      let tagList;

      if (post.nation_tag) {
        nationTagList = post.nation_tag.map((tag) => {
          if (tag) {
            return `<div type="button" onclick="searchTag('${tag}')"><span>#</span>${tag}</div>`;
          } else {
            return "";
          }
        });
      }

      if (post.other_tag) {
        otherTagList = post.other_tag.map((tag) => {
          if (tag) {
            return `<div type="button" onclick="searchTag('${tag}')"><span>#</span>${tag}</div>`;
          } else {
            return "";
          }
        });
      }

      nationTagList = await nationTagList.toString().replaceAll(",", "\n");
      otherTagList = await otherTagList.toString().replaceAll(",", "\n");
      tagList = (await nationTagList) + "\n" + otherTagList;

      let appendPost = document.createElement("section");
      appendPost.classList.add("post");

      appendPost.innerHTML = `
              <div class="left-image-reight-profile">

                  <div class="post-image-and-title">
                      <div class="post-image" onclick="changePostPage(${
                        post.id
                      })">
                          <img src="/${
                            post.post_image || "mainpage_1.jpg"
                          }" alt="">
                      </div>
                      <div class="post-title">
                          ${post.title}
                      </div>
                  </div>

                  <div class="profile-pic-and-tag">
                      <div class="author-area">
                          <div class="profile-pic" onclick="changeUserPage(${
                            post.user_id
                          })">
                              <img src="/${post.profile_pic}" alt="">
                          </div>
                          <div class="author-name">
                              <div class="traveller">Traveller : </div>
                              <div type="button" class="traveller-name">${
                                post.username
                              }</div>
                          </div>
                      </div>
                      <div class="tag">
                          ${tagList}
                      </div>
                  </div>
                  <div class="collect-count fa fa-star checked"><span> </span>${
                    post.count
                  }</div>
              </div>
          `;

      postListArea.appendChild(appendPost);
    }
    pageCount = pageCount + 1;
    isLoadingPosts = false;
  }
}

window["changeUserPage"] = changeUserPage;
async function changeUserPage(userId) {
  window.location.href = `/blog?user=${userId}`;
}

window["changePostPage"] = changePostPage;
async function changePostPage(postId) {
  window.location.href = `/post?id=${postId}`;
}

window["searchPostInMainpage"] = searchPostInMainpage;
async function searchPostInMainpage(tag) {
  window.location.href = `/?tag=${tag}`;
}

window["searchTag"] = searchTag;
async function searchTag(tag) {
  window.location.href = `/?tag=${tag}`;
}

// ==================== Clear post area ====================

async function clearPostArea() {
  postListArea.innerHTML = "";
  pageCount = 1;
  haveMorePosts = true;
  noMorePostReminder = false;
  isLoadingPosts = false;
  loader.innerHTML = `<div class="loader"></div>`;
}

// ==================== Get user collected posts ====================

async function getAllCollectedPosts() {
  if (haveMorePosts == false) return;

  let res = await fetch(`/post/getUserCollection`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page: pageCount,
      perPage: 4,
      orderDirection: sortingDirecction,
      orderBy: sortingOption,
      userId: userId,
    }),
  });

  let response = await res.json();

  if (response.data.length < 4 || !response.data?.length) {
    loader.innerHTML = `
    There are no more posts&nbsp;&nbsp;&nbsp;
      <span class="no-more-loader"></span>
      `;
    noMorePostReminder = true;
    haveMorePosts = false;
  }

  if (res.ok) {
    if (response.message == "There are no more posts") {
      if (noMorePostReminder == false) {
        loader.innerHTML = `
              ${response.message}&nbsp;&nbsp;&nbsp;
              <span class="no-more-loader"></span>
              `;
        noMorePostReminder = true;
        haveMorePosts = false;
      }
      return;
    }

    for (let post of response.data) {
      let nationTagList;
      let otherTagList;
      let tagList;

      if (post.nation_tag) {
        nationTagList = post.nation_tag.map(
          (tag) =>
            `<div type="button" onclick="searchTag('${tag}')"><span>#</span>${tag}</div>`
        );
      }

      if (post.other_tag) {
        otherTagList = post.other_tag.map(
          (tag) =>
            `<div type="button" onclick="searchTag('${tag}')"><span>#</span>${tag}</div>`
        );
      }

      nationTagList = await nationTagList.toString().replaceAll(",", "\n");
      otherTagList = await otherTagList.toString().replaceAll(",", "\n");
      tagList = (await nationTagList) + "\n" + otherTagList;

      let appendPost = document.createElement("section");
      appendPost.classList.add("post");

      appendPost.innerHTML = `
              <div class="left-image-reight-profile">

                  <div class="post-image-and-title">
                      <div class="post-image" onclick="changePostPage(${
                        post.post_id
                      })">
                          <img src="/${
                            post.post_image || "mainpage_1.jpg"
                          }" alt="">
                      </div>
                      <div class="post-title">
                          ${post.title}
                      </div>
                  </div>

                  <div class="profile-pic-and-tag">
                      <div class="author-area">
                          <div class="profile-pic" onclick="changeUserPage(${
                            post.user_id
                          })">
                              <img src="/${post.profile_pic}" alt="">
                          </div>
                          <div class="author-name">
                              <div class="traveller">Traveller : </div>
                              <div type="button" class="traveller-name">${
                                post.username
                              }</div>
                          </div>
                      </div>
                      <div class="tag">
                          ${tagList}
                      </div>
                  </div>
                  <div class="collect-count fa fa-star checked"><span> </span>${
                    post.count
                  }</div>
              </div>
          `;

      postListArea.appendChild(appendPost);
    }
    pageCount = pageCount + 1;
    isLoadingPosts = false;
  }
}

// ==================== Get more posts while scrolled to bottom ====================
window.onscroll = async function () {
  if (isLoadingPosts == false) {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      isLoadingPosts = true;
      setTimeout(async () => {
        await getAllPosts(pageCount);
      }, 2500);
    }
  }
};

//  ==================== Change to display my posts or collected posts ====================

myPostBtn.addEventListener("click", async () => {
  await clearPostArea();
  await getAllPosts();
});

collectBtn.addEventListener("click", async () => {
  await clearPostArea();
  await getAllCollectedPosts();
});

createBtn.addEventListener("click", () => {
  window.location.href = "/post-init";
});

// ==================== Preview cover image ====================
// blogImage.addEventListener("dblclick", showModal);
closeImageUploadBtn.addEventListener("click", hideModal);
closeImageUploadBtn.addEventListener("click", uploadImage);
imageUpload.addEventListener("change", uploadImage);
uploadImgBtn.addEventListener("click", apiUploadImage);
uploadImgBtn.addEventListener("click", hideModal);

function showModal() {
  imageOverlay.classList.remove("hidden");
  imageModal.classList.remove("hidden");
}

// Hide the modal and overlay
function hideModal() {
  imageOverlay.classList.add("hidden");
  imageModal.classList.add("hidden");
  previewImage.src = temparyBg;
  imageUpload.value = "";
  blogImagePreview.src = temparyBg;
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
      blogImagePreview.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  }
}

let coverImage;
async function apiUploadImage() {
  if (coverImage) {
    const formData = new FormData();
    formData.append("image", coverImage);
    formData.append("userId", userId);

    // api logic
    try {
      const response = await fetch("/auth/blogImage", {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        console.log("Upload image success");
        await Swal.fire({
          title: "Update sucess",
          text: "Update sucess",
          icon: "success",
        });

        window.location.reload();
      }
      return;
    } catch (err) {
      console.log(err);
      await Swal.fire({
        title: "Internal error",
        text: "please refresh and try it again",
        icon: "warning",
      });
    }
  }
}

//edit profile
const previewProfile = document.querySelector(".edit-profile-preview");
const profile = document.querySelector(".userpage-profile-pic");
const profileOverlay = document.querySelector(".edit-profile-overlay");
const profileModal = document.querySelector(".edit-profile-modal");
const closeProfileBtn = document.querySelector(".edit-profile-close-btn");
const profileInput = document.querySelector("#profile-input");
const updateProfileBtn = document.querySelector(".upload-profile-button");

// profile.addEventListener("dblclick", () => {
//   profileOverlay.classList.remove("hidden");
//   profileModal.classList.remove("hidden");
// });

updateProfileBtn.addEventListener("click", apiUploadProfile);

closeProfileBtn.addEventListener("click", () => {
  profileOverlay.classList.add("hidden");
  profileModal.classList.add("hidden");
  profileInput.value = "";
  previewProfile.src = temparyProlfile;
});

profileInput.addEventListener("change", uploadProfile);

function uploadProfile(event) {
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
      previewProfile.src = e.target.result;
      // blogImagePreview.src = e.target.result;
    };
    reader.readAsDataURL(imageFile);
  }
}

async function apiUploadProfile() {
  const imageData = profileInput.files[0];
  if (!imageData) {
    Swal.fire({
      icon: "error",
      title: "Please provide image for upload  ",
      text: "Something went wrong!",
    });
    profileOverlay.classList.add("hidden");
    profileModal.classList.add("hidden");

    return;
  }

  const formData = new FormData();
  formData.append("image", imageData);

  // api logic
  try {
    const response = await fetch("/post/uploadProfile", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      await Swal.fire({
        title: "Upload Profile success",
        text: "Upload Profile success",
        icon: "success",
      });
      window.location.reload();
    }
  } catch (err) {
    console.log(err);
  }
}

// update user infor

const userInforOverlay = document.querySelector(".overlay-upload-infor");
const userInforModal = document.querySelector(".upload-infor-modal");
const userInfo = document.querySelector(".user-info");
const userInforSection = document.querySelector(".user-info-middle-part");
const userInforCloseBtn = document.querySelector(".infor-close-btn");
const updateInforBtn = document.querySelector(".updateInforBtn");
const nameInput = document.querySelector(".user-name");
const locationInput = document.querySelector(".user-living_location");
const captionInput = document.querySelector(".user-caption");

let temName;
let temLocation;
let temCaption;

userInforCloseBtn.addEventListener("click", () => {
  userInforOverlay.classList.add("hidden");
  userInforModal.classList.add("hidden");
  nameInput.value = temName;
  locationInput.value = temLocation;
  captionInput.value = temCaption;
});

updateInforBtn.addEventListener("click", updateUserInforApi);

async function updateUserInforApi() {
  const userName = nameInput.value.trim();
  const userLocation = locationInput.value;
  const userCaption = captionInput.value;

  if (!userName) {
    await Swal.fire({
      title: "User Name can not be empty",
      text: "Please fill the user name",
      icon: "warning",
    });
    return;
  }
  const jsonData = {
    username: userName,
    livingLocation: userLocation,
    caption: userCaption,
  };

  try {
    let res = await fetch("/auth/updateInfor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    if (res.ok) {
      const data = await res.json();
      console.log(data);
      await Swal.fire({
        title: "Successfully update User Infor",
        text: "Update success",
        icon: "success",
      });
      window.location.reload();
    }
  } catch (err) {
    await Swal.fire({
      title: "Interal Error ",
      text: err,
      icon: "warning",
    });
  }
}

const reminder = document.querySelector(".change-cover-reminder");
const reminderHover = document.querySelector(".change-cover-reminder:hover");
const profilePicChangeReminder = document.querySelector(
  ".profile-pic-change-reminder"
);
const userInfoChangeReminder = document.querySelector(
  ".user-info-change-reminder"
);

async function checkSessionUser() {
  const result = await checkSessionApi();
  // check login or not
  if (!result.loggedIn) {
    myPostBtn.style.display = "none";
    collectBtn.style.display = "none";
    createBtn.style.display = "none";
    reminder.style.display = "none";
    reminderHover.style.display = "none";
    return;
  } else {
    const data = await checkSessionMatchUserApi();
    if (!data.match) {
      myPostBtn.style.display = "none";
      collectBtn.style.display = "none";
      createBtn.style.display = "none";
      reminder.style.display = "none";
      reminderHover.style.display = "none";
      return;
    } else {
      blogImage.addEventListener("dblclick", showModal);
      profilePicChangeReminder.classList.remove("hidden");
      userInfoChangeReminder.classList.remove("hidden");

      userInforSection.addEventListener("dblclick", () => {
        console.log("hihih");

        userInforOverlay.classList.remove("hidden");
        console.log(userInforOverlay);

        userInforModal.classList.remove("hidden");
      });

      profile.addEventListener("dblclick", () => {
        profileOverlay.classList.remove("hidden");
        profileModal.classList.remove("hidden");
      });
    }
  }
}

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

//logic check session match user id
async function checkSessionMatchUserApi() {
  const jsonData = {
    userId,
  };

  try {
    const response = await fetch("/auth/matchSession", {
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

checkSessionUser();
