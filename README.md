## This is the back bone of my site, hosting useful information collected during my time in university. Obviously, I didn't attach any of the files, you can view them on the site itself!

## How to use:

- Create a new directory in assets/ called "data" (or rewrite path in the html pages)
- Create json file in the data directory with the following structure: (they will be displayed in the order they are in the json file)
```json
[
    {
        "img": "assets/images/my_svg_or_other_img.png",
        "name": "Name of section",
        "desc": "description of the section",
        "page": "link to the page"
    }
]
```
- submenu.html handles different data files, by default it searches for felev{number_here}.json with a single digit number and a 0 edge case (easily chagable)
- The header bar is modular, its located in assets/modules/header.html, active page detection is based on the link in the header bar!
- svg images by default get a 6px margin, this can be modified by adding a ?setpad=xx to the end of the image link where xx is a two digit number (must be 2 digit even if its 00)
- The site is mobile friendly, and mostly (?) accessible
