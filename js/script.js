/**
 * Created by yevheniia on 17.12.18.
 */

var svg = d3.select("#scatter svg");
var plot_data;
var parseDate = d3.timeParse("%Y-%m-%d");
var format = d3.timeFormat("%d-%b-%Y");
var oneDay = 24 * 60 * 60 * 1000;
var margin = {top: 40, right: 40, bottom: 0, left: 40};
// var viewBox = $("#scatter svg")[0].getAttribute("viewBox").split(" ");
// var size = viewBox.slice(2);
// var width = size[0];
// var height = size[1];

var viewBox = $("#scatter")[0].getBoundingClientRect();
var width = viewBox.width - margin.right - margin.left;
var height = viewBox.height;



var color = d3.scaleOrdinal() // D3 Version 4
    .domain(["вчасно", "затримка", "раніше", "відмова"])
    .range(["white", "yellow", "#8EE28A", "transparent"]);

function retrieve_plot_data(cb) {
    if (plot_data) return cb(plot_data);

    return d3.csv("data/data_may_06.csv", function(err, myData){
        if (err) throw err;

        myData.forEach(function (d) {
            d.counterTotal = +d.counterTotal;
            d.counterByType = +d.counterByType;
            d.registration = parseDate(d.registration);
            d.completion = parseDate(d.completion)
        });

        plot_data  = myData;
        if (cb) return cb(myData);
        return;
    })
}


var points_g = svg.append("g")
    .attr('transform', 'translate(' + margin.left + ','  + -40 + ')')
    .attr("clip-path", "url(#clip)")
    .classed("points_g", true);

svg.append("defs").append("clipPath")
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height);

//шкала без вихідних, не підійшла, бо послуги надавались в суботу також
// var xScale = fc.scaleDiscontinuous(d3.scaleTime())
//         .discontinuityProvider(fc.discontinuitySkipWeekends());


var xScale = d3.scaleTime().domain([parseDate("2017-01-01"), parseDate("2017-12-31")]).range([0, width]);
var xAxis = d3.axisBottom(xScale);

var yScale = d3.scaleLinear().domain([0, 150]).range([height, 0]);
var yAxis = d3.axisLeft(yScale);

