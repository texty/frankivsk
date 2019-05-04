/**
 * Created by yevheniia on 01.05.19.
 */

var ratio = 3;

var red = "#3D728E";
var green = "#CB93B2";

var treeViewBox = $("#my_dataviz1")[0].getBoundingClientRect();

var treemapMargin = {top: 10, right: 10, bottom: 10, left: 10},
    treemapWidth = treeViewBox.width - treemapMargin.left - treemapMargin.right,
    treemapHeight = treeViewBox.height - treemapMargin.top - treemapMargin.bottom - 100;


var treeColor = d3.scaleOrdinal() // D3 Version 4
    .domain(["платна", "безкоштовна"])
    .range([green, "#E6EFFF"]);


// append the svg object to the body of the page
var treemap1 = d3.select("#my_dataviz1")
    .append("svg")
    .attr("width", treemapWidth + treemapMargin.left + treemapMargin.right)
    .attr("height", treemapHeight + treemapMargin.top + treemapMargin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + treemapMargin.left + "," + treemapMargin.top + ")");

var treemap2 = d3.select("#my_dataviz2")
    .append("svg")
    .attr("width", treemapWidth + treemapMargin.left + treemapMargin.right)
    .attr("height", treemapHeight + treemapMargin.top + treemapMargin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + treemapMargin.left + "," + treemapMargin.top + ")");


// Read data
d3.csv('data/top_frankivsk_amount.csv', function(treedata1) {

    // stratify the data: reformatting for d3.js
    var root = d3.stratify()
        .id(function(d) { return d.id; })   // Name of the entity (column name is name in csv)
        .parentId(function(d) { return d.parentId; })   // Name of the parent (column name is parent in csv)
        (treedata1);

    root.sum(function(d) { return +d.size })   // Compute the numeric value for each entity

    // Then d3.treemap computes the position of each element of the hierarchy
    // The coordinates are added to the root object above
    d3.treemap()
        .size([treemapWidth / ratio , treemapHeight])
        .padding(4)
        (root);


    // use this information to add rectangles:
    treemap1
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("class", function(d) {
            return d.data.ind + " tree-nodes"
        })
        .attr("x", function(d) { return Math.round(d.x0 * ratio) + "px"; })
        .attr("y", function(d) { return Math.round(d.y0) + "px"; })
        .attr("width", function(d) { return Math.round(d.x1 * ratio) - Math.round(d.x0 * ratio) + 8 + "px"; })
        .attr("height", function(d) { return Math.round(d.y1) - Math.round(d.y0) + "px"; })
        .attr("data-tippy-content", function(d) {  return d.data.id  })
        .style("cursor", "pointer")
        .style("fill", function(d) {  return treeColor(d.data.price)   })
        .on("mouseover", function(d){
            d3.select("#perItem").html("Вартість послуги: " + d.data.perItem);
            var theClass= d3.select(this).attr("class").split(" ")[0];
            console.log(theClass);
            d3.selectAll("."+ theClass).style("opacity", 1)
        })
        .on("mouseout", function(d){
            var theClass= d3.select(this).attr("class").split(" ")[0];
            console.log(theClass);
            d3.selectAll("."+ theClass).style("opacity", 0.8)
        });
    ;

    tippy('.tree-nodes', {
        delay: 50,
        arrow: false,
        size: 'big',
        duration: 500,
        distance: -50,
        allowHTML: true
    });

    // and to add the text labels
    treemap1
        .selectAll("treemap-text")
        .data(root.leaves())
        .enter()
        .append("text")

        .attr("x", function(d) { return Math.round(d.x0 * ratio) + 5 + "px"; })
        .attr("y", function(d) { return Math.round(d.y0) + 5 + "px"; })
        .html(function(d){ return d.data.size  + " шт."})
        .call(wrap, 20)
        .attr("font-size", "13px")
        .attr("fill", "rgb(72, 77, 96)")
        .style("font-weight", "bold")
})


d3.csv('data/top_frankivsk_price.csv', function(treedata2) {

    // stratify the data: reformatting for d3.js
    var root = d3.stratify()
        .id(function(d) { return d.id; })   // Name of the entity (column name is name in csv)
        .parentId(function(d) { return d.parentId; })   // Name of the parent (column name is parent in csv)
        (treedata2);

    root.sum(function(d) { return +d.size })   // Compute the numeric value for each entity

    // Then d3.treemap computes the position of each element of the hierarchy
    // The coordinates are added to the root object above
    d3.treemap()
        .size([treemapWidth / ratio , treemapHeight])
        .padding(4)
        (root);


    // use this information to add rectangles:
    treemap2
        .selectAll("rect")
        .data(root.leaves())
        .enter()
        .append("rect")
        .attr("class", function(d) {
            return d.data.ind + " tree-nodes2"
        })
        .attr("x", function(d) { return Math.round(d.x0 * ratio) + "px"; })
        .attr("y", function(d) { return Math.round(d.y0) + "px"; })
        .attr("width", function(d) { return Math.round(d.x1 * ratio) - Math.round(d.x0 * ratio) + 8 + "px"; })
        .attr("height", function(d) { return Math.round(d.y1) - Math.round(d.y0) + "px"; })
        .attr("data-tippy-content", function(d) {  return d.data.id  })
        .style("cursor", "pointer")
        .style("fill", green )
        .on("mouseover", function(d){
            d3.select("#perItem").html("Вартість послуги: " + d.data.perItem)
            var theClass= d3.select(this).attr("class").split(" ")[0];
            console.log(theClass);
            d3.selectAll("."+ theClass).style("opacity", 1)
        })
        .on("mouseout", function(d){
            var theClass= d3.select(this).attr("class").split(" ")[0];
            console.log(theClass);
            d3.selectAll("."+ theClass).style("opacity", 0.8)
        });

    tippy('.tree-nodes2', {
        delay: 50,
        arrow: false,
        size: 'big',
        duration: 500,
        distance: -50,
        allowHTML: true
    });

    // and to add the text labels
    treemap2
        .selectAll("treemap-text")
        .data(root.leaves())
        .enter()
        .append("text")
        .attr("class", "treemap-text")
        .attr("x", function(d) { return Math.round(d.x0 * ratio) + 5 + "px"; })
        .attr("y", function(d) { return Math.round(d.y0) + 5 + "px"; })
        .html(function(d){ return d.data.size + " <br>" + "грн" })
        .call(wrap, 20)
        .attr("font-size", "13px")
        .attr("fill", "rgb(72, 77, 96)")
        .style("font-weight", "bold")
})




































    function wrap(text, width) {
        text.each(function () {
            var text = d3.select(this),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                lineNumber = 0,
                lineHeight = 1.1, // ems
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
                if (tspan.node().getComputedTextLength() > width) {
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
