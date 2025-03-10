export async function fetchFile(href) {
    try {
        return await fetch(href).then((response) => response.text());
    } catch (e) {
        console.error(e);
    }
}

// to avoid inclusion multiple times
export function getCookie(name) {
    let cookieArr = document.cookie.split("; ");
    for (let i = 0; i < cookieArr.length; i++) {
        let cookiePair = cookieArr[i].split("=");

        if (name == cookiePair[0]) {
            return decodeURIComponent(cookiePair[1]);
        }
    }
    return null;
}
