/**
 * Created by yevheniia on 17.12.18.
 */

var plot_data;
var parseDate = d3.timeParse("%Y-%m-%d");
var format = d3.timeFormat("%d-%b-%Y");

var oneDay = 24 * 60 * 60 * 1000;




function retrieve_plot_data(cb) {
    if (plot_data) return cb(plot_data);

    return d3.csv("data/data.csv", function(err, myData){
        if (err) throw err;

        myData.forEach(function (d) {
            d.counterTotal = +d.counterTotal;
            d.counterByType = +d.counterByType;
            d.registration = parseDate(d.registration);
            d.completion = parseDate(d.completion)
        });

        plot_data = myData;
        if (cb) return cb(myData);
        return;
    })
}



var viewBox = $("#scatter")[0].getBoundingClientRect(),
    ww = viewBox.width,
    hh = viewBox.height;


var color = d3.scaleOrdinal() // D3 Version 4
    .domain(["вчасно", "затримка", "раніше", "відмовлено"])
    .range(["#cccccc", "#E58903", "#7EB852", "red"]);

var svg = d3.select("#scatter svg"),
    width =  0.9 * ww,
    height = 0.8 * hh;

var margin = {top: 10, right: (0.1 * width), bottom: (0.1 * width), left: 40};

var points_g = svg.append("g")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .attr("clip-path", "url(#clip)")
        .classed("points_g", true)
        .append("g")
    ;


svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);


var xScale = fc.scaleDiscontinuous(d3.scaleTime())
    .discontinuityProvider(fc.discontinuitySkipWeekends());


xScale.domain([parseDate("2017-01-01"), parseDate("2017-12-31")])
    .range([0, width]);


var yScale = d3.scaleLinear()
    .domain([0, 140])
    .range([height, 0]);



var xAxis = d3.axisBottom(xScale);
var yAxis = d3.axisLeft(yScale);





