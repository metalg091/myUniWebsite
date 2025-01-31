import { fetchFile } from "./sharedResources.js";

function setActiveLink() {
    let currentPath = window.location.pathname.substr(1);
    if (currentPath === "") {
        currentPath = "index.html";
    }
    const navLinks = document.querySelectorAll("#header .nav-link");
    navLinks.forEach((link) => {
        if (link.getAttribute("href") === currentPath) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    /* It is possible to include bootstrap and other style libs BUT it results in flickering on load! :(
    let temp = document.createElement("div");
    temp.innerHTML = await fetchFile("assets/modules/themeIncludes.html");
    const childArray = Array.from(temp.children);
    for (const child of childArray) {
        document.head.append(child);
    }
    */
    document.getElementById("header").innerHTML = await fetchFile(
        "assets/modules/header.html",
    );
    document.dispatchEvent(new CustomEvent("modulesLoaded"));
    setActiveLink();
});
