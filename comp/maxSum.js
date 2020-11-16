export default function getMax(data) {
  const _refugeeByYear = d3
    .nest()
    .key((d) => d.Year)
    .key((d) => d.Origin_ISO)
    .entries(data);

  // an array of sum
  const sum = [];
  for (let i = 0; i < _refugeeByYear.length; i++) {
    const y = _refugeeByYear[i].values;
    const yearSum = [];
    y.forEach((v) => {
      let countryArray = v.values;
      let countrySum = countryArray
        .map((d) => +d.Total)
        .reduce((a, c) => a + c);
      yearSum.push(countrySum);
    });
    sum.push(d3.max(yearSum));
  }
  return sum;
}
