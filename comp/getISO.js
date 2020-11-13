const fs = require("fs");
const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const url = "https://en.wikipedia.org/wiki/List_of_ISO_3166_country_codes";
got(url)
  .then((response) => {
    const dom = new JSDOM(response.body);
    const tableNode = dom.window.document.querySelector(".wikitable");
    const trs = tableNode.querySelectorAll("tbody>tr");
    const a = [...trs].slice(0, 100);
    trs.forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds.length == 8) {
        let dict = {};
        let key = tds[4].querySelector("a>span").innerHTML;
        let value = tds[5].querySelector("a>span").innerHTML;
        dict[key] = value;
        let string = "'" + key + "':'" + value + "',";

        fs.appendFile("data.txt", string, function (err, file) {
          if (err) throw err;
          console.log("saved!");
        });
      }
    });
  })
  .catch((err) => console.log(err));
