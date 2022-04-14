var eigenlist;
var baseUrl = "http://localhost:5000/";
var eigen_values = [];
var eigenc_values = [];
var cumulative_values = [];
var important_columns = [];
var scatter_data;
var dataobjE=[];
var dataobjC=[];
var dataobjP=[];
var vectors=[];
var columns=[];
var paths=[];
var atrributes = new Map();
	atrributes.set(0,'num_critic_for_reviews');
	atrributes.set(1,'duration');
	atrributes.set(2,'director_facebook_likes');
	atrributes.set(3,'actor_3_facebook_likes');
	atrributes.set(4,'actor_1_facebook_likes');
	atrributes.set(5,'gross');
	atrributes.set(6,'num_voted_users');
	atrributes.set(7,'cast_total_facebook_likes');
	atrributes.set(8,'facenumber_in_poster');
	atrributes.set(9,'num_user_for_reviews');
	atrributes.set(10,'budget');
	atrributes.set(11,'actor_2_facebook_likes');
	atrributes.set(12,'imdb_score');
	atrributes.set(13,'movie_facebook_likes');
//////////////////////////////////////////////////
async function createMDSE() {
    const url = baseUrl + "euclideanMDS"
    let response = await fetch(url)
    eigen = await response.json()
	eigenlist=eigen[0]
    for (i=0; i<eigenlist.length; i++) {
		var obj = new Object();
        obj.x = eigenlist[i][0];
        obj.y = eigenlist[i][1];
		obj.z = eigen[1][i];
		dataobjE.push(obj);
	}
}

async function getPCPData(){
    const url = baseUrl + "fetchPCPData"
    let response = await fetch(url)
    pcpData = await response.json()

    return drawPcpPlot("labaled_data.csv",18,0)
}



/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawPcpPlot(fileName,count,indx,coutryname){
document.getElementById("pcp").innerHTML = ""

	//colors = ['#a6cee3','#cab2d6', '#b2df8a', '#b15928', '#a6cee3', '#b2df8a', '#fb9a99', '#fdbf6f', '#cab2d6', '#ffff99'];
	colors = ['#74add4','#b2df8a', '#f4a2a4','#fb9a99', '#fdbf6f', '#cab2d6']
//['#cab2d6
//b2df8a
//fdbf6f
//e31a1c



	//"#5DA5B3","#DB7F85"]

    if(count>12)
	{
	svgWidth = 1350,
    svgHeight = 550,
    margin = { top: 80, right: 50, bottom: 30, left: 100 },
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;
	}
	else{
	if(count>8){
	svgWidth = 900,
    svgHeight = 550,
    margin = { top: 80, right: 50, bottom: 30, left: 100 },
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;
    
	
	}else{
	svgWidth = 650,
    svgHeight = 550,
    margin = { top: 80, right: 50, bottom: 30, left: 100 },
    width = svgWidth - margin.left - margin.right,
    height = svgHeight - margin.top - margin.bottom;
	}
	}

    var x, y = {}, dimensions, dragging = {}, background, foreground;

		var svg = d3.select("#pcp").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
		.append("g")	
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	
     
d3.csv("static/data/newDemo.csv", function(error, data) {    
    dimensions = d3.keys(data[0]).filter(function (key) {
        if (key =='ID_year'||key =='direct_democracy'||key =='electoral_participation'||key =='basic_welfare'||key =='inclusive_suffrage'||key =='social_group_equality'||key =='elected_government'||key =='absence_of_corruption'||key =='access_to_justice'||key =='freedom_of_religion'||key =='civil_society_participation') {
			console.log(key);
		   y[key] = d3.scaleLinear()
                .domain(d3.extent(data, function (d) { return +d[key]; }))
                .range([height, 0]);
			y[key].brush = d3.brushY()
                .extent([[-5, y[key].range()[1]], [5, y[key].range()[0]]])
                .on("brush", brush)
				.on("start", brushstart);
            return key;
        }
		else{
			if ( key =='countrys'){
			 y[key] = d3.scalePoint()
			.domain(data.map(function (d) {
				return d[key]; }))
                .range([height, 0]);
			y[key].brush = d3.brushY()
                .extent([[-5, y[key].range()[1]], [5, y[key].range()[0]]])
                .on("brush", brush)
				.on("start", brushstart);
			return key;
			}
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
		if(d.country==coutryname){
			return 'red';
		}
		else{
		if(coutryname=='test')
		{
		  return colors[d.democratic_performance_numeric-1];
		}
		else{
			return '#dadada';
		}
		}
		});
    
    var g = svg.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "PCPaxis")
        .attr("transform", function (d) { return "translate(" + x(d) + ")"; })
        .call(d3.drag()
            .on("start", function (d) {
                dragging[d] = x(d);
                background.attr("visibility", "hidden");
            })
            .on("drag", function (d) {
                dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                foreground.attr("d", line);
                dimensions.sort(function (a, b) { return position(a) - position(b); });
                x.domain(dimensions);
                g.attr("transform", function (d) { return "translate(" + position(d) + ")"; })
            })
            .on("end", function (d) {
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
        .each(function (d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "middle")
        .attr("font-size", "12")
        .attr("y", -9)
		
        .text(function (d) { return d; })
        .attr("fill", "black")
		.attr("transform", "rotate(-21)");
  
        g.append("g")
            .attr("class", "brush")
            .each(function(d) { d3.select(this).call(y[d].brush); })
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
        foreground.classed("fade", function(d,i) {

            return !actives.every(function(active) {
                var dim = active.dimension;
                return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim])  <= active.extent[1];
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
        return d3.line()(dimensions.map(function (key) { return [x(key), y[key](d[key])]; }));
    }
});	
}




