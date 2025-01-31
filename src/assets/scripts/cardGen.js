import { fetchFile, getCookie } from "./sharedResources.js";

async function getElements(href) {
    return JSON.parse(await fetchFile(href));
}

// export only to html
export async function doPrint(href) {
    let elements = await getElements(href);
    let i = 0;
    let template = await fetchFile("assets/modules/cardTemplate.html");
    let intermed = document.createElement("div");
    intermed.innerHTML = template.trim();
    for (const element of elements) {
        i++;
        await new Promise((resolve) => setTimeout(resolve, i * 25));
        printElement(element, intermed);
    }
}

// export only to html
// npm package is-number
export function isnum(num) {
    if (typeof num === "number") {
        return num - num === 0;
    }
    if (typeof num === "string" && num.trim() !== "") {
        return Number.isFinite ? Number.isFinite(+num) : isFinite(+num);
    }
    return false;
}

function printElement(element, template) {
    let clone = template.querySelector("template").content.cloneNode(true);
    // old way: let clone = document.querySelector("template").content.cloneNode(true);
    if (document.getElementById("jump") == null) {
        clone.querySelector(".col").id = "jump";
    }
    if (getCookie("theme") == "light") {
        clone.querySelector(".card").classList.add("lightcard");
    }

    clone.querySelector(".col").href = element.page;
    clone.querySelector("img").src = element.img;
    // give svg images padding by default
    // custom padding size can be given by adding ?setpadXX to end of file name
    // search uses
    if (element.img.search(new RegExp("\\.svg")) >= 0) {
        let padsize = 6;
        if (element.img.search(new RegExp("\\.svg\\?setpad")) >= 0) {
            padsize = element.img.substr(
                element.img.search(new RegExp("\\.svg\\?setpad")) +
                    11 /* set to beginging of number */,
                2 /* set to end of number */,
            );
            padsize = isnum(padsize) ? padsize : 6;
        }
        clone.querySelector("img").style.padding = padsize + "px";
    }
    clone.querySelector("h5").textContent = element.name;
    clone.querySelector(".card-text").innerHTML = element.desc.replaceAll(
        "\\n",
        " <br> ",
    );
    document.getElementById("main").appendChild(clone);
}
