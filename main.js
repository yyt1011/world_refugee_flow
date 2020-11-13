//set svg
const width = 1000;
const height = 900;

const svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

//set up world map generator
const projection = d3.geoMercator().translate([500, 500]);
const path = d3.geoPath(projection);

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

  //draw map
  const mapData = topojson.feature(topo, topo.objects.countries).features;
  const mapWrap = svg.append("g").attr("class", "mapwrap");
  mapWrap
    .selectAll("path")
    .data(mapData)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1)
    .attr("fill", "#cdcdcd");

  //prepare refugee data
  //use 1961data as a start point
  const refugee1961 = refugee.filter((d) => d.Year == "1961");
  // const sum_origin_1961 = d3.rollup(
  //   refugee1961,
  //   (v) => d3.sum(v, (d) => d.Total), //v represents each row, {Year: 1961, Total:5000, ISO...}
  //   (d) => d.Origin_ISO
  // );

  //data to pass to draw spike function
  const data1961 = d3
    .nest()
    .key((d) => d.Origin_ISO)
    .entries(refugee1961);

  const locationMap = d3.group(mapData, (d) => d.id);
  console.log(locationMap);

  data1961.forEach((d) => {
    if (d.key) {
      //d.key -> ISO number
      const id = ISOdict[d.key];
      const feature = locationMap.get(id);
      d.id = id;
      d.sum = d3.sum(d.values, (v) => v.Total);
      d.position = path.centroid(locationMap.get(id)[0]);
    }
  });
  console.log(data1961);

  //draw spike
  //height of spike
  // const length = d3.scaleLinear([0, d3.max(data, (d) => d.value)], [0, 200]);
  // const spike = (length, width) =>
  //   `M${-width / 2},0L0,${-length}L${width / 2},0`;

  const spikeWrap = svg.append("g").attr("class", "spikewrap");
  spikeWrap
    .selectAll("circle")
    .data(data1961)
    .enter()
    .append("circle")
    .attr("r", 5)
    .attr("stroke", "steelblue")
    .attr("fill", "none")
    .attr("transform", (d) => {
      if (d.key) return `translate(${d.position[0]},${d.position[1]})`;
    });
});
