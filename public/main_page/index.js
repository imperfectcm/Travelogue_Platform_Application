const myCarouselElement = document.querySelector("#carouselExampleSlidesOnly");
const postListArea = document.querySelector(".post-list-area");
const carouselInner = document.querySelector(".carousel-inner");
const postSortingMenu = document.querySelector(".post-sorting-menu");
const loader = document.querySelector(".loader-container");
//nav bar
const navbarPublic = document.querySelector(".navbar-public");
const navbarPrivate = document.querySelector(".navbar-private");

const homePage = document.querySelector(".nav-home-page");
const homePageLogedIn = document.querySelector(".nav-home-page-pr");
const login = document.querySelector(".nav-login");
const registration = document.querySelector(".nav-registration");
const userPage = document.querySelector(".nav-user-page");
const logout = document.querySelector(".nav-logout");

const searchContent = document.querySelector(".cover-search-content");
const searchBtn = document.querySelector(".cover-search-button");

//photo recognition button
const AIbutton = document.querySelector(".AI-button");
const imageOverlay = document.querySelector(".overlay-upload-image");
const imageModal = document.querySelector(".modal-upload-image");
const dropZone = document.querySelector("#drop_zone");
const dropZoneMsg = document.querySelector("#drop_zone p");
const insertPhoto = document.querySelector(".photo_input");

const searchList = document.querySelector(".search-list");
const overlay = document.querySelector(".overlay");

const carousel = new bootstrap.Carousel(myCarouselElement, {
  interval: 2500,
  touch: false,
});

let pageCount = 1;
let haveMorePosts = true;
let noMorePostReminder = false;
let isLoadingPosts = false;
let sortingOption = "created_at";
let sortingDirecction = "desc";

const urlParams = new URLSearchParams(window.location.search);
const tagName = urlParams.get("tag");

// const input = urlParams.get("input");

// ==================== Display main page ====================

async function displayMainpage() {
  await getMainPageCoverImages();
  await changeNavBar();

  if (tagName === null) {
    await getAllPosts();
  } else {
    // await getPostsGoogleVision();
    await getAllPostsByTag();
  }
}

displayMainpage();

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
    userId = response.userInfo.id;
    window.location.href = `/blog?user=${userId}`;
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

// ==================== Get cover images in mainpage ====================

