const myCarouselElement = document.querySelector("#carouselExampleSlidesOnly");
const carouselInner = document.querySelector(".carousel-inner");
const usernameInput = document.querySelector("#username-input");
const emailInput = document.querySelector("#email-input");
const passwordInput = document.querySelector("#password-input");
const confirmPasswordInput = document.querySelector("#confirm-password-input");
const registerBtn = document.querySelector("#register-btn")
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



// ==================== Register account ====================

async function register() {

    let username = usernameInput.value;
    let email = emailInput.value;
    let password = passwordInput.value;
    let confirmPassword = confirmPasswordInput.value;

    if (!email || !username) {
        Swal.fire({
            title: 'Invalid Input',
            text: 'Enter email / username.',
            icon: "warning",
        });
        return;
    }

    if (!password || !confirmPassword) {
        Swal.fire({
            title: 'Invalid Input',
            text: 'Enter password / confirm password.',
            icon: "warning",
        });
        return;
    }

    if (!email.includes("@")) {
        Swal.fire({
            title: 'Invalid Input',
            text: 'Enter a correct email.',
            icon: "warning",
        });
        return;
    }

    if (password !== confirmPassword) {
        Swal.fire({
            title: "Wrong Password",
            text: "Seems your confirmed password is incorrect.",
            icon: "warning",
        });
        return;
    }

    if (password.indexOf(' ') !== -1) {
        Swal.fire({
            title: 'Invalid Input',
            text: 'Do not enter space in password.',
            icon: "warning",
        });
        return;
    }

    if (password.length < 8) {
        Swal.fire({
            title: "Wrong Password",
            text: "Your password must have at least 8 characters.",
            icon: "warning",
        });
        return;
    }

    let res = await fetch(`/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: username,
            email: email,
            password: password
        }),
    });

    let response = await res.json();

    if (response.message == 'User with this email already exists') {
        Swal.fire({
            title: "Register failed",
            text: "Email already exists.",
            icon: "warning",
        });
        return;
    }

    if (res.ok) {
        Swal.fire({
            title: "Congratulation",
            text: "Please Check e-mail and Activate the A/C",
            icon: "success",
            timer: 1500,
        }).then(() => {
            window.location.href = `/`;
        });
    }
}

registerBtn.addEventListener("click", () => {
    register()
});



// ==================== Display register cat ====================

registerBtn.addEventListener('mouseenter', () => {
    registerCat.style.display = "flex";
});

registerBtn.addEventListener('mouseleave', () => {
    registerCat.style.display = "none";
});