var mc_generators_file_id = ["rbf", "rt"]

var paths = [
  "output/no_drift/",
  "output/intra_class/global/",
  "output/intra_class/local/",
  "output/inter_class/global/",
  "output/inter_class/local/",
  "output/harder_streams/",
];

var experiments_prefix = [
  "no_drift",
  "single_class_global",
  "single_class_local",
  "multi_class_global",
  "multi_class_local",

]

var intra_class_local = [
  ["emerging_cluster",
    "reappearing_cluster",
    "splitting_cluster",
    "merging_cluster",
    "moving_cluster"],
  ["emerging_branch",
    "prune_regrowth_branch",
    "prune_growth_new_branch"]
];

var intra_class_global =
  [
    ["reappearing_cluster",
      "moving_cluster",
      "splitting_cluster",
      "merging_cluster",
      "class_emerging_rbf"],
    ["prune_regrowth_branch",
      "prune_growth_new_branch",
      "class_emerging_rt"]
  ];

var inter_class_local = [
  ["emerging_cluster",
    "reappearing_cluster",
    "splitting_cluster",
    "merging_cluster",
    "moving_cluster",
    "swap_cluster"],
  ["emerging_branch",
    "prune_regrowth_branch",
    "prune_growth_new_branch",
    "split_node",
    "swap_leaves"]
];

var inter_class_global = [
  ["reappearing_cluster",
    "moving_cluster",
    "splitting_cluster",
    "merging_cluster",
    "swap_cluster"],
  ["prune_regrowth_branch",
    "prune_growth_new_branch",
    "split_node",
    "swap_leaves"]
];


var difficulties = [
  NaN, intra_class_global, intra_class_local, inter_class_global, inter_class_local
];

var drift_detectors = ["ADWIN", "DDM", "RDDM", "HDDM", "EDDM", "ECDD", "KSWIN", "STEPD", "PageHinkley"]

var dataset_display = NaN;

var metrics = ["acc", "kappa", "gmean", "minority"]

// order here based on ID of experimentBox (careful not order it's shown in the list)

var classifier_colors = ["#99632e",  "#253a5a", "#02924c"];

var colors = [
  "#1A9850",
  "#F46D43",
  "#878787",
  "#D1E5F0",
  "#4D4D4D",
  "#FFFFBF",
  "#E7D4E8",
  "#2166AC",
  "#80CDC1",
  "#4D9221",
  "#FDAE61",
  "#4575B4",
  "#313695",
  "#3288BD",
  "#01665E",
  "#FEE090",
  "#D53E4F",
  "#FDAE61",
  "#f8816b",
  "#b893a6",
  "#D73027",
  "#FEE0B6",
  "#9970AB",
  "#ABD9E9",
];

var maxXAxis = 1000;
var minXAxis = 500;
var maxYAxis = 1;

var activeMetric = "Kappa";
var activeild = -1;

var movingAverageWindow = 20;

var resultsTable = null;

var experimentHasChanged = false;
var experimentHasLoaded = false;
var scrubberAutoChange = false;

var classes_affected = [[2] , [2, 3], [2,3, 5] , [2,5, 10]]

function onMovingAvg() {
  var selectedValue = document.getElementById("avgBox").value;
  var idx = document.getElementById("experimentBox").value;
  movingAverageWindow = selectedValue;
  if (idx >= 0) {
    updateChart();
  }
}


function fill_generators(expIdx) {
  let element = document.getElementById("generatorBox");
  element.innerHTML = "";
  let placeholder = document.createElement("option");
  placeholder.disabled = "disabled";
  placeholder.selected = "selected";
  placeholder.innerHTML = "Generator";
  element.append(placeholder);


  mc_generators = ["Random RBF", "RandomTree",]
  mc_generators_file_id = ["rbf", "rt"]

  for (index in mc_generators) {
    let val = mc_generators[index];
    var option = document.createElement("option");
    option.value = index;
    option.text = val;
    element.appendChild(option);
  }
}


