export default class Spikes {
  constructor(svg, projection, path, refugee, topo, ISOdict, sumMax) {
    this.svg = svg;
    this.projection = projection;
    this.path = path;
    this.refugee = refugee;
    this.topo = topo;
    this.ISOdict = ISOdict;
    this.sumMax = sumMax;
    this.cleanData();
    this.getSpikesData;
    this.init();
  }
  init() {
    this.spikeWrap = this.svg.append("g").attr("class", "spikewrap");
    this.defaultYear = +document.querySelector("input").value + 1961;
    this.getSpikesData(this.defaultYear);
  }

  cleanData() {
    // group data by year, then by country ISO abbr.
    const _refugeeByYear = d3
      .nest()
      .key((d) => d.Year)
      .key((d) => d.Origin_ISO)
      .entries(this.refugee);
    // remove data with unknown origin
    this.refugeeByYear = [];
    for (let i = 0; i < _refugeeByYear.length; i++) {
      let key = _refugeeByYear[i].key;
      // get rid of unknown countries, which {d.key:""}
      let values = _refugeeByYear[i].values.filter((d) => d.key);
      this.refugeeByYear.push({ key, values });
    }
  }

  getSpikesData(yearSelected) {
    // get data based on selected year
    const selected = this.refugeeByYear.filter((d) => d.key == yearSelected);
    // work only with refugee number info, get pass year layer
    const _selectedValues = selected[0].values;

    // prepare d3 map data with ISO dict
    const mapData = topojson.feature(this.topo, this.topo.objects.countries)
      .features;
    const locationMap = d3.group(mapData, (d) => d.id);

    // join topojson position data with refugee data
    // each entry shows one country's key(ISO abbr), id(ISO#), sum of refugee that year, position on d3 map
    _selectedValues.forEach((d) => {
      // d.key -> ISO number
      const id = this.ISOdict[d.key] && this.ISOdict[d.key].number;
      d.id = id;
      d.name = this.ISOdict[d.key] && this.ISOdict[d.key].name;
      d.sum = d3.sum(d.values, (v) => v.Total);
      // some countries don't have ISO# to match, some countries don't have map data, remove those countries
      d.position =
        id && locationMap.get(id)
          ? this.path.centroid(locationMap.get(id)[0])
          : null;
    });
    this.selectedValues = _selectedValues.filter((d) => d.position);

    this.drawSpikes(this.selectedValues);
  }

  drawSpikes() {
    // height of spike
    const length = d3.scaleLinear([0, this.sumMax], [0, 200]);
    // path of each spike
    const spike = (length, width) =>
      `M${-width / 2},0L0,${-length}L${width / 2},0`;
    let spikeDataJoin = this.spikeWrap
      .selectAll("path")
      .data(this.selectedValues);

    // transition
    const t = d3.transition().duration(750);

    // update
    spikeDataJoin
      .enter()
      .append("path")
      .merge(spikeDataJoin)
      .attr("class", "spike")
      .attr("data-id", (d) => d.id + d.key)
      .attr("data-name", (d) => d.name)
      .attr("data-sum", (d) => d.sum)
      .attr("stroke", "#3B7059")
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 1)
      .attr("fill", "#3B7059")
      .attr("fill-opacity", 0.5)
      .attr("transform", (d) => {
        return d.position
          ? `translate(${d.position[0]},${d.position[1]})`
          : null;
      })
      .transition(t)
      .attr("d", (d) => {
        let spikeheight = length(d.sum);
        return d.position ? spike(spikeheight, 12) : spike(null, null);
      });

    spikeDataJoin.exit().remove();

    const tooltip = document.querySelector("#tooltip");
    // add tooltip
    d3.selectAll(".spike")
      .on("mouseover", function (event) {
        const tooltiptext = tooltip.querySelector(".tooltip_text");
        let yearSelected =
          document.querySelector(".range").querySelector(".select").innerText ||
          "1961";

        const id_name = this.getAttribute("data-name");
        const v_number = this.getAttribute("data-sum");

        tooltiptext.innerHTML = `<strong> ${v_number}</strong> people from ${id_name} were under UNHCR’s mandate in ${yearSelected}`;

        tooltip.style.display = "block";

        tooltip.style.left = event.pageX + 30 + "px";
        tooltip.style.top = event.pageY - 80 + "px";
      })
      .on("mouseout", function () {
        tooltip.style.display = "none";
      });
  }
}
