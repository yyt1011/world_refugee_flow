export default class Map {
  constructor(svg, projection, path, topo) {
    this.svg = svg;
    this.topo = topo;
    this.projection = projection;
    this.path = path;
    this.draw();
  }
  draw() {
    //set up world map generator

    const mapData = topojson.feature(this.topo, this.topo.objects.countries)
      .features;
    const mapWrap = this.svg.append("g").attr("class", "mapwrap");
    mapWrap
      .selectAll("path")
      .data(mapData)
      .enter()
      .append("path")
      .attr("d", this.path)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("fill", "#cdcdcd");
  }
}
