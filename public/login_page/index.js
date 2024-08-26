const myCarouselElement = document.querySelector("#carouselExampleSlidesOnly");
const carouselInner = document.querySelector(".carousel-inner");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const loginButton = document.querySelector("#login-btn")
const registerCat = document.querySelector('.register-cat');

const navbarPublic = document.querySelector(".navbar-public");
const homePage = document.querySelector(".nav-home-page");
const login = document.querySelector(".nav-login");
const registration = document.querySelector(".nav-registration");

const carousel = new bootstrap.Carousel(myCarouselElement, {
    interval: 2500,
    touch: false,
});

let pageCount = 1
let haveMorePosts = true
let noMorePostReminder = false
let isLoadingPosts = false
let sortingOption = "created_at"
let sortingDirecction = "desc"



// ==================== Nav bar buttons ====================

homePage.addEventListener('click', async () => {
    window.location.href = "/";
})

login.addEventListener('click', async () => {
    window.location.href = "/login";
})

registration.addEventListener('click', async () => {
    window.location.href = "/register";
})



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

getMainPageCoverImages();



// ==================== Email login ====================

async function emailLogin() {
    let email = emailInput.value
    let password = passwordInput.value

    let res = await fetch(`/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    });
    
    // if(res.status === 400) {
    //   await  Swal.fire({
    //         icon: "warning",
    //         title: "your email is not confirmed yet, Please verify in your email",
    //         showConfirmButton: false,
          
    //       })
    //       return
    // }

    let response = await res.json();

    if(response.message == "Didn't Registrate or activated by Email") {
        await  Swal.fire({
            icon: "warning",
            title: "your email is not confirmed yet, Please verify in your email",
            showConfirmButton: false,
          
          })
          return

          
    }

    
    if (response.message == "Login Failed") {
        Swal.fire({
            title: "Login Failed",
            text: "Your email or password is incorrect.",
            icon: "warning",
        });
        return;
    }

    if (res.ok) {
        Swal.fire({
            icon: "success",
            title: "Login Successed",
            showConfirmButton: false,
            timer: 1500,
        }).then(() => {
            window.location.href = "/";
        });
    }


}

loginButton.addEventListener("click", () => {
    emailLogin()
})



// ==================== Display register cat ====================

loginButton.addEventListener('mouseenter', () => {
    registerCat.style.display = "flex";
});

loginButton.addEventListener('mouseleave', () => {
    registerCat.style.display = "none";
});