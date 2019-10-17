import * as d3 from "d3";

const jsonLink = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const margin = {
    top: 100,
    right: 20,
    bottom: 120,
    left: 65
}

const padding = {
    top: 100,
    right: 20,
    bottom: 30,
    left: 65
}


const height = 630 - margin.top - margin.bottom;
const width = 1137 - margin.left - margin.right;
const tickValues = Array(12).fill(1).map((val, index) => new Date().setMonth(index));

const xScale = d3.scaleBand().rangeRound([0, width]);
const yScale = d3.scaleTime().range([0, height])
    .domain([new Date().setMonth(-1), new Date().setMonth(11)]);

const xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0f"));
const yAxis = d3.axisLeft(yScale)
    //.tickValues(tickValues)    
    .tickSize(5, 0)
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

const lScale = d3.scaleLinear().rangeRound([0, 400]);
const lAxis = d3.axisBottom(lScale)
    .tickFormat(d3.format(".1f"))
    .tickSize(10, 0);

const dataDisplay = d3.select("body").append("svg")
    .attr("height", height + margin.top + margin.bottom)
    .attr("width", width + margin.left + margin.right)
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

dataDisplay.append("text")
    .attr("id", "title")
    .attr("x", (width / 2))
    .attr("y", (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "30px")
    .text("Monthly Global Land-Surface Temperature");

dataDisplay.append("text")
    .attr("id", "description")
    .attr("x", (width / 2))
    .attr("y", (margin.top / 2) + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .text("1753 - 2015: base temperature 8.66℃");

const legend = dataDisplay.append("g")
    .attr("id", "legend")
    .append("g")

d3.json(jsonLink).then(dataset => {
    var buff = 0;
    const data = dataset["monthlyVariance"];

    xScale.domain(data.map(val => val.year));
    xAxis.tickValues(xScale.domain().filter(year => year % 10 === 0));

    lScale.domain(d3.extent(data, d => d.variance + dataset["baseTemperature"]));
    lAxis.tickValues(data.map(d => d.variance + dataset["baseTemperature"])
        .sort((a, b) => a - b)
        .filter((d, i, arr) => {
            buff = d >= buff + arr.slice(-1)[0] / 12 || buff === undefined ? d : buff;
            return d === buff;
        }));

    buff = undefined;

    const cellWidth = width / xScale.domain().length;
    const cellHeight = height / 12;

    const lWidth = 40;
    const lHeight = 40;

    colorPallete.domain(d3.extent(data, d => d.variance + dataset["baseTemperature"]));

    dataDisplay.append("g")
        .attr("id", "x-axis")
        .attr("transform", `translate(${padding.left - cellWidth / 2},${(padding.top + height)})`)
        .call(xAxis);

    dataDisplay.append("g")
        .attr("id", "y-axis")
        .attr("transform", `translate(${padding.left - cellWidth / 2 - 1},${padding.top})`)
        .call(yAxis);

    dataDisplay.append("g")
        .attr("class", "map")
        .attr("transform", `translate(${padding.left},${padding.top})`)
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("x", d =>
            xScale.domain().indexOf(d.year) * cellWidth - cellWidth / 2)
        .attr("y", d => ((d.month) - 1) * cellHeight)
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("class", "cell")
        .attr("data-month", d => new Date(tickValues[d.month - 1]).getMonth())
        .attr("data-year", d => d.year)
        .attr("data-temp", d => d.variance + dataset["baseTemperature"])
        .attr("fill", d => colorPallete(d.variance + dataset["baseTemperature"]))

    legend.append("g")
        .call(lAxis)
        .attr("transform", `translate(10,${margin.top + height + 80})`)

    legend.selectAll("rect")
        .data(data.map(d => d.variance + dataset["baseTemperature"])
            .sort((a, b) => a - b)
            .filter((d, i, arr) => {
                buff = d >= buff + arr.slice(-1)[0] / 12 || buff === undefined ? d : buff;
                return d === buff;
            })
        )
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * lWidth +10)
        .attr("y", margin.top + height + 40)
        .attr("width", lWidth)
        .attr("height", lHeight)
        .attr("fill", d => colorPallete(d))

});
