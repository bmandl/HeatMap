import * as d3 from "d3";

const jsonLink = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const margin = {
    top: 100,
    right: 20,
    bottom: 30,
    left: 60
}

const tickValues = Array(12).fill(1).map((val, index) => new Date().setMonth(index));

const height = 630 - margin.top - margin.bottom;
const width = 920 - margin.left - margin.right;

const xScale = d3.scaleBand().rangeRound([0, width]);
const yScale = d3.scaleTime().range([0, height])
    .domain([new Date().setMonth(0), new Date().setMonth(11)]);

const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0f"));
const yAxis = d3.axisLeft(yScale)
    .tickValues(tickValues)
    .tickFormat(d3.timeFormat("%B"));

const colorPallete = d3.scaleQuantize().range([
    "#0080FF",
    "#178BE7",
    "#2E97D0",
    "#45A2B9",
    "#5CAEA2",
    "#73B98B",
    "#8BC573",
    "#A2D05C",
    "#B9DC45",
    "#D0E72E",
    "#E7F317",
    "#FFFF00",
    "#FFF300",
    "#FFE700",
    "#FFDC00",
    "#FFD000",
    "#FFC500",
    "#FFB900",
    "#FFAE00",
    "#FFA200",
    "#FF9700",
    "#FF8B00",
    "#FF8000",
    "#FF7000",
    "#FF6000",
    "#FF5000",
    "#FF4000",
    "#FF3000",
    "#FF2000",
    "#FF1000",
    "#FF0000"]
);

const dataDisplay = d3.select("body").append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .attr("class", "map")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

dataDisplay.append("text")
    .attr("id", "title")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "30px")
    .text("Monthly Global Land-Surface Temperature");

dataDisplay.append("text")
    .attr("id", "description")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2) + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("1753 - 2015: base temperature 8.66℃");

d3.json(jsonLink).then(dataset => {

    const data = dataset["monthlyVariance"];

    xScale.domain(data.map(val => val.year));
    xAxis.tickValues(xScale.domain().filter(year => year % 10 === 0));

    const cellWidth = width / xScale.domain().length;
    const cellHeight = height / 12;

    colorPallete.domain(d3.extent(data, d => d.variance + dataset["baseTemperature"]));

    dataDisplay.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(0,${(height)})`)
        .call(xAxis);

    dataDisplay.append("g")
        .attr("id", "y-axis")
        .call(yAxis);

    dataDisplay.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d =>
            xScale.domain().indexOf(d.year) * cellWidth
        )
        .attr("y", d =>
            ((d.month) - 1) * cellHeight
        )
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("class", "cell")
        .attr("data-month", d => new Date(yAxis.tickValues()[d.month - 1]).getMonth())
        .attr("data-year", d => d.year)
        .attr("data-temp", d => d.variance + dataset["baseTemperature"])
        .attr("fill", d => colorPallete(d.variance + dataset["baseTemperature"]))

});