function fillDifficulty(possible_cases, genId) {
  let element = document.getElementById("difficultyBox");
  element.innerHTML = "";
  let placeholder = document.createElement("option");
  placeholder.disabled = "disabled";
  placeholder.selected = "selected";
  placeholder.innerHTML = "Drift difficulty";
  element.append(placeholder);
  let possibilities = possible_cases[genId];
  console.log(possibilities)
  for (index in possibilities) {
    let val = possibilities[index];
    var option = document.createElement("option");
    option.value = index;
    option.text = val;
    element.appendChild(option);
  }
}

function fillClassesAffected (number_of_classes){
  let expId = parseInt(document.getElementById("experimentBox").value);
  let genId = parseInt(document.getElementById("generatorBox").value);
  let difficultId = parseInt(document.getElementById("difficultyBox").value);
  let classes = [2, 3, 5, 10];
  to_be_display = classes_affected[classes.indexOf(parseInt(number_of_classes))];
  let element = document.getElementById("classesAffectedBox");
  element.innerHTML = "";
  if (expId == 3 && genId == 0 && difficultId == 0){
    console.log(to_be_display);
    to_be_display = to_be_display.slice(0,to_be_display.length-1);
    console.log(to_be_display);
    if (number_of_classes == 2){
      $('#numberClassBox option[value="3"]').attr("selected", "selected");
      changeClass();
      //$("#numberClassBox").val("3").change();
      //updateChart();
    }
  }
    for (index in to_be_display) {
      let val = to_be_display[index];
      var option = document.createElement("option");
      option.value = val;
      option.text = val;
      element.appendChild(option);
    }


}

function fillFeatures() {

  let number_of_features = document.getElementById("featuresBox").value;
  let X_axis = document.getElementById("xAxisBox");
  X_axis.innerHTML = "";
  for (index = 0; index < number_of_features; index++) {
    var option = document.createElement("option");
    option.value = index;
    option.text = "X_" + (index + 1);
    if (index == 0) {
      option.selected = true;
    }
    X_axis.append(option);
  }
  let Y_axis = document.getElementById("yAxisBox");
  Y_axis.innerHTML = "";
  for (index = 0; index < number_of_features; index++) {
    var option = document.createElement("option");
    option.value = index;
    option.text = "X_" + (index + 1);
    if (index == 1) {
      option.selected = true;
    }
    Y_axis.append(option);
  }
}

function changeDifficulty() {
  let expId = document.getElementById("experimentBox").value;
  let number_of_classes = document.getElementById("numberClassBox").value;
  $("#numberClassForm").show();
  $("#featuresForm").show();
  $("#driftSpeedForm").show();
  //$("#imbalanceForm").show();
  $("#driftDetectorForm").show();
  if (expId > 2){
    fillClassesAffected(number_of_classes);
    $("#classesAffectedForm").show();
  }
  updateChart();
}

function changeGenerator() {
  let expId = document.getElementById("experimentBox").value;
  let genId = document.getElementById("generatorBox").value;
  $("#numberClassForm").hide();
  $("#error_msg").hide();
  $("#featuresForm").hide();
  $("#driftSpeedForm").hide();
  $("#driftDetectorForm").hide();
  //$("#imbalanceForm").hide();
  $("#featureSpaceBox").hide();
  $("#classesAffectedForm").hide();
  $(".graph").hide();
  $("#legendBox").hide();
  if (expId > 0) {
    fillDifficulty(difficulties[expId], genId);
    $("#difficultyForm").show();
  } else {
    $("#numberClassForm").show();
    $("#featuresForm").show();
    //$("#imbalanceForm").show();
    $("#driftDetectorForm").show();
    updateChart();
  }

}

function changeExperiment() {
  let expId = document.getElementById("experimentBox").value;
  //$("#generatorForm").hide();
  $("#numberClassForm").hide();
  $("#featuresForm").hide();
  $("#error_msg").hide();
  $("#difficultyForm").hide();
  $("#driftSpeedForm").hide();
  //$("#imbalanceForm").hide();
  $("#driftDetectorForm").hide();
  $("#granularityForm").hide();
  $("#featureSpaceBox").hide();
  $("#classesAffectedForm").hide();
  $("#legendBox").hide();
  $(".graph").hide();
  $(".links").hide()
  fill_generators(expId);
  //fillDatasets(bc_generators_display);
  $("#generatorForm").show();

  //updateChart();
}

