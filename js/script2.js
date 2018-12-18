/**
 * Created by yevheniia on 17.12.18.
 */

var plot_data;
var parseDate = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%b");
var oneDay = 24 * 60 * 60 * 1000;


function retrieve_plot_data(cb) {
    if (plot_data) return cb(plot_data);

    return d3.csv("data/data.csv", function(err, myData){
        if (err) throw err;

        myData.forEach(function (d) {
            d.counterTotal = +d.counterTotal;
            d.counterByType = +d.counterByType;
            d.registration = parseDate(d.registration)
        });

        plot_data = myData;
        if (cb) return cb(myData);
        return;
    })
}

var viewBox = $("#scatter")[0].getBoundingClientRect(),
    ww = viewBox.width,
    hh = viewBox.height;



// var viewBox = $("#scatter svg")[0].getAttribute("viewBox").split(" "),
//     size = viewBox.slice(2),
//     ww = size[0],
//     hh = size[1];


// var n = 50; // number of points
// var max = 100; // maximum of x and y

var t = d3.transition()
    .duration(750);

var  selected =  "Реєстрація місця проживання/перебування";

var color = d3.scaleOrdinal() // D3 Version 4
    .domain(["вчасно", "затримка", "раніше", "відмовлено"])
    .range(["#cccccc", "#E58903", "#7EB852", "red"]);

retrieve_plot_data(function(data) {

    // var drawPlot = function(selected) {

        $("#scatter").find("svg").empty();

// dimensions and margins
        var svg = d3.select("svg"),
            // width = +svg.attr("width"),
            // height = +svg.attr("height"),
            width =  0.9 * ww,
            height = 0.9 * hh;
    



       var margin = {top: 10, right: (0.1 * width), bottom: (0.1 * width), left: 40};

        // create a clipping region
        svg.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

// create scale objects
        var xScale = d3.scaleTime()
            .domain([parseDate("2017-01-01"), parseDate("2017-12-31")])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([0, 140])
            .range([height, 0]);

// create axis objects
        var xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%b"));

        var yAxis = d3.axisLeft(yScale)
            .ticks(20, "s");
// Draw Axis

        var gX = svg.append('g')
            .attr("class", "x-axis")
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + height) + ')')
            .call(xAxis);

        var gY = svg.append('g')
            .attr("class", "y-axis")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(yAxis);

// Draw Datapoints
        var points_g = svg.append("g")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .attr("clip-path", "url(#clip)")
            .classed("points_g", true);


        var filteredData = data.filter(function (d) {
            return d.service === selected
        });


        var points = points_g.selectAll("circle").data(filteredData);
        points.enter()
            .append('rect')
            .attr('class', 'bubble')
            .attr('x', function (d) {
                return xScale(d.registration);
            })
            .attr('y', function (d) {
                return yScale(d.counterTotal);
            })
            .attr('width', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', 1.5)
            // .attr('r', 2)
            .style('fill', function (d) {
                if (d.stan != "В наданні послуги відмовллено") {
                    return color(d.color);
                } else {
                    return "#E01A25"
                }

            });


    svg.selectAll(".bubble")
        .on("mousedown", function() {
            d3.event.stopImmediatePropagation();
        });


    points.on("click", function(d){
        alert("hi")
            });

        d3.selectAll("path.domain").remove();

        var lG = svg.append("g")
            .attr("id", "legend")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


        var legend = lG.selectAll('legend')
            .data(color.domain())
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });


        legend.append('rect')
            .attr('x', width)
            .attr('width', 10)
            .attr('height', 10)
            .style('fill', color);


        legend.append('text')
            .attr('x', width- 6)
            .attr('y', 4)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function(d){ return d; });

