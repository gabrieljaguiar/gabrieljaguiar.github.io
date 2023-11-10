const svgMetric = d3.select("#svgMetric"),
    svgPoints = d3.select("#svgPoints"),
    margin = { top: 20, right: 20, bottom: 30, left: 50 },
    width = +svgMetric.attr("width") - margin.left - margin.right,
    height = +svgMetric.attr("height") - margin.top - margin.bottom,
    d_width = +svgPoints.attr("width") - margin.left - margin.right,
    d_height = +svgPoints.attr("height") - margin.left - margin.right,
    graphMetric = svgMetric
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    graphPoints = svgPoints.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const xMetric = d3.scaleLinear().rangeRound([0, width]),
    yMetric = d3.scaleLinear().rangeRound([height, 0]);

const xData = d3.scaleLinear().rangeRound([0, d_width]),
    yData = d3.scaleLinear().rangeRound([d_height, 0]);

xData.domain([-1.25, 1.25]);
yData.domain([-1.25, 1.25]);
yMetric.domain([-1, 1]);

var lineAccuracy = d3
    .line()
    .x(function (d) {
        return xMetric(d.iteration);
    })
    .y(function (d, i) {
        return yMetric(d.accuracy);
    });

var lineKappa = d3
    .line()
    .x(function (d) {
        return xMetric(d.iteration);
    })
    .y(function (d, i) {
        return yMetric(d.kappa);
    });

var lineAHT = d3
    .line()
    .x(function (d) {
        return xMetric(d.iteration);
    })
    .y(function (d, i) {
        return yMetric(d.aht);
    });
var lineHTDW = d3
    .line()
    .x(function (d) {
        return xMetric(d.iteration);
    })
    .y(function (d, i) {
        return yMetric(d.htdw);
    });
var lineGmean = d3
    .line()
    .x(function (d) {
        return xMetric(d.iteration);
    })
    .y(function (d, i) {
        return yMetric(d.gmean);
    });


var lineMinority = d3
    .line()
    .x(function (d) {
        return xMetric(d.iteration);
    })
    .y(function (d, i) {
        return yMetric(d.gmean_min);
    });

var scrubber = new ScrubberView();
var scrubber_value = 500;
scrubber.min(500).step(500);

// Append it to the dom
$("#scrubber-div").append(scrubber.elt);

scrubber.onScrubStart = function (value) {
    $("#inst-counter").text(value);
    console.log(value); // the value at the time of scrub start
};

// onValueChanged is called whenever the scrubber is moved.
scrubber.onValueChanged = function (value) {
    const transitionMetric = svgMetric
        .transition()
        .duration(2)
        .ease(d3.easeLinear);

    if (!scrubberAutoChange) {
        $("#title-data").text("i: " + value);
        //drawDataset(value);
        updateActual(value, transitionMetric);
        drawDataset(value, true);
        scrubber_value = value;
        //console.log(value);
    }
};

// onScrubEnd is called whenever a user stops scrubbing
scrubber.onScrubEnd = function (value) {
    const transitionMetric = svgMetric
        .transition()
        .duration(2)
        .ease(d3.easeLinear);

    if (!scrubberAutoChange) {
        $("#title-data").text("i: " + value);
        drawDataset(value, false);
        //updateActual(value, transitionMetric);
        scrubber_value = value;
        //console.log(value);
    }
};

var updateActual = verticalLine(svgMetric);

function verticalLine(svg) {
    let actual = svg
        .append("line")
        .attr("x1", xMetric(scrubber.value()) + margin.left) //<<== change your code here
        .attr("y1", margin.top)
        .attr("x2", xMetric(scrubber.value()) + margin.left) //<<== and here
        .attr("y2", height + margin.top)
        .attr("marker-end", "url(#arrowhead)")
        .attr("stroke-dasharray", "5,5")
        .style("stroke-width", 2)
        .style("stroke", "grey")
        .style("fill", "none");

    return (date, transition) =>
        actual.call((line) =>
            line
                .transition(transition)
                .attr("transform", `translate(${xMetric(date)}, 0)`)
                .attr("stroke-opacity", date == "Average" ? "0%" : "50%")
        );
}


