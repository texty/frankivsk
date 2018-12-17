// /**
//  * Created by yevheniia on 28.11.18.
//  */

var plot_data;
var parseDate = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%b");


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


// var svg = d3.select("svg"),
//     width = +svg.attr("width"),
//     height = +svg.attr("height"),






    var margin = {top: 10, right: 10, bottom: 30, left:40};
    var width = 900 - margin.left - margin.right;
    var height = 520 - margin.top - margin.bottom;



    var  selected =  "Реєстрація місця проживання/перебування";



    retrieve_plot_data(function(data){


    var drawPlot = function(selected) {

        $("#scatter").html("");

        var svg = d3.select('#scatter')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


        // The API for scales have changed in v4. There is a separate module d3-scale which can be used instead. The main change here is instead of d3.scale.linear, we have d3.scaleLinear.
        // var xScale = d3.scaleTime()
        //     .range([0, width]);

        var xScale = d3.scaleBand()
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .range([height, 0]);



        // the axes are much cleaner and easier now. No need to rotate and orient the axis, just call axisBottom, axisLeft etc.
        var xAxis = d3.axisBottom()
            .scale(xScale)
            .ticks(2)
            .tickFormat(d3.timeFormat("%b"))
            ;

        var yAxis = d3.axisLeft()
            .scale(yScale);

        // again scaleOrdinal
        // var color = d3.scaleOrdinal(d3.schemeCategory20c);

        var color = d3.scaleOrdinal() // D3 Version 4
            .domain(["вчасно", "затримка", "раніше", "відмовлено"])
            .range(["#cccccc", "#E58903", "#7EB852", "red"]);

        var filteredData =  data.filter(function (d) {
            return d.service === selected
        });

        xScale.domain(filteredData.map(function(d){
            return d.registration;
        }));

        xAxis.tickValues(xScale.domain().filter(function(d, i){ return !(i%20)}))

        // xScale.domain(d3.extent(filteredData, function(d){
        //     return d.registration;
        // })).nice();

        // xScale.domain([parseDate("2017-01-01"), parseDate("2017-12-31")]);

        yScale.domain([0,140]).nice();

        // yScale.domain(d3.extent(filteredData, function(d){
        //     return d.counterTotal;
        // })).nice();

        var gX = svg.append('g')
            .attr('transform', 'translate(0,' + height + ')')
            .attr('class', 'x axis')
            .call(xAxis);


        var gY = svg.append('g')
            .attr('transform', 'translate(0,0)')
            .attr('class', 'y axis')
            .call(yAxis);

        var bubble = svg.selectAll('.bubble')
            .data(filteredData)
            .enter().append('rect')
            .attr('class', 'bubble')
            .attr('x', function(d){return xScale(d.registration);})
            .attr('y', function(d){ return yScale(d.counterTotal); })
            .attr('width', 5)
            .attr('height', 1.5)
            // .attr('r', 2)
            .style('fill', function(d){
                if(d.stan != "В наданні послуги відмовллено"){
                    return color(d.color);
                } else {
                    return "#E01A25"
                }

            });

        d3.selectAll("path.domain").remove();



        // var zoom = d3.zoom()
        //     .scaleExtent([.5, 20])
        //     .translateExtent([[0, 0], [width - 90, height - 100]])
        //     .on("zoom", zoomed);
        //
        // svg.append("rect")
        //     .attr("width", width)
        //     .attr("height", height)
        //     .style("fill", "none")
        //     .style("pointer-events", "all")
        //     .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        //     .call(zoom);

        function zoomed() {
// create new scale ojects based on event
            var new_xScale = d3.event.transform.rescaleX(xScale);
            var new_yScale = d3.event.transform.rescaleY(yScale);
// update axes
            gX.call(xAxis.scale(new_xScale));
            gY.call(yAxis.scale(new_yScale));
            bubble.data(filteredData)
                .attr('cx', function(d) {return new_xScale(d.registration)})
                .attr('cy', function(d) {return new_yScale(d.counterTotal)});
        }



        bubble.append('title')
            .attr('x', function(d){ return d.registration; })
            .text(function(d){
                return d.service;
            });

        // adding label. For x-axis, it's at (10, 10), and for y-axis at (width, height-10).
        // svg.append('text')
        //     .attr('x', 10)
        //     .attr('y', 10)
        //     .attr('class', 'label')
        //     // .text('Sepal Width')
        // ;
        //

        // svg.append('text')
        //     .attr('x', width)
        //     .attr('y', height - 10)
        //     .attr('text-anchor', 'end')
        //     .attr('class', 'label')
        //     // .text('Sepal Length')
        // ;

        // I feel I understand legends much better now.
        // define a group element for each color i, and translate it to (0, i * 20).
        var legend = svg.selectAll('legend')
            .data(color.domain())
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });

        // give x value equal to the legend elements.
        // no need to define a function for fill, this is automatically fill by color.
        legend.append('rect')
            .attr('x', width)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color);

        // add text to the legend elements.
        // rects are defined at x value equal to width, we define text at width - 6, this will print name of the legends before the rects.
        legend.append('text')
            .attr('x', width - 6)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function(d){ return d; });

    };

        drawPlot(selected);


        d3.csv('data/services.csv', function (data) {
            data.forEach(function (d) {
                d.Freq = +d.Freq;

            });


            data.sort(function(a, b){ return b.Freq - a.Freq});


            var table = d3.select("#table");


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
                })

            rows.append("td")
                .text(function (d) {
                    return d.Var1
                })
                .on("click", function(d){
                    console.log(d)
                    var selected = d.Var1

                    drawPlot(selected);
                });




            drawPlot(selected);


        });





    });



