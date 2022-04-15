var eigenlist;
var baseUrl = "http://localhost:5000/";
var eigen_values = [];
var eigenc_values = [];
var cumulative_values = [];
var important_columns = [];
var scatter_data;
var dataobjE = [];
var dataobjC = [];
var dataobjP = [];
var vectors = [];
var columns = [];
var paths = [];
var atrributes = new Map();
atrributes.set(0, 'num_critic_for_reviews');
atrributes.set(1, 'duration');
atrributes.set(2, 'director_facebook_likes');
atrributes.set(3, 'actor_3_facebook_likes');
atrributes.set(4, 'actor_1_facebook_likes');
atrributes.set(5, 'gross');
atrributes.set(6, 'num_voted_users');
atrributes.set(7, 'cast_total_facebook_likes');
atrributes.set(8, 'facenumber_in_poster');
atrributes.set(9, 'num_user_for_reviews');
atrributes.set(10, 'budget');
atrributes.set(11, 'actor_2_facebook_likes');
atrributes.set(12, 'imdb_score');
atrributes.set(13, 'movie_facebook_likes');
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function getPCPData() {
	const url = baseUrl + "fetchPCPData"
	let response = await fetch(url)
	pcpData = await response.json()

	return drawPcpPlot("labaled_data.csv", 18, 0)
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawPcpPlot(coutryname, demo_status,year) {
	document.getElementById("pcp").innerHTML = ""

	//colors = ['#a6cee3','#cab2d6', '#b2df8a', '#b15928', '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', '#ffff99'];
	colors = ['#74add4', '#b2df8a', '#f4a2a4', '#fb9a99', '#fdbf6f', '#cab2d6']

	svgWidth = 900,
		svgHeight = 550,
		margin = {
			top: 80,
			right: 50,
			bottom: 30,
			left: 100
		},
		width = svgWidth - margin.left - margin.right,
		height = svgHeight - margin.top - margin.bottom;

	var x, y = {},
		dimensions, dragging = {},
		background, foreground;

	var svg = d3.select("#pcp").append("svg")
		.attr("width", svgWidth)
		.attr("height", svgHeight)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");


	d3.csv("static/data/newDemo.csv", function(error, data) {
		dimensions = d3.keys(data[0]).filter(function(key) {
			if (key == 'ID_year' || key == 'direct_democracy'
			|| key == 'electoral_participation' || 
			key == 'basic_welfare' || key == 'inclusive_suffrage'
			|| key == 'social_group_equality' || key == 'elected_government' 
			|| key == 'absence_of_corruption' || key == 'access_to_justice' 
			|| key == 'freedom_of_religion' || key == 'civil_society_participation') {
				
					y[key] = d3.scaleLinear()
					.domain(d3.extent(data, function(d) {
						//if(d['ID_year']==year){
							//console.log(key+":"+year)
						    return +d[key];
						//}
					}))
					.range([height, 0]);
					console.log(y)
					y[key].brush = d3.brushY()
					.extent([
						[-5, y[key].range()[1]],
						[5, y[key].range()[0]]
					])
					.on("brush", brush)
					.on("start", brushstart);
				return key;
			}
		});

		x = d3.scalePoint()
			.domain(dimensions)
			.range([0, width]);

		background = svg.append("g")
			.attr("class", "background")
			.selectAll("path")
			.data(data)
			.enter().append("path")
			.attr("d", line)

		foreground = svg.append("g")
			.attr("class", "foreground")
			.selectAll("path")
			.data(data)
			.enter().append("path")
			.attr("d", line)
			.style("stroke", function(d) {
			if (demo_status==6){
				if (d.country == coutryname) {
					return 'red';
				} else {
					if (coutryname == 'test') {
						return colors[d.democratic_performance_numeric - 1];
					} else {
						return '#dadada';
					}
				}
			}
			
			else {
				if (d.democratic_performance_numeric == demo_status) {
					return 'red';
				} else {
					return '#dadada'
				}
			}
			});

		var g = svg.selectAll(".dimension")
			.data(dimensions)
			.enter().append("g")
			.attr("class", "PCPaxis")
			.attr("transform", function(d) {
				return "translate(" + x(d) + ")";
			})
			.call(d3.drag()
				.on("start", function(d) {
					dragging[d] = x(d);
					background.attr("visibility", "hidden");
				})
				.on("drag", function(d) {
					dragging[d] = Math.min(width, Math.max(0, d3.event.x));
					foreground.attr("d", line);
					dimensions.sort(function(a, b) {
						return position(a) - position(b);
					});
					x.domain(dimensions);
					g.attr("transform", function(d) {
						return "translate(" + position(d) + ")";
					})
				})
				.on("end", function(d) {
					delete dragging[d];
					transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
					transition(foreground).attr("d", line);
					background
						.attr("d", line)
						.transition()
						.delay(500)
						.duration(0)
						.attr("visibility", null);
				}));

		g.append("g")
			.each(function(d) {
				
				d3.select(this).call(d3.axisLeft().scale(y[d]));
			})
			.append("text")
			.style("text-anchor", "middle")
			.attr("font-size", "12")
			.attr("y", -9)

			.text(function(d) {
				return d;
			})
			.attr("fill", "black")
			.attr("transform", "rotate(-21)");

		g.append("g")
			.attr("class", "brush")
			.each(function(d) {
				d3.select(this).call(y[d].brush);
			})
			.selectAll("rect")
			.attr("x", -8)
			.attr("width", 16);

		function brushstart() {
			d3.event.sourceEvent.stopPropagation();
		}

		function brushstart() {
			d3.event.sourceEvent.stopPropagation();
		}


		function brush() {
			var actives = [];
			svg.selectAll(".brush")
				.filter(function(d) {
					return d3.brushSelection(this);
				})
				.each(function(d) {
					actives.push({
						dimension: d,
						extent: d3.brushSelection(this)
					});
				});
			//set un-brushed foreground line disappear
			foreground.classed("fade", function(d, i) {

				return !actives.every(function(active) {
					var dim = active.dimension;
					return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
				});
			});
		}


		function position(d) {
			var v = dragging[d];
			return v == null ? x(d) : v;
		}

		function transition(g) {
			return g.transition().duration(500);
		}

		function line(d) {
			if (d['ID_year']==year){
			return d3.line()(dimensions.map(function(key) {
				return [x(key), y[key](d[key])];
		}));}else{
			return;
		}
		}
	});
}

function piechart() {
	/*var svg = d3.select("svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    radius = Math.min(width, height) / 2,
    g = svg.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var color = d3.scaleOrdinal(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

var pie = d3.pie()
    .sort(null)
    .value(function(d) { return d.population; });

var path = d3.arc()
    .outerRadius(radius - 10)
    .innerRadius(radius - 70);

var label = d3.arc()
    .outerRadius(radius - 40)
    .innerRadius(radius - 40);

d3.csv("./static/data/pie.csv", function(d) {
  d.population = +d.population;
  return d;
}, function(error, data) {
  if (error) throw error;

  var arc = g.selectAll(".arc")
    .data(pie(data))
    .enter().append("g")
      .attr("class", "arc");

  arc.append("path")
      .attr("d", path)
      .attr("fill", function(d) { return color(d.data.democratic_performance_name); });

  arc.append("text")
      .attr("transform", function(d) { return "translate(" + label.centroid(d) + ")"; })
      .attr("dy", "0.35em")
      .text(function(d) { return d.data.democratic_performance_name; });
});*/
	/*var data = [10, 20, 100];

	var width = 960,
	    height = 500,
	    radius = Math.min(width, height) / 2;

	var color = d3.scaleOrdinal()
	    .range(["#98abc5", "#8a89a6", "#7b6888"]);

	var arc = d3.arc()
	    .outerRadius(radius - 10)
	    .innerRadius(0);

	var labelArc = d3.arc()
	    .outerRadius(radius - 40)
	    .innerRadius(radius - 40);

	var pie = d3.pie()
	    .sort(null)
	    .value(function(d) { return d; });

	var svg = d3.select("body").append("svg")
	    .attr("width", width)
	    .attr("height", height)
	  .append("g")
	    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

	  var g = svg.selectAll(".arc")
	      .data(pie(data))
	    .enter().append("g")
	      .attr("class", "arc");

	  g.append("path")
	      .attr("d", arc)
	      .style("fill", function(d) { return color(d.data); });

	  g.append("text")
	      .attr("transform", function(d) { return "translate(" + labelArc.centroid(d) + ")"; })
	      .attr("dy", ".35em")
	      .text(function(d) { return d.data; });*/
	var data = [
		{
			name: "Authoritarian Regime",
			value: 60
		},
		{
			name: "High performing democracy",
			value: 20
		},
		{
			name: "Hybrid Regime",
			value: 30
		},
		{
			name: "Mid-range performing democracy",
			value: 15
		},
		{
			name: "Weak democracy",
			value: 10
		},
	];
	var text = "";

	var width = 200;
	var height = 200;
	var thickness = 40;
	var duration = 750;
	var padding = 10;
	var opacity = .8;
	var opacityHover = 1;
	var otherOpacityOnHover = .8;
	var tooltipMargin = 13;

	var radius = Math.min(width - padding, height - padding) / 2;
	var color = d3.scaleOrdinal(d3.schemeCategory10);

	var svg = d3.select("#chart")
		.append('svg')
		.attr('class', 'pie')
		.attr('width', width)
		.attr('height', height);

	var g = svg.append('g')
		.attr('transform', 'translate(' + (width / 2) + ',' + (height / 2) + ')');

	var arc = d3.arc()
		.innerRadius(0)
		.outerRadius(radius);

	var pie = d3.pie()
		.value(function(d) {
			return d.value;
		})
		.sort(null);

	var path = g.selectAll('path')
		.data(pie(data))
		.enter()
		.append("g")
		.append('path')
		.attr('d', arc)
		.attr('fill', (d, i) => color(i))
		.style('opacity', opacity)
		.style('stroke', 'white')
		.on("mouseover", function(d) {
			d3.selectAll('path')
				.style("opacity", otherOpacityOnHover);
			d3.select(this)
				.style("opacity", opacityHover);

			let g = d3.select("svg")
				.style("cursor", "pointer")
				.append("g")
				.attr("class", "tooltip")
				.style("opacity", 0);

			g.append("text")
				.attr("class", "name-text")
				.text(`${d.data.name} (${d.data.value})`)
				.attr('text-anchor', 'middle');

			let text = g.select("text");
			let bbox = text.node().getBBox();
			let padding = 2;
			g.insert("rect", "text")
				.attr("x", bbox.x - padding)
				.attr("y", bbox.y - padding)
				.attr("width", bbox.width + (padding * 2))
				.attr("height", bbox.height + (padding * 2))
				.style("fill", "white")
				.style("opacity", 0.75);
		})
		.on("click", function(d) {
			let text = d3.select('.tooltip text');
			value=text.node().innerHTML
			var slider = document.getElementById("myRange");
			var year = slider.value;
			if(value.includes("High")){
				drawPcpPlot('pie',1,year)	
			}
			if(value.includes("Mid-range")){
				drawPcpPlot('pie',2,year)
			}
			if(value.includes("Weak")){
				drawPcpPlot('pie',3,year)
			}
			if(value.includes("Hybrid")){
			drawPcpPlot('pie',4,year)	
			}
			if(value.includes("Authoritarian")){
			drawPcpPlot('pie',5,year)	
			}
			
			/*let mousePosition = d3.mouse(this);
			let x = mousePosition[0] + width / 2;
			let y = mousePosition[1] + height / 2 - tooltipMargin;

			let text = d3.select('.tooltip text');
			let bbox = text.node().getBBox();
			//console.log(text.node().innerHTML)
			if (x - bbox.width / 2 < 0) {
				x = bbox.width / 2;
			} else if (width - x - bbox.width / 2 < 0) {
				x = width - bbox.width / 2;
			}

			if (y - bbox.height / 2 < 0) {
				y = bbox.height + tooltipMargin * 2;
			} else if (height - y - bbox.height / 2 < 0) {
				y = height - bbox.height / 2;
			}

			d3.select('.tooltip')
				.style("opacity", 1)
				.attr('transform', `translate(${x}, ${y})`);
		*/
		})
		.on("mouseout", function(d) {
			d3.select("svg")
				.style("cursor", "none")
				.select(".tooltip").remove();
			d3.selectAll('path')
				.style("opacity", opacity);
		})
		.on("touchstart", function(d) {
			d3.select("svg")
				.style("cursor", "none");
		})
		.each(function(d, i) {
			this._current = i;
		});

	let legend = d3.select("#chart").append('div')
		.attr('class', 'legend')
		.style('margin-top', '30px');

	let keys = legend.selectAll('.key')
		.data(data)
		.enter().append('div')
		.attr('class', 'key')
		.style('display', 'flex')
		.style('align-items', 'center')
		.style('margin-right', '20px');

	keys.append('div')
		.attr('class', 'symbol')
		.style('height', '10px')
		.style('width', '10px')
		.style('margin', '5px 5px')
		.style('background-color', (d, i) => color(i));

	keys.append('div')
		.attr('class', 'name')
		.text(d => `${d.name} (${d.value})`);

	keys.exit().remove();
}