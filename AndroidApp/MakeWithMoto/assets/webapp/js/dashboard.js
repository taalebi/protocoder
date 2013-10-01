/*
* Dashboard 
*
*/


var widgets = new Array();

var addWidget = function(widget) { 
  if (widget.type == "plot") { 
    widgets.push(widget.name);
    return addPlot(widget.name, widget.x, widget.y, widget.w, widget.h);
  } else if (widget.type == "button") {
    widgets.push(widget.name);
    return addButton(widget.id, widget.name, widget.x, widget.y, widget.w, widget.h);
  } else if (widget.type == "label") { 
    widgets.push("label_"+widget.id);
    return addLabel(widget.id, widget.name, widget.x, widget.y, widget.size, widget.color);
  } else if (widget.type == "image") { 
    widgets.push("image_"+widget.id);
    return addImage(widget.id, widget.url, widget.x, widget.y, widget.w, widget.h);
  } else if (widget.type == "html") { 
    widgets.push("html"+widget.id);
    return addHTML(widget.id, widget.html, widget.x, widget.y); 
  } 

}


var removeWidgets = function() { 
  $.each(widgets, function(k,v) {
    $("#overlay #container " + "#"+v).remove();
    widgets.pop(v); 
  });

  //remove everything
  $("#overlay #container").empty();
}

var addHTML = function(element, html, posx, posy) { 
   $('<div class ="widget chtml" id = "html_' + element +'">'+ html +' </div>')
          .appendTo("#overlay #container")
          .css({"top":posy+"px","left":posx+"px"});

          //.css({"width": w+"px", "height":h+"px","top":posy+"px","left":posx+"px"})
          //.draggable();
}


var addLabel = function(element, name, posx, posy, size, color) { 
   $('<div class ="widget label" id = "label_' + element +'">'+ name +' </div>')
          .appendTo("#overlay #container")
          .css({"font-size": size+"px", "color":color, "top":posy+"px","left":posx+"px"})
          .draggable();
}


var setText = function(element, text) { 
   $("#overlay #container #label_"+ element).text(text)
}


var addImage = function(element, url, posx, posy, w, h) { 
  if (url.indexOf("http") == -1) { 
    url = window.location.origin + "/apps/" + currentProject.type + "/" + currentProject.name + "/" + url;
  } 

   $('<img src = "'+url+'" class ="widget image" id = "image_' + element +'"/>')
          .appendTo("#overlay #container")
          .css({"width": w+"px", "height":h+"px","top":posy+"px","left":posx+"px"})
          .draggable();
}



var addButton = function(element, name, posx, posy, w, h) {
  $('<button class ="widget" id = "button_' + element +'">'+ name +' </button>')
          .appendTo("#overlay #container")
          .css({"width": w+"px", "height":h+"px","top":posy+"px","left":posx+"px"})
          .click(function() {

            ws.send('{type:button, id:'+ element +'}');
          });

} 

var setBackgroundColor = function(r, g, b, a) { 
  $("#overlay #container").css("background", "rgba("+r+","+g+","+b+","+a+")");
}

var addPlot = function(element, posx, posy, w, h) {
  var _delay = 10;
  var _n = 40;
  var minVal; 
  var maxVal;
  var newPlot = true;

  var n = _n || 40,
      delay = _delay || 500,
      data = d3.range(n).map(function() { return 0; });
 
  var margin = {top: 10, right: 10, bottom: 20, left: 10},
      width = (w || 350) - margin.left - margin.right,
      height = (h || 250) - margin.top - margin.bottom;
 
      // Set the scale from 0 to n-1
  var x = d3.scale.linear()
      .domain([0, n - 1])
      .range([0, width]);
 
      // Set the y scale so we go from the top to the bottom
  var y = d3.scale.linear()
      .domain([-1, 1])
      .range([height, 0]);
 
      // Setup the line to stay within the scales
      // we specified
  var line = d3.svg.area()
	  //.interpolate("step-before")
	  .interpolate("cardinal")
	  //.interpolate("monotone")
	      .y0(height)

      .x(function(d, i) { return x(i); })
      .y(function(d, i) { return y(d); });
 

      $("#overlay #container").append('<div class ="plot_container widget" id = "' + element +'"><h1> '+ element +' </h1><div id = "plot"> </div></div>');
      $("#"+element).draggable();

      // Setup the svg element
  var svg = d3.select("#"+element).append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      // And move it over to sit within the bounds we specified above
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
 
      // Use a clipPath so we don't run off the end on 
      // either side
 	svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", width)
      .attr("height", height);
 
      // Setup the x axis so that it's on the bottom of the chart
	svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")");
  //    .call(d3.svg.axis().scale(x).orient("bottom"));
 
      // Set up the y axis so it's on the left side
  svg.append("g")
      .attr("class", "y axis");
     // .call(d3.svg.axis().scale(y).orient("left"));
 
      // Finally, setup the path
  var path = svg.append("g")
  	.attr("clip-path", "url(#clip)")
    .append("path")
    .data([data])
    .attr("class", "line")
    .attr("d", line);

  //move the plot 
  //$("#plot_container h1").text(plot_name);

  console.log("#plot_container#" + element + " " + posx + " " + posy);
  $(".plot_container#" + element).css({left:posx, top:posy}); 

   
  return function(val, cb) {
 
    // push a new data point onto the back
    if (val) {

      if (newPlot) {
        minVal = val; maxVal = val;
        newPlot = false;
      }

      data.push(val);
      if (val < minVal) minVal = val;
      else maxVal = val;
  
      x.domain([0, n - 1]);
      // x.domain(d3.extent(data, function(d) { return x(d); }));
      y.domain([d3.min(data, function(d) { return d; }), d3.max(data, function(d) { return d; })]);
      //y.domain([minVal, maxVal]);

      // redraw the line, and slide it to the left
      path
          .attr("d", line)
          .attr("transform", null)
        .transition()
          .duration(delay)
          .ease("linear")
          .attr("transform", "translate(" + x(-1) + ")")
          .attr('end', cb);
 
      // pop the old data point off the front
      data.shift();
    }
  } 


}



