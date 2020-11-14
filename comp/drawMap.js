export default class Map {
  constructor(svg, topo) {
    this.svg = svg;
    this.topo = topo;
    this.draw();
  }
  draw() {
    //set up world map generator
    const projection = d3.geoMercator().translate([500, 500]);
    const path = d3.geoPath(projection);
    const mapData = topojson.feature(this.topo, this.topo.objects.countries)
      .features;
    const mapWrap = this.svg.append("g").attr("class", "mapwrap");
    mapWrap
      .selectAll("path")
      .data(mapData)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1)
      .attr("fill", "#cdcdcd");
  }
}
