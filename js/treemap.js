/**
 * Created by yevheniia on 01.05.19.
 */

var ratio;
if(screen.width > 800) {
    ratio = 2;
} else {
    ratio = 0.8
}

var red = "#3D728E";
var green = "#CB93B2";

var treeViewBox = $("#my_dataviz1")[0].getBoundingClientRect();
var treemapMargin = {top: 5, right: 10, bottom: 30, left: 10},
    treemapWidth = treeViewBox.width - treemapMargin.left - treemapMargin.right,
    treemapHeight = treeViewBox.height - treemapMargin.top - treemapMargin.bottom - 100;

var treemapInnerHeight = treemapHeight * 0.90;

// var gElementWidth = document.querySelector('#my_dataviz1 svg').querySelector('g').getBBox();
// console.log(gElementWidth);


var treeColor = d3.scaleOrdinal() // D3 Version 4
    .domain(["~3 млн", "350 т.", "~300 т.", "~70 т.", "безкошт."])
    .range(["#8e677d", "#cb93b2", "#dbb3c9", "#dbb3c9", "#E6EFFF"]);


// append the svg object to the body of the page
var treemap1 = d3.select("#my_dataviz1")
    .append("svg")
    .attr("width", treemapWidth + treemapMargin.left + treemapMargin.right)
    .attr("height", treemapHeight + treemapMargin.top + treemapMargin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + treemapMargin.left + "," + treemapMargin.top + ")");


// Read data
d3.csv('data/top_frankivsk.csv', function(treedata1) {
    // stratify the data: reformatting for d3.js
    var root = d3.stratify()
        .id(function(d) { return d.id; })   // Name of the entity (column name is name in csv)
        .parentId(function(d) { return d.parentId; })   // Name of the parent (column name is parent in csv)
        (treedata1);

    root.sum(function(d) { return +d.size })   // Compute the numeric value for each entity

    // Then d3.treemap computes the position of each element of the hierarchy
    // The coordinates are added to the root object above
    d3.treemap()
        .size([treemapWidth / ratio , treemapInnerHeight])
        .padding(4)
        (root);

    var nodes = treemap1.selectAll("g")
        .data(root.leaves())
        .enter()
        .append("g");



    // use this information to add rectangles:
    nodes
        .append("rect")
        .attr("class", function(d) {
            return d.data.ind + " tree-nodes"
        })
        .attr("x", function(d) { return Math.round(d.x0 * ratio) + "px"; })
        .attr("y", function(d) { return Math.round(d.y0) + "px"; })
        .attr("width", function(d) { return Math.round(d.x1 * ratio) - Math.round(d.x0 * ratio) + 1 + "px"; })
        .attr("height", function(d) { return Math.round(d.y1) - Math.round(d.y0) + "px"; })
        .attr("data-tippy-content", function(d) {  return "<b>Послуга:</b> " + d.data.id +
            '<br> <b>Надано:</b> ' + d.data.size + " послуг" +
                '<br> <b>Вартість: </b>' + d.data.perItem +
                '<br> <b>Сума адміністративного збору: </b>' + d.data.sum + " грн"

        })
        .style("cursor", "pointer")
        .style("fill", function(d) {  return d.data.opacity   }) ;

    tippy('.tree-nodes', {
        theme:'tomato',
        delay: 50,
        arrow: false,
        size: 'big',
        duration: 500,
        distance: -50,
        allowHTML: true
    });

    // and to add the text labels
    if(window.innerWidth >= 800){
        nodes
            .append("text")
            .style("font-size", "12px")
            .attr("class", "treemap-text")
            .attr("x", function(d) { return Math.round(d.x0 * ratio) + 5 + "px"; })
            .attr("y", function(d) { return Math.round(d.y0) + 15 + "px"; })
            .text(function(d){
                return d.data.short + "/ " + d.data.size  })
            .call(wrap, 150)
            .attr("opacity", getOpacity);
    }
    if(window.innerWidth < 800){
        nodes
            .append("text")
            .style("font-size", "12px")
            .attr("class", "treemap-text")
            .attr("x", function(d) { return Math.round(d.x0 * ratio) + 5 + "px"; })
            .attr("y", function(d) { return Math.round(d.y0) + 5 + "px"; })
            .text(function(d){
                return d.data.short + "/ " + d.data.size  })
            .call(wrap, 30)
            .attr("opacity", getOpacity);
     }

    treemap1.append("g")
        .attr("class", "treeLegend")
        .attr("transform", "translate("+ 10 +',' + (treemapInnerHeight + 20) + ")");

    var treeLegend = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .useClass(false)
        .title("")
        .titleWidth(200)
        .orient('horizontal')
        .shapeWidth((treemapWidth-23) / 5)
        .scale(treeColor);

    treemap1.select(".treeLegend")
        .call(treeLegend);
});

function getOpacity() {
    var bbox = this.getBBox();
    var cbbox = this.parentNode.querySelector('rect').getBBox();
    var opacity;

    if(bbox.height > cbbox.height || bbox.width > cbbox.width) {
        opacity = 0;
    } else {
        opacity = 1;
    }
    return opacity;

}



    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse();
                var word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.5, // ems
                x = text.attr("x"),
                y = text.attr("y"),
                dy = 0, //parseFloat(text.attr("dy")),
                tspan = text.text(null)
                    .append("tspan")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("dy", dy + "em");
            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() >= width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan")
                        .attr("x", x)
                        .attr("y", y)
                        .attr("dy", ++lineNumber * lineHeight + dy + "em")
                        .text(word);
                }
            }
        });
    }