function getData(experiment, generatorIdx, difficultIdx, number_of_classes, number_of_features, speed_drift) {
  //var algorithm = classifiers[algIdx];
  //var path = paths[expIdx];

  //var imbalance = document.getElementById("imbalanceBox").value;
  var imbalance = 0;
  var dd = parseInt(document.getElementById("driftDetectorBox").value);
  var ca = parseInt(document.getElementById("classesAffectedBox").value);

  if (isNaN(ca)){
    ca =1;
  }
  
  if (imbalance == 0) {
    imbalance = "1";
  } else {
    imbalance = number_of_classes;
  }
  var csv_file = "";
  var df = difficulties[experiment][generatorIdx];
  console.log(df);
  if (experiment == 0) {
    csv_file = "HT_" + drift_detectors[dd] + "_" + experiments_prefix[experiment] +
      "_" + mc_generators_file_id[generatorIdx] + "_c_"
      + number_of_classes + "_f_" + number_of_features + "_1_" + imbalance + ".csv";

    data_file = experiments_prefix[experiment] +
      "_" + mc_generators_file_id[generatorIdx] + "_c_"
      + number_of_classes + "_f_" + number_of_features + "_1_" + imbalance + ".csv";
  } else if (experiment < 3){
    csv_file = "HT_" + drift_detectors[dd] + "_" + experiments_prefix[experiment] +
    "_" + df[difficultIdx] + "_ds_" + speed_drift +
    "_c_" + number_of_classes + "_ca_" + 1 + "_f_" + number_of_features + "_1_" + imbalance + ".csv";

  data_file = experiments_prefix[experiment] +
  "_" + df[difficultIdx] + "_ds_" + speed_drift +
  "_c_" + number_of_classes + "_ca_" + 1 + "_f_" + number_of_features + "_1_" + imbalance + ".csv";

  } 
  
  else {
    csv_file = "HT_" + drift_detectors[dd] + "_" + experiments_prefix[experiment] +
      "_" + df[difficultIdx] + "_ds_" + speed_drift +
      "_c_" + number_of_classes + "_ca_" + ca + "_f_" + number_of_features + "_1_" + imbalance + ".csv";

    data_file = experiments_prefix[experiment] +
    "_" + df[difficultIdx] + "_ds_" + speed_drift +
    "_c_" + number_of_classes + "_ca_" + ca + "_f_" + number_of_features + "_1_" + imbalance + ".csv";
  }

  //console.log(paths[experiment])
  //console.log(csv_file)

  //HT_ADWIN_no_drift_hyp_f_2_c_10_1: 1
  // HT_ADWIN_intra_class_drift_emerging_branch_rt_ds_1_f_2_c_2_1: 1
  http_prefix = "https://www.cmsc508.com/~aguiargj/"
  return [http_prefix+"output/" + csv_file, http_prefix+"/datasets/" + data_file];
}


function updateChart() {
  $(".graph").hide();
  //$("#resultsTable").hide();
  $("#legendBox").hide();
  $("#featureSpaceBox").hide();
  $(".links").hide();
  $("#error_msg").hide();
  $("#loader").show();

  //scrubber.value(0);

  let experiment = document.getElementById("experimentBox").value;
  let generatorIdx = document.getElementById("generatorBox").value;
  let difficultIdx = document.getElementById("difficultyBox").value;
  let number_of_classes = document.getElementById("numberClassBox").value;
  //fillClassesAffected(number_of_classes);
  let number_of_features = document.getElementById("featuresBox").value;
  let speed_drift = NaN
  if (experiment > 0) {
    speed_drift = document.getElementById("driftSpeedBox").value;
  }

  d3.selectAll("#xaxes").remove();
  d3.selectAll("#yaxes").remove();
  d3.selectAll(".metric").remove();
  d3.selectAll(".data_dist").remove();
  fillFeatures();

  csv_names = [];
  files = getData(experiment, generatorIdx,
    difficultIdx, number_of_classes, number_of_features, speed_drift);
  file_name = files[0], data_file = files[1];
  console.log(file_name);
  console.log(data_file);
  csv_names.push(file_name);


  //if (experimentHasLoaded) {
  //  experimentHasChanged = true;
  // }

  processFiles(file_name, data_file, experiment);
}