// Pan and zoom


    function update(selected) {

         var filteredDataNew = data.filter(function (d) {
            return d.service === selected
        });

        var viewBox = $("#scatter")[0].getBoundingClientRect(),
            ww = viewBox.width,
            hh = viewBox.height;


        var width =  0.9 * ww,
            height = 0.9 * hh;


       xScale.domain([parseDate("2017-01-01"), parseDate("2017-12-31")])
            .range([0, width]);

       yScale.domain([0, 140])
            .range([height, 0]);


        var xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%b"));

        var yAxis = d3.axisLeft(yScale);

        svg.select('.x-axis').call(xAxis);
        svg.select('.y-axis').call(yAxis);

        var t = d3.transition()
            .duration(750);

        // JOIN new data with old elements.
        var bubble = points_g.selectAll(".bubble")
            .data(filteredDataNew);

        bubble.on("click", function() {
            alert("hi")
        });


        // EXIT
        bubble.exit()
            // .transition(t)
            .remove();

        // UPDATE
        bubble
            .transition(t)
            .attr('width', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', 1.5)
            .attr('x', function (d) {
                // console.log(d);
                return xScale(d.registration);
            })
            .attr('y', function (d) {
                return yScale(d.counterTotal);
            })
            .style('fill', function (d) {
                if (d.stan != "В наданні послуги відмовллено") {
                    return color(d.color);
                } else {
                    return "#E01A25"
                }
            })

            ;


        // ENTER
        bubble
            .enter()
            .append("rect")
            .attr("class", "bubble")
            .style("opacity", 0)
            .transition()
            // .duration(500)

            .attr('x', function (d) {
                        return xScale(d.registration);
                    })
            .attr('y', function (d) {
                        return yScale(d.counterTotal);
                    })
            .style('fill', function (d) {
                if (d.stan != "В наданні послуги відмовллено") {
                    return color(d.color);
                } else {
                    return "#E01A25"
                }
            })
            .attr('width', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', 1.5);


        setTimeout(function(){
            svg.selectAll(".bubble").style("opacity", 1)
        }, 500);

        points_g.selectAll(".bubble").on("click", function() {
            alert("hi")
        });



        var zoom = d3.zoom()
            .scaleExtent([1, 20])
            .translateExtent([[0, 0], [width, height]])
            .extent([[0, 0], [width, height]])
            .on("zoom", zoomed);

        svg.append("rect")
            .attr("id", "zoom")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(zoom)
        ;

        $("#zoom").on("click", function(){
            console.log(this);
            $(this).css("pointer-events", "none")
        });

        $(window).on("mousewheel", function(){
            $("#zoom").css("pointer-events", "all")
        });

        function zoomed() {

            // create new scale ojects based on event

            var new_xScale = d3.event.transform.rescaleX(xScale);
            var new_yScale = d3.event.transform.rescaleY(yScale);


// update axes
            gX.call(xAxis.scale(new_xScale));
            gY.call(yAxis.scale(new_yScale));

            var oneDay = 24 * 60 * 60 * 1000;
            var daysAmount = Math.abs(new_xScale.domain()[0] - new_xScale.domain()[1]) / oneDay;


            // var pointsZ = points_g.selectAll('rect.bubble');
            var bubbleZ = points_g.selectAll(".bubble");
            bubbleZ.data(filteredDataNew)
                .attr('width', (width / daysAmount) / 1.5)
                // .attr('height', (height / Math.abs(new_yScale.domain()[0] - new_yScale.domain()[1])) / 1.5 )
                .attr('height', (width / daysAmount) / 1.5)
                .attr('x', function (d) {
                    return new_xScale(d.registration);
                })
                .attr('y', function (d) {
                    return new_yScale(d.counterTotal);
                });


        }

    }


    $(window).on('resize', function() {
        var viewBox = $("#scatter")[0].getBoundingClientRect(),
            ww = viewBox.width,
            hh = viewBox.height;


        var width =  0.9 * ww,
            height = 0.9 * hh;


        var xScale = d3.scaleTime()
            .domain([parseDate("2017-01-01"), parseDate("2017-12-31")])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([0, 140])
            .range([height, 0]);


        var xAxis = d3.axisBottom(xScale)
            .tickFormat(d3.timeFormat("%b"));

        var yAxis = d3.axisLeft(yScale);


        svg.select('.x-axis').call(xAxis);
        svg.select('.y-axis').call(yAxis);


        points_g.selectAll(".bubble")
            .attr('width', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', 1.5)
            .attr('x', function (d) {
                // console.log(d.registration);
                return xScale(d.registration);
            })
            .attr('y', function (d) {
                return yScale(d.counterTotal);
            });


        legend.select('rect')
            .attr('x', width);


        legend.select('text')
            .attr('x', width- 6)
            ;

    });


    update(selected);



    d3.csv('data/services.csv', function (data) {
        data.forEach(function (d) {
            d.Freq = +d.Freq;

        });


        data.sort(function(a, b){ return b.Freq - a.Freq});

        data = data.filter(function(d) {
            return d.Freq > 100
        });

        var table = d3.select("#table")
            .style("height", 0.8 * hh)
            .style("overflow-y", 'auto');


        var tbody = table
            .append("tbody");

        var rows = tbody.selectAll("tr")
            .data(data)
            .enter()
            // .append("table")
            .append("tr");


        rows.append("td")
            .text(function (d) {
                return d.Freq
            });

        rows.append("td")
            .text(function (d) {
                return d.Var1
            })
            .on("click", function(d){
                var selectedNew = d.Var1;
                $('td').css("font-weight", 400);
                $('td').css("color", "#a8a8a8");
                $(this).css("font-weight", 800);
                $(this).css("color", "#a8a8a8");
                update(selectedNew);
                $("#scatterHeader h2").text(selectedNew);
            });

    });

});