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
var colorsg = new Map();
colorsg.set(5, '#037488');
colorsg.set(4, '#89bbbd');
colorsg.set(3, '#fdfbee');
colorsg.set(2, '#f5c0a2');
colorsg.set(1, '#d94620');
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
		// svgHeight = 550,
		svgHeight = 500,
		margin = {
			// top: 80,
			top: 55,
			right: 50,
			// bottom: 30,
			bottom: 10,
			// left: 100
			left: 50
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
	  
function CreateBarChartInverse(column,year,country) {
    //d3.selectAll('barchart').remove();
	document.getElementById("barchart").innerHTML = ""
    var barHeight = 20;
	padding = 90;
    var margin = { top: 50, right: 50, bottom: 50, left: 80 },
        height = 300 - margin.top - margin.bottom,
        width = 450 - margin.left - margin.right;

    var svg = d3.select("#barchart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    /*svg.append("text")
		.attr("class", "astyle")
        .attr("transform", "translate(100,0)")
        .attr("x", 200)
        .attr("y", -10)
        .text("Bar Chart for IMDB Movie Data")*/

    var g = svg.append("g")
        .attr("transform", function (d, i) {
            return "translate(0," + i * barHeight + ")";
        });
 Sortedvalue = [];
    d3.csv("./static/data/newDemo.csv", function (error, data) {
        if (error) {
            throw error;
        }


       
        for (let index = 0; index < data.length; index++) {
			if (data[index]['ID_year']==year){
				const newObj = new Object();
				newObj.country=data[index]['country']
				newObj.values=parseFloat(data[index][column])
				newObj.perf=parseFloat(data[index]['democratic_performance_numeric'])
				Sortedvalue.push(newObj)
			}
        }
		mydata=[];
		Sortedvalue.sort((a, b) => b.values - a.values);
		for (let index = 0; index < 7; index++) {
			 mydata.push(Sortedvalue[index])
		}
		var yScale = d3.scaleBand().range([height, 0]).padding(0.05);
        var xScale = d3.scaleLinear().range([0, width]);

        yScale.domain(mydata.map(function (d) {
            return d.country;
        }));
        xScale.domain([0, d3.max(mydata, function (d) {

            return d.values;
        })]);


        g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .attr("class", "axis")
            .call(d3.axisBottom(xScale))
            .append("text")
            .attr("x", 30)
            .attr("dx", "-3em")
            .attr("y", 40)
            .attr("dx", "68em")
            .attr("stroke", "black")
            .attr("font-size", "16px")
            .attr("text-anchor", "end");

 
		g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yScale))
            .append("text")
			.attr("transform", "rotate(-90)");
		
		svg.append("text")
			.attr("class", "labeltext")
			.attr("text-anchor", "middle") 
			.attr("transform", "translate(" + (-70) + "," + (height / 2) + ")rotate(-90)") 	
			.text('Country Name');

		svg.append("text")
			.attr("class", "labeltext")
			.attr("text-anchor", "middle") 
			.attr("transform", "translate(" + (250) + "," + (340) + ")") 
			.text(column);
	
        if (country==='1'){
			g.selectAll(".bar")
            .data(mydata)
            .enter().append("rect")
            .attr("fill", function(d) {
				return colorsg.get(+d.perf);
			})
            .attr("x", 1)
			//.attr("stroke", "red")
            .attr("y", function (d) {
                return yScale(d.country);
            })

            .attr("width", function (d) { return xScale(d.values); })
            .attr("height", yScale.bandwidth())
			.on("click", function (d, i) {
				var slider = document.getElementById("myRange");
				var year=slider.value;
				var attr = document.getElementById("selectAttr").value;
				//console.log(attr);
				//CreateBarChartInverse(attr,year,d.country);
				var tmp=[];
				tmp.push(d.country);
				drawPcpPlot(d.country,6,year,tmp)
				CreateBarChartInverse(attr,year,d.country);
				drawLinechart(tmp, attr);
			});
		}
		//#DCDCDC
		else{
			g.selectAll(".bar")
            .data(mydata)
            .enter().append("rect")
            .attr("fill", function(d) {
				if (d.country===country)
				return colorsg.get(+d.perf);
				else {
					return '#DCDCDC'
				}
			})
            .attr("x", 1)
			//.attr("stroke", "red")
            .attr("y", function (d) {
                return yScale(d.country);
            })

            .attr("width", function (d) { return xScale(d.values); })
            .attr("height", yScale.bandwidth())
			.on("click", function (d, i) {
				var slider = document.getElementById("myRange");
				var year=slider.value;
				var attr = document.getElementById("selectAttr").value;
				CreateBarChartInverse(attr,year,d.country);
				//console.log(mapdata[year-1975][d.country][0])
				var tmp=[];
				tmp.push(d.country);
				drawPcpPlot(d.country,6,year,tmp)
				drawLinechart(tmp, attr);
			});
		}

            
	});

}