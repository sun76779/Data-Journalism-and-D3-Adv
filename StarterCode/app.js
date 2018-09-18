var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})` );

// Initial Params
var chosenXAxis = "age";
var chosenYAxis = "smokes";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
      d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating x-scale var upon click on axis label
function yScale(data, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenYAxis]) * 0.8,
      d3.max(data, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

  return yLinearScale;

}




// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function yrenderAxes(newyscale, yAxis) {
  var leftAxis = d3.axisLeft(newyscale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, chosenYAxis, newyscale) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newyscale(d[chosenYAxis]));

  return circlesGroup;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {

  if (chosenXAxis === "age") {
    var label = "Age (Median):";
  }
  else if (chosenXAxis === "poverty") {
    var label = "In Poverty (%)";
  }
  else {
    var label = "Household Income (Median)";
  }

  
  if (chosenYAxis === "smokes") {
    var ylabel = "Smokes (%):";
  }
  else if (chosenYAxis === "obesity") {
    var ylabel = "Obesity (%)";
  }
  else {
    var ylabel = "healthcare (%)";
  }



  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([180, 60])
    .html(function(d) {
      return (`${d.state}<br>${label}${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);
  

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("data.csv", function(err, data) {
  if (err) throw err;

  // parse data
  data.forEach(function(data) {
    data.age = +data.age;
    data.abbr = data.abbr;
    data.smokes = +data.smokes;
    data.income = +data.income;
    data.poverty = +data.poverty;
    data.obesity = +data.obesity;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(data, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0,0)`) 
    .call(leftAxis);


  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 12)
    .attr("fill", "#89bdd3")
    .attr("opacity", ".5")
    .style("stroke-width", ".2")
    
  chartGroup.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("x", d => xLinearScale(d[chosenXAxis]-0.3))
    .attr("y", d => yLinearScale(d[chosenYAxis]-0.3))
    .attr("fill", "black")
    .attr("font-size", "14px")
    .text(function(d){ //console.log(d); 
      return d.abbr;});
 
  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var ageLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Age (Median)");

  var incomelabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");


  var povertylabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "poverty") // value to grab for event listener
    .classed("inactive", true)
    .text("Poverty (%)");    

  // append y axis
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)")
    .attr("dy", "1em");


  var obesityLabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 20 )
    .attr("x", 0 - (height / 2))
    .attr("value", "obesity") // value to grab for event listener
    .classed("active", true)
    .text("Obesity (%)");

    var smokeslabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 40 )
    .attr("x", 0 - (height / 2))
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokes (%)");


    var healthcarelabel = ylabelsGroup.append("text")
    .attr("y", 0 - margin.left + 60 )
    .attr("x", 0 - (height / 2))
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Healthcare (%)");




  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

  // x axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXaxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "income") {
          incomelabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertylabel
            .classed("active", false)
            .classed("inactive", true);  
        }

        else if (chosenXAxis === "poverty") {
          incomelabel
             .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertylabel
            .classed("active", true)
            .classed("inactive", false);  
        }

        else {
          incomelabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertylabel
            .classed("active", false)
            .classed("inactive", true);      
        }
      }
    });

// y axis labels event listener
labelsGroup.selectAll("text")
  .on("click", function() {
  // get value of selection
  var value = d3.select(this).attr("value");
  if (value !== chosenYAxis) {

    // replaces chosenXaxis with value
    chosenYAxis = value;

    // console.log(chosenXAxis)

    // functions here found above csv import
    // updates x scale for new data
    yLinearScale = yScale(data, chosenYAxis);

    // updates x axis with transition
    //yAxis = yrenderAxes(yLinearScale, yAxis);

    // updates circles with new x values
    circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

    // updates tooltips with new info
    circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

    // changes classes to change bold text
    if (chosenYAxis === "smokes") {
      smokeslabel
        .classed("active", true)
        .classed("inactive", false);
      obisityLabel
        .classed("active", false)
        .classed("inactive", true);
      healthcarelabel
        .classed("active", false)
        .classed("inactive", true);  
    }

    else if (chosenYAxis === "healthcare") {
      smokeslabel
         .classed("active", false)
        .classed("inactive", true);
      obesityLabel
        .classed("active", false)
        .classed("inactive", true);
      healthcarelabel
        .classed("active", true)
        .classed("inactive", false);  
    }

    else {
      smokeslabel
        .classed("active", false)
        .classed("inactive", true);
      obesityLabel
        .classed("active", true)
        .classed("inactive", false);
      healthcarelabel
        .classed("active", false)
        .classed("inactive", true);      
    }
  }
});

});

