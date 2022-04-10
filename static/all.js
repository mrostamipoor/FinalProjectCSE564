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
async function createMDSC() {
    const url = baseUrl + "correlationMDS"
    let response = await fetch(url)
    eigen = await response.json()
	eigenlist=eigen[0]
		dataobjC=[];
    for (i=0; i<eigenlist.length; i++) {
		var obj = new Object();
        obj.x = eigenlist[i][0];
        obj.y = eigenlist[i][1];
		obj.z = eigen[1][i];
		obj.t = eigen[2][i];
		dataobjC.push(obj);
	}
	return drawBiplot(dataobjC,2)
}
async function getPCPData(){
    const url = baseUrl + "fetchPCPData"
    let response = await fetch(url)
    pcpData = await response.json()

    return drawPcpPlot("labaled_data.csv",18,0)
}


async function getSortedPath(){
	path="";
	for(i=0;i<paths.length;i++){
		tmp=getKey(paths[i]).toString();
		if (i==0){
		path=tmp;
		}else{
		path=path+"."+tmp;
		}
	}
	var count=paths.length;
	paths=[];
    const url = baseUrl + "fetchSortedPath?indexes="+path
    let response = await fetch(url)
    pcpData = await response.json()

    return drawPcpPlot("sorted_data.csv",count,1)
}
function getKey(value) {
  return [...atrributes].find(([key, val]) => val == value)[0]
}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////

function drawBiplot(data,index){
	document.getElementById("output").innerHTML = ""
	document.getElementById("div2").innerHTML = ""
	document.getElementById("div0").innerHTML = ""
	colors = ["red","indigo","green"]
		//console.log(data);
		d3.selectAll('svg').remove();
		d3.selectAll('p').remove();
		padding = 90;
      var margin = { top: 50, right: 70, bottom: 130, left:100 },
      width = 800 - margin.left - margin.right,
      height = 560 - margin.top - margin.bottom; 
		
		var svg = d3.select("body")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
			"translate(" + margin.left + "," + margin.top + ")");
      
	  
	  var minX = d3.min(data, function(d) { return d.x; });
      var maxX = d3.max(data, function(d) { return d.x; });
	  
      var minY = d3.min(data, function(d) { return d.y; });
      var maxY = d3.max(data, function(d) { return d.y; });
         var g = svg.append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    var x = d3.scaleLinear()
    .domain([minX, maxX]).nice()
    .range([ 0, width ])

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
		.attr("class", "axis");
  
    var y = d3.scaleLinear()
        .domain([minY, maxY]).nice()
        .range([ height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
		.attr("class", "axis");

      svg.append("text")
      .attr("class", "labeltext")
      .attr("text-anchor", "middle") 
      .attr("transform", "translate(" + (-40) + "," + (height / 2) + ")rotate(-90)") 
      .text("MDS2");
      
      svg.append("text")
      .attr("class", "labeltext")
      .attr("text-anchor", "middle") 
      .attr("transform", "translate(" + (360) + "," + (420) + ")")
      .text("MDS1");
      if (index==1){
		svg.append("text")
      .attr("class", "astyle")
      .attr("transform", "translate(100,0)")
      .attr("x", 200)
      .attr("y", -30)
      .text("Data MDS plot-Euclidian Distance ")
	  }else{
		svg.append("text")
      .attr("class", "astyle")
      .attr("transform", "translate(100,0)")
      .attr("x", 200)
      .attr("y", -30)
      .text("Variables MDS plot-Correlation Distance")
	  }


    if (index==1){
		svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
		.transition()
      .ease(d3.easeLinear)
      .duration(200)
      .delay(function(d, i) { return i * 4; })
        .attr("cx", d => { return x(d.x); } )
        .attr("cy", d => { return y(d.y); } )
        .attr("r", 3)
        .style("fill", function(d) { return colors[d.z]; })
	}
	else{
		var dots= svg.append('g')
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
		.transition()
      .ease(d3.easeLinear)
      .duration(200)
      .delay(function(d, i) { return i * 4; })
        .attr("cx", d => { return x(d.x); } )
        .attr("cy", d => { return y(d.y); } )
        .attr("r", 10)
        .style("fill", "#EE6C4D")
		
		  g.selectAll("text")
		.data(data)
		.enter().append("text")
		.attr("fill", "#3D5A80")
		.attr("x", function(d) { return x(d.x)-95; })
		.attr("y", function(d) { return y(d.y)-65; })
		.text(function(d) { 
		var tmp=d.t;
		if (d.t=='cast_total_facebook_likes'){
			tmp='cast_flikes';
		}
		if (d.t=='actor_2_facebook_likes'){
			tmp='actor2_flikes';
		}
		if (d.t=='actor_3_facebook_likes'){
			tmp='actor3_flikes';
		}
		if (d.t=='actor_1_facebook_likes'){
			tmp='actor1_flikes';
		}
		
		
		return tmp;})


		
		
	}

    
    
    
}

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
		return colors[d.democratic_performance_numeric-1];}
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




