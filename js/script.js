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

        var xScale = d3.scaleTime()
            .range([0, width]);

        // var xScale = d3.scaleBand()
        //     .range([0, width]);

        var yScale = d3.scaleLinear()
            .range([height, 0]);

        var xAxis = d3.axisBottom()
                .scale(xScale)
                // .ticks(2)
                .tickFormat(d3.timeFormat("%b"));

        var yAxis = d3.axisLeft()
            .scale(yScale);


        var svg = d3.select('#scatter')
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
            .call(d3.zoom()
                .scaleExtent([1, 20])
                .extent([[0, 0], [width + margin.left + margin.right, height + margin.top + margin.bottom]])
                .on('zoom', onZoom));






        var color = d3.scaleOrdinal() // D3 Version 4
            .domain(["вчасно", "затримка", "раніше", "відмовлено"])
            .range(["#cccccc", "#E58903", "#7EB852", "red"]);

        var filteredData =  data.filter(function (d) {
            return d.service === selected
        });

        // xScale.domain(filteredData.map(function(d){
        //     return d.registration;
        // }));
        // xAxis.tickValues(xScale.domain().filter(function(d, i){ return !(i%20)}))



        xScale.domain([parseDate("2017-01-01"), parseDate("2017-12-31")]);

        yScale.domain([0,140]).nice();

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


        bubble.append('title')
            .attr('x', function(d){ return d.registration; })
            .text(function(d){
                return d.service;
            });

        //// adding label
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


        var legend = svg.selectAll('legend')
            .data(color.domain())
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });


        legend.append('rect')
            .attr('x', width)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', color);


        legend.append('text')
            .attr('x', width - 6)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'end')
            .text(function(d){ return d; });



        function onZoom() {
            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);

            const xScaleNew = d3.event.transform.rescaleX(xScale);
            gX.call(xAxis.scale(xScaleNew).tickFormat(d3.timeFormat("%d-%m")));

            const yScaleNew = d3.event.transform.rescaleY(yScale);
            gY.call(yAxis.scale(yScaleNew));

            svg.selectAll('.bubble')
                .attr('x', function(d){ return  xScaleNew(d.registration) })
                .attr('y', function(d){ return  yScaleNew(d.counterTotal) });
        }

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