retrieve_plot_data(function(data) {
    var filteredData = data.filter(function (d) {
        return d.service === ""
    });

    var points = points_g.selectAll("circle")
        .data(filteredData);
    
    points.enter()
        .append('rect')
        .attr('class', 'bubble');


    //додаємо легенду
    var legendContainer = svg.append("g")
        .attr("id", "legend")
        .attr('transform', 'translate(' + 0 + ',' + margin.top + ')');

    legendContainer.append("rect")
        .attr("fill", "rgb(72, 77, 96)")
        .attr("width", "100px")
        .attr("height", "100px")
        .attr('x', width - 100)
        .attr('y', -10);

    var legend = legendContainer.selectAll('legend')
        .data(color.domain())
        .enter().append('g')
        .attr('class', 'legend')
        .attr('transform', function(d,i){ return 'translate(0,' + i * 20 + ')'; });

    legend.append('rect')
        .attr('x', width -  15)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', color)
        .style('stroke', function(d) {
            if(d === "відмова"){
                return "red"
            }
        });

    legend.append('text')
        .attr('x', width - 22)
        .attr('y', 4)
        .attr('dy', '.35em')
        .style('text-anchor', 'end')
        .text(function(d){ return d; });



    var gX = svg.append('g')
        .attr("class", "x-axis")
        .attr("transform", 'translate(' + margin.left + ', ' + (height - 40) + ")")
        .call(xAxis);

    var gY = svg.append('g')
            .attr("class", "y-axis")
            .attr('transform', 'translate(' + margin.left + ', ' + -40 + ')')
            .call(yAxis);


    var zoom = d3.zoom()
        .extent([[10, 0], [width, height]])
        .scaleExtent([1, 2])
        // .translateExtent([[10, 0], [width, height]])
        .on("zoom", zoomed)
        ;

    svg .append("rect")
        .attr("id", "zoom")
        .attr("width", window.innerWidth)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .call(zoom)
    ;


    function zoomed() {
        var new_xScale = d3.event.transform.rescaleX(xScale);
        var new_yScale = d3.event.transform.rescaleY(yScale);
// update axes
        gX.call(xAxis.scale(new_xScale));
        gY.call(yAxis.scale(new_yScale));
        svg.selectAll('.bubble').attr("transform", d3.event.transform);
    }
        // var cZ =  d3.event.transform.k;
        // //різні x-axis labels на різних рівнях зуму:
        // if(cZ < 2.5){
        //     xAxis.tickFormat(d3.timeFormat("%b"))
        // } else if (cZ >=2.5 && cZ < 4 ){
        //     xAxis.tickFormat(d3.timeFormat("%a %d"))
        // } else {
        //     xAxis.tickFormat(d3.timeFormat("%d.%m"))
        // }



    // // аннтоація
    // var swoopy = d3.swoopyDrag()
    //     .x(function(d){
    //         return xScale(parseDate(d.sepalWidth))})
    //     .y(function(d){
    //         return yScale(+d.sepalLength)})
    //     .draggable(false)
    //     .annotations(annotations);
    //
    // var swoopySel = svg.append('g')
    //     .attr("fill", "none")
    //     .call(swoopy);
    //
    // swoopySel.selectAll("path")
    //     .each(function(d) {
    //         d3.select(this)
    //             .attr("stroke", function(d) {
    //                 return d.fill;
    //             })
    //     });
    //
    // swoopySel.selectAll('text')
    //     .each(function(d){
    //         d3.select(this)
    //             .text('')
    //             .attr("class", "wrappedText")
    //             .style("font-weight", 400)
    //             .attr("stroke", "none")
    //             .attr("fill", function(d) {
    //                 return d.fill;
    //             })
    //             .attr("font-size", function(d) {
    //                 return d.size;
    //             })
    //             .tspans(d3.wordwrap(d.text, d.wrap, d.betweenBig)); //wrap after 20 char
    //
    //     });
    
    


    //DRAW SCATTER PLOT
    function update(dataForChart, counter) {
        xAxis.tickFormat(d3.timeFormat("%b"));

        var viewBox = $("#scatter")[0].getBoundingClientRect();
        var width = viewBox.width - margin.right - margin.left;
        var height = viewBox.height;

        svg.select('.x-axis').call(xAxis);
        svg.select('.y-axis').call(yAxis);

        var t = d3.transition()
            .duration(750);

        zoom.extent([[0, 0], [width, height]])
            .translateExtent([[0, 0], [width, height]]);

        svg.select("#zoom")
            .attr("width", window.innerWidth)
            .attr("height", window.innerHeight)
            .attr('transform', 'translate(' + 0 + ',' + 0 + ')');

        zoom.transform(points_g, d3.zoomIdentity);

        var bubble = points_g.selectAll(".bubble")
            .data(dataForChart);


        // EXIT
        bubble.exit()
        // .transition(t)
            .remove();

        // UPDATE
        bubble
            .transition(t)
            .attr('width', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('x', function (d) {
                return xScale(d.registration);
            })
            .attr('y', function (d) {
                return yScale(d[counter]);
            })
            .style('fill', function (d) {
                    return color(d.color);

            });


        // ENTER
        bubble
            .enter()
            .append("rect")
            .attr("class", "bubble")
            .style("opacity", 0)
            .transition()
            .attr('x', function (d) {
                return xScale(d.registration);
            })
            .attr('y', function (d) {
                return yScale(d[counter]);
            })
            .style('fill', function (d) {
                return color(d.color);
            })
            .attr('width', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .style("opacity", 1)
            .style("stroke", function(d) {
                if(d.positive != "позитивне") {
                    return "red"
                }
            })
        ;

            svg.selectAll(".bubble").on("click", function(d) {
                console.log(d)
            });


        // tippy('.bubble', {
        //     hideOnClick: false,
        //     delay: 50,
        //     arrow: true,
        //     inertia: true,
        //     size: 'small',
        //     duration: 500,
        //     allowHTML: true,
        //     trigger: "mouseenter",
        //     interactive: true,
        //     onShow(tip) {
        //         tip.setContent(tip.reference.getAttribute('data-tippy-content'))
        //     }
        //  });

    }


    $(window).on('resize orientationchange', function() {
        var viewBox = $("#scatter")[0].getBoundingClientRect();
        var width = viewBox.width - margin.right - margin.left;
        var height = viewBox.height;

        xScale.range([0, width]);
        var xAxis = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%b"));

        yScale.range([height, 0]);
        var yAxis = d3.axisLeft(yScale);

        svg.select('.x-axis').call(xAxis);
        svg.select('.y-axis').call(yAxis);

        points_g.selectAll(".bubble")
            .attr('width', width / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', 1.5)
            .attr('x', function (d) {
                return xScale(d.registration);
            })
            .attr('y', function (d) {
                return yScale(d.counterTotal);
            });

        legend.select('rect').attr('x', width);
        legend.select('text').attr('x', width - 6);


        // swoopySel.selectAll('text')
        //     .each(function(d) {
        //         d3.select(this)
        //             .text('')
        //             .tspans(d3.wordwrap(d.text, d.wrap, d.betweenBig)); //wrap after 20 char
        //     })

    });

    var selected =  "Реєстрація місця проживання/перебування";
    var firstData = data.filter(function (d) {
        return d.service === selected
    });

    update(firstData, "counterTotal");
    var selectedNew = "Реєстрація місця проживання/перебування";


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
            .attr("height", height - 500)
            .style("overflow-y", 'auto');

        var thead = table
            .append("thead");

        var hRow = thead.append("tr");

        hRow.append("th")
            .text("К-ть");

        hRow.append("th")
            .text("Послуги");

        var tbody = table
            .append("tbody");

        var rows = tbody.selectAll("tr")
            .data(popular)
            .enter()
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
                selectedNew = d.Var1;
                var type = $('select[name=applicant]').val();
                $('td').css("color", "#a8a8a8");
                $(this).css("color", "white");
                if(type === "select") {
                    if (selectedNew === "Реєстрація місця проживання/перебування") {
                        update(firstData, "counterTotal");
                    } else {
                        var firstDataNew = data.filter(function (d) {
                            return d.service === selectedNew
                        });

                        update(firstDataNew, "counterTotal");
                    }
                } else {
                    var firstDataNew = data.filter(function (d) {
                        return d.service === selectedNew && d.type === type
                    });

                    update(firstDataNew, "counterByType");
                }
                $("#scatterHeader h2").text(selectedNew);
            });



        //таблиця непопулярних послуг
        var unpopular = tabledata.filter(function(d) {
            return d.Freq <= 100
        });
        var table2 = d3.select("#unpopular-services");
        var tbody2 = table2.append("tbody");

        var rows2 = tbody2.selectAll("tr")
            .data(unpopular)
            .enter()
            .append("tr");

        rows2.append("td")
            .text(function (d) {
                return d.Var1
            });

        rows2.append("td")
            .text(function (d) {
                return d.Freq
            });
    });





    //якщо обраний якийсь фільтр знизу
    $('input[type=radio][name=vehicle]').on('change', function() {
        var type = $('input[name=vehicle]:checked').val();
        if(type === "") {
            if (selectedNew === "Реєстрація місця проживання/перебування") {
                update(firstData, "counterTotal");
            } else {
                var firstDataNew = data.filter(function (d) {
                    return d.service === selectedNew
                });

                update(firstDataNew, "counterTotal");
            }
        } else {
            var firstDataNew = data.filter(function (d) {
                return d.service === selectedNew && d.type === type
            });
            update(firstDataNew, "counterByType");
        }
    });


    $('select[name=applicant]').on("change", function() {
        var applicantVal = $('select[name=applicant]').val();
        if(applicantVal === "select") {
            if (selectedNew === "Реєстрація місця проживання/перебування") {
                update(firstData, "counterTotal");
            } else {
                let firstDataNew = data.filter(function (d) {
                    return d.service === selectedNew
                });
                update(firstDataNew, "counterTotal");
            }
        } else {
            let firstDataNew = data.filter(function (d) {
                return d.service === selectedNew && d.type === applicantVal
            });
            update(firstDataNew, "counterByType");

        }

    });

    // $('select[name=result]').on("change", function() {
    //     var resultVal = $('select[name=result]').val();
    //     if(resultVal === "select") {
    //         update(firstData, "counterTotal");
    //     } else {
    //     let firstDataNew = data.filter(function (d) {
    //         return d.service === selectedNew && d.positive === resultVal
    //     });
    //     update(firstDataNew, "counterTotal");
    //     }
    // });



});


var annotations = [
    {
        "sepalWidth": "2017-01-05",
        "sepalLength": 50,
        "path": "",
        "wrap": 6,
        "text": "Одна точка - одне звернення",
        "fill":"#a8a8a8",
        "size":"14px",
        // "bigScreenSize":"10px",
        "marker":"no",
        "betweenBig": 12,
        "textOffset": [
            600, -200
        ]
    }
]

