export default class Spikes {
  constructor(svg, refugee, topo, ISOdict) {
    this.svg = svg;
    this.refugee = refugee;
    this.topo = topo;
    this.ISOdict = ISOdict;
    this.cleanData();
    this.drawSpikes();
  }

  cleanData() {
    const _refugeeByYear = d3
      .nest()
      .key((d) => d.Year)
      .key((d) => d.Origin_ISO)
      .entries(this.refugee);
    this.refugeeByYear = [];
    for (let i = 0; i < _refugeeByYear.length; i++) {
      let key = _refugeeByYear[i].key;
      let values = _refugeeByYear[i].values.filter((d) => d.key);
      this.refugeeByYear.push({ key, values });
    }
  }

  drawSpikes() {
    const projection = d3.geoMercator().translate([500, 500]);
    const path = d3.geoPath(projection);
    const mapData = topojson.feature(this.topo, this.topo.objects.countries)
      .features;
    const locationMap = d3.group(mapData, (d) => d.id);
    const _data1961 = this.refugeeByYear.filter((d) => d.key == "1961");
    // height of spike
    // const length = d3.scaleLinear(
    //   [0, d3.max(_data1961.map((d) => d.sum))],
    //   [0, 50]
    // );
    // path of each spike
    const spike = (length = 7, width = 7) =>
      `M${-width / 2},0L0,${-length}L${width / 2},0`;

    const spikeWrap = this.svg.append("g").attr("class", "spikewrap");
    const data1961 = _data1961.filter((d) => d.key);
    data1961.forEach((d) => {
      if (d.key) {
        //d.key -> ISO number
        const id = this.ISOdict[d.key];
        const feature = locationMap.get(id);
        d.id = id;
        d.sum = d3.sum(d.values, (v) => v.Total);
        d.position = path.centroid(locationMap.get(id)[0]);
      }
    });

    spikeWrap
      .selectAll("path")
      .data(data1961)
      .enter()
      .append("path")
      .attr("stroke", "steelblue")
      .attr("fill", "none")
      .attr("d", (d) => {
        // let spikeheight = length(d.sum);
        return d.key ? spike() : spike();
      })
      .attr("transform", (d) => {
        if (d.key) return `translate(${d.position[0]},${d.position[1]})`;
      });
  }
}
