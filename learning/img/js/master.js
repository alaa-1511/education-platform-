

let maincolors = localStorage.getItem(".option-box");
if (maincolors !== null) {
  document.documentElement.style.setProperty(
    "--main-color",
    localStorage.getItem(".option-box")
  );
  //Remove  active class from ALL Class list item
  document.querySelectorAll(".colors-list li ").forEach((element) => {
    element.classList.remove("active");
    //Add active class on data-color===localstorge item
    if (element.dataset.color === maincolors) {
      //Add active class
      element.classList.add("active");
    }
  });
}
// Click On Toggle Settings Gear
document.querySelector(".toggle-settings .fa-gear").onclick = function () {
  // Toggle Class Fa-spin For Rotation on Self
  this.classList.toggle("fa-spin");

  // Toggle Class Open On Main Settings Box
  document.querySelector(".settings-box").classList.toggle("open");
};
//switch color
const colorsli = document.querySelectorAll(".colors-list li");
//loop on All list items
colorsli.forEach((li) => {
  li.addEventListener("click", (e) => {
    //set color on root
    document.documentElement.style.setProperty(
      "--main-color",
      e.target.dataset.color
    );
    //set color on localstorage
    let setcolor = localStorage.setItem(".option-box", e.target.dataset.color);

    //remove active class from All childrens
    e.target.parentElement.querySelectorAll(".active").forEach((element) => {
      element.classList.remove("active");

      //add avtive class on self
      e.target.classList.add("active");
    });
  });
});
// إخفاء الـ Spinner
var spinner = function () {
    setTimeout(function () {
        if (document.getElementById('spinner')) {
            document.getElementById('spinner').classList.remove('show');
        }
    }, 1);
};
spinner();

//dark mode
let btnSwitch = document.querySelector('.switch');
let chefSvg = document.querySelectorAll('.chef-svg');

if (localStorage.getItem("darkMode") === "enabled") {
    document.body.classList.add("dark-mode");
    if (btnSwitch) {
        btnSwitch.classList.replace("fa-moon", "fa-sun");
    }
    chefSvg.forEach(item => item.src = "./images/team-shape-dark.svg");
}

if (btnSwitch) {
    btnSwitch.onclick = function () {
        document.body.classList.toggle("dark-mode");
        if (document.body.classList.contains("dark-mode")) {
            btnSwitch.classList.replace("fa-moon", "fa-sun");
            chefSvg.forEach(item => item.src = "./images/team-shape-dark.svg");
            localStorage.setItem("darkMode", "enabled");
        } else {
            btnSwitch.classList.replace("fa-sun", "fa-moon");
            chefSvg.forEach(item => item.src = "./images/team-shape.svg");
            localStorage.setItem("darkMode", "disabled");
        }
    };
}

//login & register
let enterLoginMain = document.getElementById('login-main');
let enterRegistration = document.getElementById('Registration');
let enterSignUp = document.getElementById('signUp');
let enterLogin = document.getElementById('login');
let inputEmail = document.getElementById('Email');
let inputPassword = document.getElementById('password');
let useNameregister = document.getElementById('useNameregister');
let emailregister = document.getElementById('emailregister');
let passwordregister = document.getElementById('passwordregister');
let enteEerrorMessage = document.getElementById('errorMessage');
let errorMessageregister = document.getElementById('errorMessageregister');
let submitRegister = document.getElementById('submitRegister');
let sumbitLogin = document.getElementById('sumbitLogin');

let registeredUsers = JSON.parse(localStorage.getItem('mylogin')) || [];
//enter login form
sumbitLogin.addEventListener("click", function (e) {
    e.preventDefault();

    let isEmailValid = validationLogin(inputEmail);
    let isPasswordValid = validationLogin(inputPassword);

    if (isEmailValid && isPasswordValid) {
        let user = registeredUsers.find(user =>
            user.emailregister === inputEmail.value &&
            user.passwordregister === inputPassword.value
        );

        if (user) {
            enteEerrorMessage.classList.add("d-none");
            window.location.href = "index2.html";
        } else {
            enteEerrorMessage.textContent = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
            enteEerrorMessage.classList.remove("d-none");
        }
    } else {
        enteEerrorMessage.classList.remove("d-none");
    }
});
//clear
function clear(type) {
    if (type === "login") {
        inputEmail.value = "";
        inputPassword.value = "";
    } else if (type === "register") {
        useNameregister.value = "";
        emailregister.value = "";
        passwordregister.value = "";
    }
}

// display & block pages
enterSignUp.addEventListener('click', function (e) {
    e.preventDefault();
    enterLoginMain.classList.add('d-none');
    enterRegistration.classList.remove('d-none');
});

enterLogin.addEventListener('click', function (e) {
    e.preventDefault();
    enterRegistration.classList.add('d-none');
    enterLoginMain.classList.remove('d-none');
});

// login
function validationLogin(element) {
    let text = element.value.trim();
    let regex = {
        Email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        password: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    };

    if (!text) {
        enteEerrorMessage.textContent = `${element.placeholder} لا يمكن أن يكون فارغًا`;
        return false;
    }

    if (regex[element.id].test(text)) {
        return true;
    }

    enteEerrorMessage.textContent = `تنسيق ${element.placeholder} غير صحيح`;
    return false;
}

//  register
submitRegister.addEventListener("click", function (e) {
    e.preventDefault();

    let isUsernameValid = validationRegistration(useNameregister);
    let isEmailValid = validationRegistration(emailregister);
    let isPasswordValid = validationRegistration(passwordregister);

    if (isUsernameValid && isEmailValid && isPasswordValid) {
        let emailExists = registeredUsers.some(user => user.emailregister === emailregister.value);

        if (emailExists) {
            errorMessageregister.textContent = "هذا البريد الإلكتروني مسجل مسبقًا.";
            errorMessageregister.classList.remove("d-none");
        } else {
            let newUser = {
                useNameregister: useNameregister.value,
                emailregister: emailregister.value,
                passwordregister: passwordregister.value
            };

            registeredUsers.push(newUser);
            localStorage.setItem('mylogin', JSON.stringify(registeredUsers));
            window.location.href = "hello.html";
        }
    } else {
        errorMessageregister.classList.remove("d-none");
    }
});

// validation for register form 2
function validationRegistration(elem) {
    let text = elem.value.trim();
    let regex = {
        useNameregister: /^[a-zA-Z0-9._]{3,20}$/,
        emailregister: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        passwordregister: /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/
    };

    let errorElement = document.getElementById(`${elem.id}Error`);
    errorElement.textContent = "";

    if (!text) {
        errorElement.textContent = `${elem.placeholder} لا يمكن أن يكون فارغًا`;
        return false;
    }

    if (regex[elem.id].test(text)) {
        return true;
    }

    errorElement.textContent = `تنسيق ${elem.placeholder} غير صحيح`;
    return false;
}




