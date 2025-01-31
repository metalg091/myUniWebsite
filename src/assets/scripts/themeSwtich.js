import { getCookie } from "./sharedResources.js";

window.themeSwitch = themeSwitch;

function setCookie(name, value, time_in_hours = 24000) {
    document.cookie =
        name +
        "=" +
        value +
        "; expires=" +
        new Date(Date.now() + time_in_hours * (3600 * 1000)).toUTCString() +
        "; path=/;SameSite=strict";
}

function themeSwitch() {
    let body = document.body;
    var r = document.querySelector(":root");
    if (body.getAttribute("data-bs-theme") == "dark") {
        // To light
        body.setAttribute("data-bs-theme", "light");
        document
            .getElementById("themeSwitch")
            .setAttribute("src", "assets/images/shared/sun.svg");
        Array.from(document.getElementsByClassName("card")).forEach((element) =>
            element.classList.add("lightcard"),
        );
        setCookie("theme", "light");
        r.style.setProperty("--card-hover", "skyblue");
    } else {
        // To dark
        body.setAttribute("data-bs-theme", "dark");
        document
            .getElementById("themeSwitch")
            .setAttribute("src", "assets/images/shared/moon.svg");
        Array.from(document.getElementsByClassName("card")).forEach((element) =>
            element.classList.remove("lightcard"),
        );
        setCookie("theme", "dark");
        r.style.setProperty("--card-hover", "crimson");
    }
}
function highVisibility() {
    if (document.body.id == "NotHvMode") {
        document.body.id = "hvMode";
        document.documentElement.style.setProperty("--font-size-base", "2rem");
        setCookie("hv", "hv");
    } else {
        document.body.id = "NotHvMode";
        document.documentElement.style.setProperty("--font-size-base", "1rem");
        setCookie("hv", "none");
    }
}

document.addEventListener("modulesLoaded", () => {
    // set default values
    document
        .querySelector(":root")
        .style.setProperty("--card-hover", "crimson");

    if (getCookie("theme") == null) {
        if (
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches
        ) {
            if (document.body.getAttribute("data-bs-theme") != "dark") {
                themeSwitch();
            }
            theme = "dark";
        } else {
            if (document.body.getAttribute("data-bs-theme") != "light") {
                themeSwitch();
            }
            theme = "light";
            document
                .getElementById("themeSwitch")
                .setAttribute("src", "assets/images/shared/sun.svg");
            var r = document.querySelector(":root");
            r.style.setProperty("--card-hover", "skyblue");
        }
        setCookie("theme", theme);
    } else {
        if (document.body.getAttribute("data-bs-theme") != getCookie("theme")) {
            themeSwitch();
        } else if (document.body.getAttribute("data-bs-theme") == "light") {
            Array.from(document.getElementsByClassName("card")).forEach(
                (element) => element.classList.add("lightcard"),
            );
            document
                .getElementById("themeSwitch")
                .setAttribute("src", "assets/images/shared/sun.svg");
            var r = document.querySelector(":root");
            r.style.setProperty("--card-hover", "skyblue");
        }
    }
    if (getCookie("hv") == null) {
        try {
            if (
                window.matchMedia &&
                window.matchMedia("(prefers-contrast: high)").matches
            ) {
                document.body.id = "hvMode";
                document.documentElement.style.setProperty(
                    "--font-size-base",
                    "2rem",
                );
                setCookie("hv", "hv");
            } else {
                document.body.id = "NotHvMode";
                document.documentElement.style.setProperty(
                    "--font-size-base",
                    "1rem",
                );
                setCookie("hv", "none");
            }
        } catch (error) {
            console.error(
                'This browser has not implemented "prefers-contrast" yet!',
            );
        }
    } else {
        if (getCookie("hv") != "none") {
            highVisibility();
        }
    }
});
