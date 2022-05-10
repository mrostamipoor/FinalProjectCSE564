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

var colorsg = new Map();
colorsg.set(1, '#037488');
colorsg.set(2, '#89bbbd');
colorsg.set(3, '#fdfbee');
colorsg.set(4, '#f5c0a2');
colorsg.set(5, '#d94620');
var performance = new Map();
performance.set('High performing democracy',1);
performance.set('Mid-range performing democracy',2);
performance.set('Weak democracy',3);
performance.set('Hybrid Regime',4);
performance.set('Authoritarian Regime',5);
/////////////////////////////////////////////////////////////////////////////////////////////////////////////


function drawPcpPlot(coutryname, demo_status,year,countries) {
	document.getElementById("pcp").innerHTML = ""

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
			if (key == 'ID_year' || key == 'absence_of_corruption'|| key ==  'inclusive_suffrage'|| key ==  'electoral_participation'|| key ==  'social_group_equality'|| key ==  'predictable_enforcement'|| key ==  'elected_government'|| key ==  'basic_welfare'|| key ==  'access_to_justice'|| key ==  'personal_integrity_and_security2'|| key ==  'free_political_parties') {
				
					y[key] = d3.scaleLinear()
					.domain(d3.extent(data, function(d) {
						    return +d[key];
					}))
					.range([height, 0]);
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
			.style("stroke-width", function(d) {
				if (demo_status==6){
				if (coutryname == 'default') {
					return "1.5px";
				} else {
					if (countries.includes(d.country)) {
						return "5px";
					} else {
						return '0.5px';
					}
				}
			}
			
			else {
				if (d.democratic_performance_numeric == demo_status) {
					return "4.5px";
				} else {
					return '0.5px'
				}
			}
			})
			.style("stroke-opacity", function(d) {
				if (demo_status==6){
				if (coutryname == 'default') {
					return "0.9";
				} else {
					if (countries.includes(d.country)) {
						return "0.9";
					} else {
						return '0.3';
					}
				}
			}
			
			else {
				if (d.democratic_performance_numeric == demo_status) {
					return "0.9";
				} else {
					return '0.3'
				}
			}
			})
			.style("stroke", function(d) {
			if (demo_status==6){
				if (coutryname == 'default') {
					return colorsg.get(+d.democratic_performance_numeric);
				} else {
					if (countries.includes(d.country)) {
						return colorsg.get(+d.democratic_performance_numeric);
					} else {
						return '#ffeeec';
					}
				}
			}
			
			else {
				if (d.democratic_performance_numeric == demo_status) {
					return colorsg.get(+d.democratic_performance_numeric);
				} else {
					return '#ffeeec'
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
				if (d==='ID_year'){
					d3.select(this).call(d3.axisLeft().scale(y[d]).tickFormat(d3.format("d")));
				
				}else{
					d3.select(this).call(d3.axisLeft().scale(y[d]));
				}
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
			return d3.line()
			(dimensions.map(function(key) {
				return [x(key), y[key](d[key])];
		}));}
		else{
			return;
		}
		}
	});
}
