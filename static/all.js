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
colorsg.set(1, '#1f77b4');
colorsg.set(2, '#2ca02c');
colorsg.set(3, '#9467bd');
// colorsg.set(4, '#d62728');
colorsg.set(5, '#d62728');
colorsg.set(4, '#ff7f0e');Z
// colorsg.set(5, '#ff7f0e');Z
var performance = new Map();
performance.set('High performing democracy',1);
performance.set('Mid-range performing democracy',2);
performance.set('Weak democracy',3);
performance.set('Hybrid Regime',4);
performance.set('Authoritarian Regime',5);
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
			.style("stroke", function(d) {
			if (demo_status==6){
				if (d.country == coutryname) {
					//return '#8c564b ';
					return '#fa26a0';
				} else {
					if (coutryname == 'test') {
						return colorsg.get(+d.democratic_performance_numeric);
					} else {
						return '#dadada';
					}
				}
			}
			
			else {
				if (d.democratic_performance_numeric == demo_status) {
					return colorsg.get(+d.democratic_performance_numeric);
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

	var data = [
		{
			name: "High performing democracy",
			value: 60
		},
		{
			name: "Mid-range performing democracy",
			value: 20
		},
		{
			name: "Weak democracy",
			value: 30
		},
		{
			name: "Hybrid Regime",
			value: 15
		},
		{
			name: "Authoritarian Regime",
			value: 10
		},
	];
	var csv_data=[];
	var setdata=[];
/*d3.csv("./static/data/afile.csv", function(error, data) {
            if (error) {
                throw error;
            }
            for (var i = 0; i < data.length; i++) {
                var key = data[i]['name'] + '-' + data[i]['value'];
				
				if (!csv_data.includes(key)){
					csv_data.push(key);
					 console.log(key);
					 var map = new Map();
					 map.set('name', data[i]['name']);
					 map.set('value', data[i]['value']);
					 console.log(map);
					 setdata.push(map);
				}
	}
	});
	console.log(setdata)
	console.log(data)*/
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
		.attr('fill', function(d, i)  { 
		var tmp=Object.values(Object.values(d)[0])[0];
		var indx=performance.get(tmp);
		return colorsg.get(indx)})
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
		.style('background-color', function(d, i) { 
		console.log(Object.values(d)[0]);
		var tmp=Object.values(d)[0];
		var indx=performance.get(tmp);
		return colorsg.get(indx)});

	keys.append('div')
		.attr('class', 'name')
		.text(d => `${d.name} (${d.value})`);

	keys.exit().remove();
}