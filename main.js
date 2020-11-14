import Map from "./comp/drawMap.js";
import Spikes from "./comp/drawSpikes.js";
import Range from "./comp/getYear.js";

//set svg
const width = 1000;
const height = 900;

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//load in data
Promise.all([
  d3.csv(
    "https://gist.githubusercontent.com/yyt1011/ac71e5a3baeb439a2c805a1f9d248108/raw/51ced0b2e7554976a11c34ebd08705be12311f05/population.csv"
  ),
  d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"),
  d3.json("./comp/data.json"),
]).then((files) => {
  const refugee = files[0];
  const topo = files[1];
  const ISOdict = files[2];

  // draw map
  const bg_map = new Map(svg, topo);

  // choose a year
  const year = new Range();
  // draw spikes
  const spikes = new Spikes(svg, refugee, topo, ISOdict);
});