var attName = new Map();
        attName.set('num_critic_for_reviews', '#critic');
        attName.set('duration', 'dur');
        attName.set('director_facebook_likes', 'Dlike');
        attName.set('actor_3_facebook_likes', '3like');
        attName.set('actor_1_facebook_likes','1like');
        attName.set('gross', 'gros');
        attName.set('num_voted_users', '#vote');
        attName.set('cast_total_facebook_likes', 'Clike');
        attName.set('facenumber_in_poster', '#face');
        attName.set('num_user_for_reviews', '#user');
        attName.set('budget', 'budg');
		attName.set('actor_2_facebook_likes', '2like');
		attName.set('imdb_score', 'imdb');
		attName.set('movie_facebook_likes', 'Mlike');
function createCorrelationPlot(){
	document.getElementById("div3").innerHTML = ""
		d3.selectAll('svg').remove();
    d3.selectAll('p').remove();
    d3.csv("static/data/data.csv", function(error, rows) {
      var data = [];

      rows.forEach(function(d) {
        var x = d[""];
        delete d[""];
        for (prop in d) {
          var y = prop,
            value = d[prop];
          data.push({
            x: x,
            y: y,
            value: +value
          });
        }
      });
      
      var margin = {
          top: 45,
          right: 80,
          bottom: 45,
          left: 45
        },
        width = 700 - margin.left - margin.right,
        height = 650 - margin.top - margin.bottom,
        domain = d3.set(data.map(function(d) {
          return d.x
        })).values(),
        num = Math.sqrt(data.length),
             color = d3.scaleLinear()
                .domain([-1, 0, 1])
                .range(["yellow", "blue", "red"]);//change it

             var x = d3.scalePoint()
            .range([0, width])
            .domain(domain),

            y = d3.scalePoint()
                .range([0, height])
                .domain(domain),
            xSpace = x.range()[1] - x.range()[0],
            ySpace = y.range()[1] - y.range()[0];
      ySpace = y.range()[1] - y.range()[0];

      var svg = d3.select("#div3")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var cor = svg.selectAll(".cor")
        .data(data)
        .enter()
        .append("g")
        //.attr("class", "cor")
        .attr("transform", function(d) {
          return "translate(" + x(d.x) + "," + y(d.y) + ")";
        });

      cor.append("rect")
        .attr("width", xSpace/10)
        .attr("height", ySpace/10)
        .attr("x", -xSpace / 20)
        .attr("y", -ySpace / 20)

      cor.filter(function(d){
          var ypos = domain.indexOf(d.y);
          var xpos = domain.indexOf(d.x);
          for (var i = (ypos + 1); i < num; i++){
            if (i === xpos) return false;
          }
          return true;
        })
        .append("text")
        .attr("y", 5)
        .text(function(d) {
          if (d.x === d.y) {
			  ////console.log(attName.get(d.x))
            return attName.get(d.x);
          } else {
			
            return d.value.toFixed(2);
          }
        })
		 //.on("click", function(d){
               //getSortedPath();
			  // if(!paths.includes(d.x))
			//	{
					//paths.push(d.x);
			//	}
			   ////console.log(d.x);
			   ////console.log(paths);
			   //d.x
             //})
        .style("fill", function(d){
          if (d.value === 1) {
            return "#000";
          } else {
            return color(d.value);
          }
        });

        cor.filter(function(d){
          var ypos = domain.indexOf(d.y);
          var xpos = domain.indexOf(d.x);
          for (var i = (ypos + 1); i < num; i++){
            if (i === xpos) return true;
          }
          return false;
        })
        .append("circle")
        .attr("r", function(d){
          return (width / (num * 2)) * (Math.abs(d.value) + 0.1);
        })
        .style("fill", function(d){
          if (d.value === 1) {
            return "#000";
          } else {
            return color(d.value);
          }
        });
        
     var aS = d3.scaleLinear()
            .range([-margin.top + 5, height + margin.bottom - 5])
            .domain([1, -1]);
            
   var yA = d3.axisRight()
            .scale(aS)
            .tickPadding(7);

    var aG = svg.append("g")
      //.attr("class", "y axis")
      .call(yA)
      .attr("transform", "translate(" + (width + margin.right / 2) + " ,0)")

    var iR = d3.range(-1, 1.01, 0.01);
    var h = height / iR.length + 3;
    iR.forEach(function(d){
        aG.append('rect')
          .style('fill',color(d))
          .style('stroke-width', 0)
          .style('stoke', 'none')
          .attr('height', h)
          .attr('width', 10)
          .attr('x', 0)
          .attr('y', aS(d))
      });
    });
    
	
}