function changeClass() {
  let number_of_classes = document.getElementById("numberClassBox").value;
  fillClassesAffected(number_of_classes);
  updateChart();
}

function changeFeatureNumber() {
  updateChart();
}

function changeDriftSpeed() {
  updateChart();
}


function changeGranularity() {
  drawDataset(scrubber_value);
}

function changeFeatureSpace() {

  drawDataset(scrubber_value);

}

function changeMetric(trigger = true) {

  //console.log("changed alg");

  for (i = 0; i < metrics.length; i++) {
    if (document.getElementById(i + "-check").checked) {
      d3.selectAll("#" + metrics[i])
        .transition()
        .style("stroke-opacity", 1);


    } else {
      d3.selectAll("#" + metrics[i])
        .transition()
        .style("stroke-opacity", 0);

    }
  }

}


function readCSV(csv_file) {
  //console.log(metric);
  return d3.csv(csv_file, function (d) {
    //let n_classes = parseInt(document.getElementById("numberClassBox").value);
    d.iteration = parseInt(d["idx"]);
    //d.gmean_min = parseFloat(d["class_" + (n_classes - 1)])
    return d;
  }).catch(function(error){
    console.log(error);
    $("#loader").hide();
    $("#error_msg").show();
  });
}

function computeExtent(range1, range2) {
  range = [range1[0], range1[1]];
  if (range1[0] > range2[0]) {
    range[0] = range2[0];
  }
  if (range1[1] < range2[1]) {
    range[1] = range2[1];
  }

  return range;
}


function processFiles(csv_file, data_points, expIdx) {

  readCSV(csv_file).then((file) => {
    readCSV(csv_file.replace("HT", "AHT")).then((file_aht) => {
      readCSV(csv_file.replace("HT", "HT_DW")).then((file_htdw) => {

    console.log(file)
    let Xrange = d3.extent(file, function (d) {
      return d.iteration;
    });
    Xrange[0] = Xrange[0] - 500;
    Xrange[1] = Xrange[1] + 500;
    xMetric.domain(Xrange);
    scrubber.max(Xrange[1]);

    for (i in file){
      file[i].aht = file_aht[i].accuracy;
      file[i].htdw = file_htdw[i].accuracy;
    }
    
    document.getElementById("data-link").setAttribute("href", data_points)
    document.getElementById("ht-link").setAttribute("href", csv_file)
    document.getElementById("aht-link").setAttribute("href", csv_file.replace("HT", "AHT"))
    document.getElementById("htdw-link").setAttribute("href", csv_file.replace("HT", "HT_DW"))

    console.log("update 3");
    console.log(file);
    yMetric.domain([0, 1]);

    let j = 0;
    //data_points = "datasets/inter_class/local/inter_class_drift_emerging_branch_rt_ds_10000_f_10_c_3_1:1.csv"
    readCSV(data_points).then((dataset) => {

      dataset_display = dataset;

      buildAxes();
      drawGraph(file, 0, expIdx);
      drawDataset(500);
      //$("#bar-title").text(activeMetric);
      //updateBarRace();

      $("#metric-graph").show();
      $("#points-graph").show();

      //$("#bar-graph").show();
      //reloadTable();

      $("#loader").hide();
      $("#legendBox").show();
      $("#featureSpaceBox").show();
      $("#granularityForm").show();
      $(".links").show();

    })
  })
  })
  })
    .catch((err) => {
      console.log(err);
    });
}


