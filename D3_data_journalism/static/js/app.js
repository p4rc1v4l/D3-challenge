const svgWidth = 960;
const svgHeight = 500;

const margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100
};

const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// Initial Params
let chosenXAxis = "age";
let chosenYAxis = "healthcare";

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}
  
const tip = d3.tip()
    .attr('class', 'tooltip')
    .html(d => {
        return `${d.state}<hr><div>${capitalize(chosenXAxis)}: ${d[chosenXAxis]}</div><div>${capitalize(chosenYAxis)}: ${d[chosenYAxis]}</div>`;
    })
    .direction('e')
    .offset([0, 3]);

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
const svg = d3
    .select(".chart")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
const chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(tip);

// function used for updating x-scale var upon click on axis label
function getScale(demoFactors, chosenAxis, minFactor, maxFactor) {
    // create scales
    const linearScale = d3.scaleLinear()
        .domain([d3.min(demoFactors, d => d[chosenAxis]) * minFactor,
            d3.max(demoFactors, d => d[chosenAxis]) * maxFactor
        ])
    
    return linearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
    const bottomAxis = d3.axisBottom(newXScale);
    
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    
    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    const leftAxis = d3.axisLeft(newYScale);
    
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCirclesX(circlesGroup, newXScale, chosenX) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenX]));
    
    return circlesGroup;
}

function renderCirclesY(circlesGroup, newYScale, chosenY) {
    
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenY]));
    
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("static/data/data.csv").then(function (demoFactor, err) {
    if (err) throw err;
    
    // parse data
    demoFactor.forEach((factor, i) => {
        factor.age = +factor.age;
        factor.poverty = +factor.poverty;
        factor.healthcare = +factor.healthcare;
        factor.obesity = +factor.obesity;
        factor.income = +factor.income;
        factor.smokes = +factor.smokes;
        // console.log(`factor.abbr: ${factor.abbr} ----- i: ${i}`);
    });
    
    // xLinearScale function above csv import
    let xLinearScale = getScale(demoFactor, chosenXAxis, 0.95, 1.04).range([0, width]);
    
    let yLinearScale = getScale(demoFactor, chosenYAxis, 0.70, 1.07).range([height, 0]);
    
    // Create initial axis functions
    const bottomAxis = d3.axisBottom(xLinearScale);
    const leftAxis = d3.axisLeft(yLinearScale);
    
    // append x axis
    let xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);
    
    // append y axis
    let yAxis = chartGroup.append("g")
        //.attr("transform", `translate(${width}, 0)`)
        .call(leftAxis);
    
    // append initial circles
    let circlesGroup = chartGroup.selectAll("circle")
        .data(demoFactor)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => {
            const cx = xLinearScale(d[chosenXAxis]);
            // console.log(`cx ${cx} for ${d.abbr}  ----- i: ${i}`);
            return cx;
        })
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("fill", "blue")
        .attr("opacity", ".8")
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
    
    let texts = svg.selectAll("spam")
        .data(demoFactor)
        .enter()
        .append("text")
    
    let textLabels = texts
        .attr("x", d => {
            return xLinearScale(d[chosenXAxis]) + 89;
        })
        .attr("y", d => {
            return yLinearScale(d[chosenYAxis]) + 27;
        })
        .text((d, i) => {
            const textInCircle = d.abbr;
            // console.log(`textInCircle: ${textInCircle}  ----   i: ${i}`);
            return textInCircle;
        })
        .attr("font-family", "sans-serif")
        .attr("font-size", "15px")
        .attr("fill", "white");
    
    // Create group for two x-axis labels
    const bottomLabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
    const ageLabel = bottomLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", 'age')
        .classed("active", true)
        .text('Age (median)');
    
    const povertyLabel = bottomLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", 'poverty')
        .classed("inactive", true)
        .text('In Poverty (%    )');
    
    const incomeLabel = bottomLabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", 'income')
        .classed("inactive", true)
        .text('Household Income (Median)');
    
    // append y axis
    const leftLabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)");
    
    const healthcareLabel = leftLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("value", 'healthcare')
        .attr("dy", "1em")
        .classed("axis-text", true)
        .classed("active", true)
        .text('Lacks Healthcare (%)');
    
    const obesityLabel = leftLabelsGroup.append("text")
        .attr("y", 0 - margin.left + 20)
        .attr("x", 0 - (height / 2))
        .attr("value", 'obesity')
        .attr("dy", "1em")
        .classed("axis-text", false)
        .classed("inactive", true)
        .text('Obese (%)');
    
    const smokesLabel = leftLabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", 'smokes')
        .attr("dy", "1em")
        .classed("axis-text", false)
        .classed("inactive", true)
        .text('Smokes (%)');
    
    // x axis labels event listener
    bottomLabelsGroup.selectAll("text")
        .on(
            "click",
            function () {
                // get value of selection
                const value = d3.select(this).attr("value");
                // console.log(`bottom change - value: ${value} - xvalue: ${chosenXAxis}`);
                if (value !== chosenXAxis) {
                    
                    // replaces chosenXAxis with value
                    chosenXAxis = value;
                    
                    // console.log(chosenXAxis)
                    
                    // functions here found above csv import
                    // updates x scale for new data
                    xLinearScale = getScale(demoFactor, chosenXAxis, 0.95, 1.04).range([0, width]);
                    
                    // updates x axis with transition
                    xAxis = renderXAxes(xLinearScale, xAxis);
                    
                    // updates circles with new x values
                    circlesGroup = renderCirclesX(circlesGroup, xLinearScale, chosenXAxis);
                    
                    textLabels
                        .transition()
                        .duration(1000)
                        .attr("x", d => {
                            return xLinearScale(d[chosenXAxis]) + 89;
                        });
                    
                    // changes classes to change bold text
                    if (chosenXAxis === "age") {
                        ageLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenXAxis === "poverty") {
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        incomeLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        ageLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        povertyLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        incomeLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            }
        );
    
    leftLabelsGroup.selectAll('text')
        .on(
            "click",
            function () {
                // get value of selection
                const value = d3.select(this).attr("value");
                if (value !== chosenYAxis) {
                    
                    // replaces chosenXAxis with value
                    chosenYAxis = value;
                    
                    // console.log(chosenYAxis);
                    
                    // functions here found above csv import
                    // updates x scale for new data
                    yLinearScale = getScale(demoFactor, chosenYAxis, 0.70, 1.07).range([height, 0]);
                    
                    // updates x axis with transition
                    yAxis = renderYAxes(yLinearScale, yAxis);
                    
                    // updates circles with new x values
                    circlesGroup = renderCirclesY(circlesGroup, yLinearScale, chosenYAxis);
                    
                    textLabels
                        .transition()
                        .duration(1000)
                        .attr("y", d => {
                            return yLinearScale(d[chosenYAxis]) + 27;
                        });
                    
                    // changes classes to change bold text
                    if (chosenYAxis === "healthcare") {
                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else if (chosenYAxis === "obesity") {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        smokesLabel
                            .classed("active", false)
                            .classed("inactive", true);
                    } else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                        smokesLabel
                            .classed("active", true)
                            .classed("inactive", false);
                    }
                }
            }
        );
}).catch(function (error) {
    console.log(error);
});