export default class Range {
  constructor() {
    this.select = document.querySelector("input").value;
    this.something();
  }

  something() {
    console.log(this.select);
  }
}