async function getMainPageCoverImages() {
  let res = await fetch(`/post/getPosts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page: 1,
      perPage: 1,
      orderDirection: "desc",
      orderBy: "id",
    }),
  });

  let response = await res.json();

  if (res.ok) {
    for (let image of response.mainpageCoverList) {
      let carouselItem = document.createElement("div");
      carouselItem.classList.add("carousel-item");

      if (image == response.mainpageCoverList[0]) {
        carouselItem.classList.add("active");
      }

      carouselItem.innerHTML = `
                    <img src="/${image}" class="d-block w-100" alt="...">
            `;

      carouselInner.appendChild(carouselItem);
    }
  }
}

// ==================== Get user id ====================

async function getuserInfo() {
  let res = await fetch(`/auth/userInfo`);
  let response = await res.json();
  return response;
}

async function changeNavBar() {
  let res = await fetch(`/auth/userInfo`);
  let response = await res.json();

  if (res.ok) {
    if (response.loggedIn) {
      navbarPrivate.classList.remove("hidden");
      navbarPublic.classList.add("hidden");
      return;
    } else {
      navbarPublic.classList.remove("hidden");
      navbarPrivate.classList.add("hidden");
      return;
    }
  }
}

// ==================== Get posts ====================

async function getAllPosts() {
  if (haveMorePosts == false) return;

  let res = await fetch(`/post/getPosts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page: pageCount,
      perPage: 4,
      orderDirection: sortingDirecction,
      orderBy: sortingOption,
    }),
  });

  let response = await res.json();

  console.log("***********************", response.data);

  if (response.data?.length < 4 || !response.data?.length) {
    loader.innerHTML = `
        There are no more posts&nbsp;&nbsp;&nbsp;
          <span class="no-more-loader"></span>
          `;
    noMorePostReminder = true;
    haveMorePosts = false;
  }

  if (res.ok) {
    if (!response.hasPosts) {
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

    if (response.hasPosts) {
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
                                <div class="traveller-name">${
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
}

window["changeUserPage"] = changeUserPage;
async function changeUserPage(userId) {
  window.location.href = `/blog?user=${userId}`;
}

window["changePostPage"] = changePostPage;
async function changePostPage(postId) {
  window.location.href = `/post?id=${postId}`;
}

window["searchTag"] = searchTag;
async function searchTag(tag) {
  urlParams.set("tag", tag);
  window.location.search = urlParams.toString();

  await getAllPostsByTag();
}

// ==================== Clear post area ====================

async function clearPostArea() {
  postListArea.innerHTML = "";
  pageCount = 1;
  haveMorePosts = true;
  noMorePostReminder = false;
  isLoadingPosts = false;
}

// ==================== Get more posts while scrolled to bottom ====================
window.onscroll = async function () {
  if (isLoadingPosts == false) {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
      isLoadingPosts = true;
      console.log("scrolling....");
      setTimeout(async () => {
        if (tagName) {
          await getAllPostsByTag();
        } else {
          await getAllPosts();
        }
      }, 2500);
    }
  }
};

// ==================== Sort posts ====================

postSortingMenu.addEventListener("change", async () => {
  if (postSortingMenu.value == 2) {
    sortingOption = "created_at";
    sortingDirecction = "asc";
  } else if (postSortingMenu.value == 3) {
    sortingOption = "count";
    sortingDirecction = "desc";
  } else {
    sortingOption = "created_at";
    sortingDirecction = "desc";
  }
  console.log("Sorting Option: ", sortingOption);
  console.log("Sorting Direction: ", sortingDirecction);
  await clearPostArea();
  loader.innerHTML = '<div class="loader"></div>';

  if (tagName) {
    // urlParams.set("tag", tagName);
    await getAllPostsByTag();
    return;
  }

  await getAllPosts();
  return;
});

// ==================== Search post ====================
searchBtn.addEventListener("click", async () => {
  let tag = searchContent.value;

  if (tag.trim() != "") {
    urlParams.set("tag", tag);
    window.location.search = urlParams.toString();

    await getAllPostsByTag();
  } else {
    window.location.replace(window.location.href.replace(/\?.*/, ""));
    await getAllPosts();
  }
});

// ==================== Get posts by tag searching ====================

async function getAllPostsByTag() {
  if (haveMorePosts == false) return;

  let res = await fetch(`/post/getPostsByTag`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page: pageCount,
      perPage: 4,
      orderDirection: sortingDirecction,
      orderBy: sortingOption,
      tag: tagName,
    }),
  });

  let response = await res.json();
  console.log(response);

  if (res.ok) {
    if (!response.hasPosts) {
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

    if (response.hasPosts) {
      if (response.data.length < 4 || !response.data?.length) {
        loader.innerHTML = `
          There are no more posts&nbsp;&nbsp;&nbsp;
            <span class="no-more-loader"></span>
            `;
        noMorePostReminder = true;
        haveMorePosts = false;
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
                                <div class="traveller-name">${
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
    }
    pageCount = pageCount + 1;
    isLoadingPosts = false;
  }
}

searchContent.addEventListener("input", async () => {
  let tag = searchContent.value;
  let res = await fetch(`/searchRouter/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tag: tag,
    }),
  });
  let response = await res.json();
  if (res.ok) {
    searchList.innerHTML = "";
    if (response.hasSearchResult) {
      overlay.classList.remove("hidden");
      searchList.classList.remove("hidden");
      for (let tag of response.tagList) {
        searchList.innerHTML += `<div class="search-result" onclick="putInSearch('${tag}')">${tag}</div>`;
      }
      return;
    } else {
      overlay.classList.add("hidden");
      searchList.classList.add("hidden");
      searchList.innerHTML = "";
      return;
    }
  }
});

window["putInSearch"] = putInSearch;

async function putInSearch(tag) {
  searchContent.value = tag;
  overlay.classList.add("hidden");
  searchList.classList.add("hidden");
  searchList.innerHTML = "";
}

overlay.addEventListener("click", () => {
  overlay.classList.add("hidden");
  searchList.classList.add("hidden");
  searchList.innerHTML = "";
});

//=================================main page photo recognition button=========//

//show the drag and drop zone
AIbutton.addEventListener("click", () => {
  showModal(imageOverlay, imageModal);
  imageOverlay.addEventListener("click", () => {
    hideModal(imageOverlay, imageModal);
  });
});

//upload photo by click
dropZone.addEventListener("click", () => {
  insertPhoto.click();
  insertPhoto.onchange = (event) => {
    uploadSearch(event.target.files[0]);
  };
});

//upload photo by drag and drop
dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
});

dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  //check if image file
  if (event.dataTransfer.items[0].kind != "file") {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Error: Not a file",
    });

    throw new Error("Not a file");
  }
  // check if muitiple file
  if (event.dataTransfer.items.length > 1) {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Error: Cannot upload multiple files",
    });

    throw new Error("Multiple Files not allowed");
  }

  const fileDrag = event.dataTransfer.files[0];

  //check is folder or not
  const isFile = await checkFile(fileDrag);

  if (isFile) {
    await uploadSearch(fileDrag);
  }

  if (!isFile) {
    Swal.fire({
      position: "center",
      icon: "error",
      title: "Error: Not a file (cannot be a folder)",
      showConfirmButton: false,
    });

    throw new Error("Couldn't read file");
  }
});

//====== related function for main page photo recognition button====//

// show the drag and drop zone
function hideModal(overlay, modal) {
  overlay.classList.add("hidden");
  modal.classList.add("hidden");
}
// hide the drag and drop zone
function showModal(overlay, modal) {
  overlay.classList.remove("hidden");
  modal.classList.remove("hidden");
}

// resonse of google vision API
async function uploadSearch(file) {
  const fd = new FormData();
  fd.append("image", file);

  const res = await fetch("/searchRouter/googleVision", {
    method: "POST",
    body: fd,
  });
  let result = await res.json();

  if (res.status == 200) {
    Swal.fire({
      position: "center",
      icon: "success",
      title: `Landmark: ${result.landMarkName}\nAddress: "${result.landmark_address}`,
      showConfirmButton: false,
    });
    dropZoneMsg.textContent = `The landmark is from country : "${result.country_name}"`;
    setTimeout(() => {
      window.location = "../?tag=" + result.country_name;
    }, "4000");
  }

  if (res.status == 400) {
    Swal.fire({
      position: "center",
      icon: "warning",
      title: result,
      showConfirmButton: false,
    });
  }
}

async function checkFile(fileDrag) {
  try {
    const fr = new FileReader();

    // Promisify the FileReader events
    const onLoad = () =>
      new Promise((resolve) => (fr.onload = () => resolve(true)));
    const onError = () =>
      new Promise((resolve) => (fr.onerror = () => resolve(false)));

    fr.onprogress = (event) => {
      if (event.loaded > 50) {
        fr.abort();
        resolve(true);
      }
    };

    fr.readAsArrayBuffer(fileDrag);

    // Wait for either load or error event
    await Promise.race([onLoad(), onError()]);

    return true;
  } catch (error) {
    console.error("Error reading file:", error);
    return false;
  }
}
