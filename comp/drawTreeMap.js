export default class Tree {
  constructor(svg2, width, height, refugee, continentDict) {
    this.svg = svg2;
    this.width = width;
    this.height = height;
    this.refugee = refugee;
    this.continentDict = continentDict;
    this.getSum();
    this.init();
    this.getTreeData;
  }

  // implement only once, implement before init()
  getSum() {
    const groupByYear = d3
      .nest()
      .key((d) => d.Year)
      .entries(this.refugee);
    // array for total number of refugees every year
    this.sums = groupByYear.map((d) => {
      let sum = d.values.map((v) => +v.Total).reduce((acc, cur) => acc + cur);
      return sum;
    });
  }

  init() {
    // get default input value
    const value = +document.querySelector("input").value;
    // get default year selected
    const defaultYear = value + 1961;
    this.treeWrap = this.svg.append("g").attr("class", "treewrap");
    this.data = this.refugee.filter((d) => d.Year == defaultYear);
    this.getBox(value);
    this.cleanData();
    this.drawLegend();
  }

  drawLegend() {
    // legend

    const legendWrap = this.svg.append("g").attr("class", "legend-wrap");
    // domain: 1,682,403, 20,444,819
    // border-size: 200, 600
    // color legend
    const colorCubes = legendWrap
      .selectAll("g")
      .data(this.colorSelection)
      .enter()
      .append("g");

    colorCubes
      .append("rect")
      .attr("x", 20)
      .attr("y", (d, i) => 10 + i * 40)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", (d, i) => this.colorSelection[i]);
    colorCubes
      .append("text")
      .text((d, i) => this.legendContinents[i])
      .attr("x", 40)
      .attr("y", (d, i) => 22 + i * 40)
      .attr("font-size", "14px");
  }

  getTreeData(year) {
    // fillter data by input value
    this.data = this.refugee.filter((d) => d.Year == year);
    // getBox() take the original input value
    this.getBox(+year - 1961);
    this.cleanData();
  }

  getBox(value) {
    const boxSize = 600 * 600;
    const boxScale = d3
      .scaleLinear()
      .domain([d3.min(this.sums), d3.max(this.sums)])
      .range([200, Math.sqrt(boxSize)]);
    const curSize = this.sums[value];
    this.treemap = d3
      .treemap()
      .tile(d3.treemapSquarify)
      .size([boxScale(curSize), boxScale(curSize)])
      .padding(1);
    this.treeWrap.attr(
      "transform",
      "translate(" + 0.5 * (this.width - boxScale(curSize)) + "," + 0 + ")"
    );
  }

  cleanData() {
    // sum of asylum from various origin countries
    const groupByCountry = d3
      .nest()
      .key((d) => d.Asylum_ISO)
      .entries(this.data);

    // add sum propterty to data and set sum to the total number of refugees TO the same asylum seeking country
    groupByCountry.forEach((d) => {
      if (d.values.length == 1) {
        d.sum = +d.values[0].Total;
      } else {
        d.sum = d.values.reduce((acc, cur) => {
          return +cur.Total + acc;
        }, 0);
      }
    });

    // get continent for each asylum country
    groupByCountry.forEach((c) => {
      c.continent = c.key ? this.continentDict[c.key].continent : null;
      c.name = c.key ? this.continentDict[c.key].name : null;
    });

    // group->hierarchy
    const groupByContinent = d3.group(groupByCountry, (d) => d.continent);
    this.root = this.treemap(
      d3
        .hierarchy(groupByContinent)
        .sum((d) => d.sum)
        .sort((a, b) => b.sum - a.sum)
    );
    // d is each entry inside Map Array, so sum() return the total number of refugees from all continents in that year
    this.drawTree(this.root);
  }

  drawTree() {
    // legend
    this.continents = ["EU", "AS", "AF", "NA", "SA", "OC", null];
    this.legendContinents = [
      "Europ",
      "Asia",
      "Africa",
      "North America",
      "South America",
      "Oceania",
      "Unknown",
    ];
    this.colorSelection = [
      "#025E73",
      "#D94B18",
      "#EBABC9",
      "#E39802",
      "#2FC287",
      "#B6AAF5",
      "#999999",
    ];

    const color = d3
      .scaleOrdinal()
      .domain(this.continents)
      .range(this.colorSelection);
    const treeDataJoin = this.treeWrap
      .selectAll("g")
      // need to assign key for each data, otherwise each g element will append multiple rect
      .data(this.root.leaves(), (d) => d.data.id);
    const groups = treeDataJoin.join("g").attr("class", "country-wrap");

    groups
      .append("rect")
      .attr("data-id", (d) => d.data.name)
      .attr("data-parent", (d) => d.data.continent)
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("fill", "steelblue")
      .attr("width", (d) => d.x1 - d.x0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("fill", (d) => color(d.parent.data[0]))
      .attr("stroke", "#999")
      .attr("stroke-width", 1);
    groups
      .append("title")
      .text((d) => (d.data.continent ? d.data.name : "unknown"))
      .attr("x", (d) => d.x0 + 15)
      .attr("y", (d) => d.y0 + 15)
      .attr("stroke", "#666")
      .attr("font-size", "12px");
  }
}
