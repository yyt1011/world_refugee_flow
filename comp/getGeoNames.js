const fs = require("fs");
const got = require("got");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const url = "https://www.geonames.org/countries/";
got(url)
  .then((response) => {
    const dom = new JSDOM(response.body);
    const tableNode = dom.window.document.querySelector(".restable");
    const trs = tableNode.querySelectorAll("tbody>tr");

    const a = [...trs].slice(1);

    a.forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      let key = tds[1].innerHTML;
      let number = tds[2].innerHTML;
      let name = tds[4].querySelectorAll("a")[0].innerHTML;
      let continent = tds[8].innerHTML;
      let string =
        '"' +
        key +
        '":{"number": "' +
        number +
        '", "name":"' +
        name +
        '","continent":"' +
        continent +
        '"},';

      fs.appendFile("GeoNames.txt", string, function (err, file) {
        if (err) throw err;
        console.log("saved!");
      });
    });
  })
  .catch((err) => console.log(err));