retrieve_plot_data(function(data) {

    var filteredData = data.filter(function (d) {
        return d.service === ""
    });

    var points = points_g.selectAll("circle").data(filteredData);
    points.enter()
        .append('rect')
        .attr('class', 'bubble')
        .style('opacity', 0)
        .attr("data-tippy-content", function(d) {
            return "дата реєстрації: " + format(d.registration) + ", <br> встановлений термін: " + d.term + " дн. <br>  дата видачі: " + format(d.completion) + ", " + d.id + ", " + d.service
        });



    var lG = svg.append("g")
        .attr("id", "legend")
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    lG.append("rect")
        .attr("fill", "rgb(72, 77, 96)")
        .attr("width", "100px")
        .attr("height", "100px")
        .attr('x', width - 100)
        .attr('y', -10);

    var legend = lG.selectAll('legend')
        .data(color.domain())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });


    legend.append('rect')
        .attr('x', width -  15)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', color);


    legend.append('text')
        .attr('x', width - 22)
        .attr('y', 4)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function(d){ return d; });


    var gX = svg.append('g')
        .attr("class", "x-axis")
        .attr("transform", "translate(40," + (height + margin.top) + ")")
        .call(xAxis);

    var gY = svg.append('g')
            .attr("class", "y-axis")
            .attr('transform', 'translate(' + margin.left + ', ' + margin.top + ')')
            .call(yAxis)
        ;

    var zoom = d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([1, 5])
        .translateExtent([[0, 0], [width, height]])
        .on("zoom", zoomed);


    svg.insert("rect", ".points_g")
        .attr("id", "zoom")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('transform', 'translate(' + margin.left + ',' + (margin.top + 10) + ')')
        .call(zoom)
    ;


    function zoomed() {
        var cZ =  d3.event.transform.k;
        if(cZ < 2.5){
            xAxis.tickFormat(d3.timeFormat("%b"))
        } else if (cZ >=2.5 && cZ < 6 ){
            xAxis.tickFormat(d3.timeFormat("%a %d"))
        } else {
            xAxis.tickFormat(d3.timeFormat("%d.%m"))
        }

        gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
        gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));

        var transform = d3.event.transform;
        points_g.attr("transform", d3.event.transform);
    }



    var swoopy = d3.swoopyDrag()
        .x(function(d){
            return xScale(parseDate(d.sepalWidth))})
        .y(function(d){
            return yScale(+d.sepalLength)})
        .draggable(true)
        .annotations(annotations);

    var swoopySel = svg.append('g')
        .attr("fill", "none")
        .call(swoopy);

    swoopySel.selectAll("path")
        .each(function(d) {
            d3.select(this)
                .attr("stroke", function(d) {
                    return d.fill;
                })

        });

    swoopySel.selectAll('text')
        .each(function(d){
            d3.select(this)
                .text('')
                .attr("class", "wrappedText")
                .style("font-weight", 400)
                .attr("stroke", "none")
                .attr("fill", function(d) {
                    return d.fill;
                })
                .attr("font-size", function(d) {
                    return d.size;
                })
                .tspans(d3.wordwrap(d.text, d.wrap, d.betweenBig)); //wrap after 20 char

        });

    //DRAW SCATTER PLOT
    function update(dataForChart) {

       $(".points_g").find("g").empty();

        swoopy.x(function(d){
            return xScale(parseDate(d.sepalWidth))})
            .y(function(d){
                return yScale(d.sepalLength)});

        xAxis.tickFormat(d3.timeFormat("%b"));


        //get new w/h
        var viewBox = $("#scatter")[0].getBoundingClientRect(),
            ww = viewBox.width,
            hh = viewBox.height;


        var width =  0.9 * ww,
            height = 0.8 * hh;

        svg.select('.x-axis').call(xAxis);
        svg.select('.y-axis').call(yAxis);

        var t = d3.transition()
            .duration(750);


        zoom.extent([[0, 0], [width, height]])
            .translateExtent([[0, 0], [width, height]]);


        svg.select("#zoom")
            .attr("width", width)
            .attr("height", height)
            .attr('transform', 'translate(' + margin.left + ',' + (margin.top + 10) + ')');

        zoom.transform(points_g, d3.zoomIdentity);

        var bubble = points_g.selectAll("circle")
            .data(dataForChart)
            .enter()
            .append("rect")
            .attr("class", "bubble")
            .style("opacity", 0)
            .transition()
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
            .attr('height', 1.5)
        // .attr("data-tippy-content", function(d) {
        //     return "дата реєстрації: " + format(d.registration) + ", <br> встановлений термін: " + d.term + " дн. <br>  дата видачі: " + format(d.completion)
        // })
        ;


        // setTimeout(function(){
        svg.selectAll(".bubble").style("opacity", 1);
        // }, 500);




        tippy('.bubble', {
            hideOnClick: false,
            delay: 50,
            arrow: true,
            inertia: true,
            size: 'small',
            duration: 500,
            allowHTML: true,
            trigger: "mouseenter",
            interactive: true,
            onShow(tip) {
                tip.setContent(tip.reference.getAttribute('data-tippy-content'))
            }
        });

    }


    $(window).on('resize orientationchange', function() {
        var viewBox = $("#scatter")[0].getBoundingClientRect(),
            ww = viewBox.width,
            hh = viewBox.height;

        var width =  0.9 * ww,
            height = 0.8 * hh;

        var xScale = fc.scaleDiscontinuous(d3.scaleTime())
            .discontinuityProvider(fc.discontinuitySkipWeekends());

        xScale.domain([parseDate("2017-01-01"), parseDate("2017-12-31")])
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([0, 140])
            .range([height, 0]);

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

        legend.select('rect').attr('x', width);

        legend.select('text').attr('x', width- 6);


        swoopySel.selectAll('text')
            .each(function(d) {
                d3.select(this)
                    .text('')
                    .tspans(d3.wordwrap(d.text, d.wrap, d.betweenBig)); //wrap after 20 char
            })

    });

    var selected =  "Реєстрація місця проживання/перебування";


    var firstData = data.filter(function (d) {
        return d.service === selected
    });
    update(firstData);






    //draw TABLE

    d3.csv('data/services.csv', function (tabledata) {
        tabledata.forEach(function (d) {
            d.Freq = +d.Freq;
        });

        tabledata.sort(function(a, b){ return b.Freq - a.Freq});

        var popular = tabledata.filter(function(d) {
            return d.Freq > 100
        });

        var table = d3.select("#table")
            .style("height", 0.8 * hh)
            .style("overflow-y", 'auto');


        var tbody = table
            .append("tbody");

        var rows = tbody.selectAll("tr")
            .data(popular)
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
                if(selectedNew === "Реєстрація місця проживання/перебування") {
                    console.log(selectedNew === "Реєстрація місця проживання/перебування");
                    update(firstData);
                } else {
                    var firstDataNew = data.filter(function (d) {
                        return d.service === selectedNew
                    });

                    update(firstDataNew);
                }


                $("#scatterHeader h2").text(selectedNew);
            });


        var unpopular = tabledata.filter(function(d) {
            return d.Freq <= 100
        });


        var table2 = d3.select("#unpopular-services")
            .style("height", "50vh")
            .style("overflow-y", 'auto');


        var tbody2 = table2
            .append("tbody");

        var rows2 = tbody2.selectAll("tr")
            .data(unpopular)
            .enter()
            // .append("table")
            .append("tr");

        rows2.append("td")
            .text(function (d) {
                return d.Var1
            })


        rows2.append("td")
            .text(function (d) {
                return d.Freq
            });




    });

});


var annotations = [
    {
        "sepalWidth": "2017-01-05",
        "sepalLength": 50,
        "path": "",
        "wrap": 20,
        "text": "Одна точка - одне звернення. Наведіть мишею на точки, аби побачити деталі. Графік масштабується колесиком миші",
        "fill":"#a8a8a8",
        "size":"12px",
        // "bigScreenSize":"10px",
        "marker":"no",
        "betweenBig": 15,
        "textOffset": [
            63,-252
        ]
    }
]

