import Map from "./comp/drawMap.js";
import Spikes from "./comp/drawSpikes.js";
import getMax from "./comp/maxSum.js";
import Tree from "./comp/drawTreeMap.js";

//set svg
const width = 1000;
const height = 600;

const svg = d3
  .select("#map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const svg2 = d3
  .select("#tree")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//load in data
Promise.all([
  d3.csv(
    "https://gist.githubusercontent.com/yyt1011/ac71e5a3baeb439a2c805a1f9d248108/raw/51ced0b2e7554976a11c34ebd08705be12311f05/population.csv"
  ),
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  d3.json("./comp/data/ISOdict.json"),
  d3.json("./comp/data/GeoNames.json"),
]).then((files) => {
  const refugee = files[0];
  const topo = files[1];
  const ISOdict = files[2];
  const continentDict = files[3];
  const sumMax = d3.max(getMax(refugee));

  const projection = d3
    .geoCylindricalEqualArea()
    .scale(200)
    .translate([500, 365]);
  const path = d3.geoPath(projection);

  // draw map
  const bg_map = new Map(svg, projection, path, topo);

  // draw spikes
  const spikes = new Spikes(
    svg,
    projection,
    path,
    refugee,
    topo,
    ISOdict,
    sumMax
  );

  // draw treemap
  const tree = new Tree(svg2, width, height, refugee, continentDict);

  // select year
  const btn = document.querySelector("input");
  const yearLabel = document.querySelector(".range").querySelector(".select");
  yearLabel.innerText = +btn.value + 1961;
  yearLabel.style.left = (400 / 58) * +btn.value - 32 + "px";

  btn.addEventListener("change", function () {
    const value = btn.value;
    //change input select value to year corresponding to dataset
    let yearSelected = +value + 1961;
    yearLabel.style.display =
      (yearSelected == "1961") | (yearSelected == "2019")
        ? "none"
        : "inline-block";
    yearLabel.innerText = yearSelected;
    yearLabel.style.left = (400 / 58) * +value - 32 + "px";
    spikes.getSpikesData(yearSelected);
    tree.getTreeData(yearSelected);
  });
});
