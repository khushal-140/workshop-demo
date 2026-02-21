// If already logged in, go to dashboard
if (localStorage.getItem("bbCurrent")) {
    // There is a current user email saved -> user considered logged in
    window.location.href = "dashboard.html";
}

// MODE
let mode = "login";

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authButton = document.getElementById("authButton");
const toggleText = document.getElementById("toggleText");
const toggleLink = document.getElementById("toggleLink");
const emailInput = document.getElementById("authEmail");
const passwordInput = document.getElementById("authPassword");

// helper: get users array
function getUsers() {
    return JSON.parse(localStorage.getItem("bbUsers") || "[]");
}

// helper: save users array
function saveUsers(users) {
    localStorage.setItem("bbUsers", JSON.stringify(users));
}

// sanitize email to use in keys
function safeEmail(email) {
    return email.replace(/[@.]/g, "_");
}

function switchMode() {
    if (mode === "login") {
        mode = "register";
        authTitle.innerText = "Create Account";
        authSubtitle.innerText = "Register to start tracking your budget";
        authButton.innerText = "Register";
        toggleText.innerHTML = `Already have an account? <span id="toggleLink">Login</span>`;
    } else {
        mode = "login";
        authTitle.innerText = "Welcome Back";
        authSubtitle.innerText = "Login to manage your budget";
        authButton.innerText = "Login";
        toggleText.innerHTML = `Don’t have an account? <span id="toggleLink">Register</span>`;
    }
    // reattach listener to new span element
    document.getElementById("toggleLink").addEventListener("click", switchMode);
}

// initial attach
toggleLink.addEventListener("click", switchMode);

// Register / Login handler
authButton.addEventListener("click", () => {
    const email = emailInput.value.trim().toLowerCase();
    const pass = passwordInput.value.trim();

    if (!email || !pass) {
        alert("Enter email and password");
        return;
    }

    const users = getUsers();

    if (mode === "register") {
        // check already exists
        const exists = users.find(u => u.email === email);
        if (exists) {
            alert("An account with this email already exists. Please login or use a different email.");
            return;
        }

        // create new user
        const newUser = { email, password: pass };
        users.push(newUser);
        saveUsers(users);

        // create empty data key for this user
        const key = "bbData_" + safeEmail(email);
        if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify([]));

        alert("Account created! Now login.");
        switchMode(); // go to login mode
        emailInput.value = "";
        passwordInput.value = "";
        return;
    }

    // LOGIN
    const user = users.find(u => u.email === email);
    if (!user) {
        alert("No user found with this email. Please register first.");
        return;
    }

    if (user.password === pass) {
        // set current user (email) — used by dashboard
        localStorage.setItem("bbCurrent", email);
        alert("Login successful");
        window.location.href = "dashboard.html";
    } else {
        alert("Incorrect password");
    }
});