function drawDataset(value, onTheFly) {
  //console.log(value);
  let granularity = parseInt(document.getElementById("granularityBox").value);
  if (onTheFly) {
    granularity = Math.min(granularity, 1000);
  }
  let number_of_features = document.getElementById("featuresBox").value;
  data_to_display = dataset_display.slice(Math.max(0, value - granularity), value);
  let feats = [0, 0];
  feats[0] = parseInt(document.getElementById("xAxisBox").value);
  feats[1] = parseInt(document.getElementById("yAxisBox").value);
  //console.log(feats);
  //console.log(data_to_display);
  d3.selectAll(".data_dist").remove();
  for (i in data_to_display) {
    graphPoints
      .append("circle")
      .attr("r", 2.0)
      .attr("cx", xData(data_to_display[i][feats[0]]))
      .attr("cy", yData(data_to_display[i][feats[1]]))
      .attr("fill", colors[parseInt(data_to_display[i][number_of_features])])
      .attr("class", "data_dist");
  }
}

function drawGraph(data, algIdx, expIdx) {
  //algorithm = classifiers[algIdx];
  color = colors[0];


  graphMetric
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", classifier_colors[0])
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("id", metrics[0])
    .attr("class", "metric")
    .attr("d", lineAccuracy);

  graphMetric
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", classifier_colors[1])
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("id", metrics[1])
    .attr("class", "metric")
    .attr("d", lineAHT);
  
    graphMetric
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", classifier_colors[2])
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("id", metrics[2])
    .attr("class", "metric")
    .attr("d", lineHTDW);
  /*graphMetric
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", colors[2])
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("id", metrics[2])
    .attr("class", "metric")
    .attr("d", lineGmean);

  graphMetric
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "#ABD9E9")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("id", metrics[3])
    .attr("class", "metric")
    .attr("d", lineMinority);*/

  for (i in data) {
    row = data[i];
    //console.log(row);
    if (parseInt(row.drifts_alerts) > 0) {
      //console.log(row);
      graphMetric
        .append("line")
        .attr("x1", xMetric(row.iteration))
        .attr("x2", xMetric(row.iteration))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("class", "metric")
        .style("stroke-width", 1)
        .style("stroke", "#f25c5f")
        .style("fill", "none")
        .style("stroke-dasharray", 2)
    }
  }


}

function buildAxes() {
  let experiment = document.getElementById("experimentBox").value;
  //let metric = document.getElementById("metricBox").value;

  graphMetric
    .append("g")
    .attr("id", "xaxes")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(xMetric))
    .append("text")
    .attr("fill", "#000")
    .attr("dx", + svgMetric.attr("width") / 2)
    .attr("dy", "30px")
    .attr("text-anchor", "end")
    .text("Instances");

  graphMetric
    .append("g")
    .attr("id", "yaxes")
    .call(d3.axisLeft(yMetric))
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-35px")
    .attr("dx", "-200px")
    .attr("text-anchor", "end")

  graphPoints
    .append("g")
    .attr("id", "xaxes")
    .attr("transform", "translate(0," + d_height / 2 + ")")
    .call(d3.axisBottom(xData));

  graphPoints
    .append("g")
    .attr("id", "yaxes")
    .call(d3.axisLeft(yData))
    .attr("transform", "translate(" + d_width / 2 + ", 0)")
    .append("text")
    .attr("fill", "#000")
    .attr("transform", "rotate(-90)")
    .attr("dy", "-35px")
    .attr("dx", "-200px")
    .attr("text-anchor", "end")

  graphPoints.selectAll(".tick").attr("opacity", 0.4)
}

function movingAverage(values, N) {
  let i = 0;
  let sum = 0;
  let N_start = 1;
  const means = new Float64Array(values.length).fill(NaN);

  for (let n = values.length; i < n; ++i) {
    sum += values[i];
    means[i] = sum / N_start;

    if (N_start < N) {
      N_start += 1;
    } else {
      sum -= values[i - N + 1];
    }
  }
  return means;
}

function buttonReplay() {
  updateBarRace(scrubber.value());
  return;
}

function computeAverage(data) {
  var average =
    data.reduce((total, next) => total + next.metric, 0) / data.length;
  var lastObj = data[data.length - 1];
  lastObj.iteration = "Average";
  lastObj.metric = average;
  data.push(lastObj);
  return data;
}

function computeMovingAverage(data) {
  metric_mv_avg = movingAverage(
    data.map((d) => d.metric),
    movingAverageWindow
  );

  data.map((d, i) => {
    d.metric = metric_mv_avg[i];
  });

  return data;
}
