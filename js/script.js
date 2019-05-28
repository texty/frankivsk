/**
 * Created by yevheniia on 17.12.18.
 */

var svg = d3.select("#scatter svg");
var plot_data;
var parseDate = d3.timeParse("%Y-%m-%d");
var format = d3.timeFormat("%d-%b-%Y");
var oneDay = 24 * 60 * 60 * 1000;
var margin = {top: 40, right: 40, bottom: 0, left: 40};


var locale = d3.timeFormatLocale({
    "dateTime": "%A, %e %B %Y г. %X",
    "date": "%d.%m.%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["неділя", "понеділок", "вівторок", "середа", "четвер", "п'ятница", "субота"],
    "shortDays": ["нд", "пн", "вт", "ср", "чт", "пт", "сб"],
    "months": ["01", "лют", "бер", "квіт", "трав", "черв", "лип", "серп", "вер", "жовт", "лист", "груд"],
    "shortMonths": ["січ", "лют", "бер", "квіт", "трав", "черв", "лип", "серп", "вер", "жовт", "лист", "груд"]
});

var formatMillisecond = locale.format(".%L"),
    formatSecond = locale.format(":%S"),
    formatMinute = locale.format("%I:%M"),
    formatHour = locale.format("%I %p"),
    formatDay = locale.format("%a %d"),
    formatWeek = locale.format("%b %d"),
    formatMonth = locale.format("%B"),
    formatYear = locale.format("%Y");

function multiFormat(date) {
    return (d3.timeSecond(date) < date ? formatMillisecond
        : d3.timeMinute(date) < date ? formatSecond
        : d3.timeHour(date) < date ? formatMinute
        : d3.timeDay(date) < date ? formatHour
        : d3.timeMonth(date) < date ? (d3.timeWeek(date) < date ? formatDay : formatWeek)
        : d3.timeYear(date) < date ? formatMonth
        : formatYear)(date);
}


var viewBox = $("#scatter")[0].getBoundingClientRect();
var width = viewBox.width - margin.right - margin.left;
var height = viewBox.height;

// #8EE28A
var color = d3.scaleOrdinal() // D3 Version 4
    .domain(["вчасно", "затримка", "раніше"])
    .range([ "lightgrey", "#FFD500", "#4FC595"]);

var result = d3.scaleOrdinal()
    .domain(["надано", "відмовлено"])
    .range([ "#484d60", "transparent"]);

var legend_mob = d3.scaleOrdinal()
    .domain(["вчасно", "затримка", "раніше", "відмова"])
    .range([ "white", "yellow", "jellyfish", "transparent"]);

function retrieve_plot_data(cb) {
    if (plot_data) return cb(plot_data);

    return d3.csv("data/data_2018.csv", function(err, myData){
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


var xScale = d3.scaleTime().domain([parseDate("2018-01-01"), parseDate("2018-09-30")]).range([0, width]);
var xAxis = d3.axisBottom(xScale);

var yScale = d3.scaleLinear().domain([0, 240]).range([height, 0]);
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


    /*----  Legend ---- */
    points_g.append("g")
        .attr("class", "legend1")
        .attr("transform", "translate(50,50)");

    var legend1 = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .useClass(false)
        .title("Чи вчасно надана послуга:")
        .titleWidth(200)
        .scale(color);

    points_g.select(".legend1")
        .call(legend1);


    points_g.append("g")
        .attr("class", "legend2")
        .attr("transform", "translate(50, 180)");

    var legend2 = d3.legendColor()
        .labelFormat(d3.format(".2f"))
        .useClass(true)
        .title("Результат надання:")
        .titleWidth(200)
        .scale(result);

    points_g.select(".legend2")
        .call(legend2);


    points_g.append("g")
        .attr("class", "legendMob")
        .attr("transform", "translate(15,50)");

    var legendMob = d3.legendColor()
        .labelFormat(d3.format(".2f"))

        .useClass(true)

        .title("")
        .titleWidth(200)
        .scale(legend_mob);

    points_g.select(".legendMob")
        .call(legendMob);

    points_g.selectAll(".legendMob rec")
        .attr("class", function(d, i) {
            return "rect" + i

        });



    /*----  Axis ---- */
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

    //DRAW SCATTER PLOT
    function update(dataForChart, counter) {
        xAxis.tickFormat(multiFormat);

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
            .attr('width', height / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', height / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
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
            .attr('width', height / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', height / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .style("opacity", 1)
            .style("stroke", function(d) {
                if(d.positive != "позитивне") {
                    return "red"
                }
            });

            svg.selectAll(".bubble").on("click", function(d) {
                console.log(d)
            });
    }


    $(window).on('resize orientationchange', function() {
        var viewBox = $("#scatter")[0].getBoundingClientRect();
        var width = viewBox.width - margin.right - margin.left;
        var height = viewBox.height;

        xScale.range([0, width]);
        var xAxis = d3.axisBottom(xScale).tickFormat(multiFormat);

        yScale.range([height, 0]);
        var yAxis = d3.axisLeft(yScale);

        svg.select('.x-axis').call(xAxis);
        svg.select('.y-axis').call(yAxis);

        points_g.selectAll(".bubble")
            .attr('width', height / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('height', height / (Math.abs(xScale.domain()[0] - xScale.domain()[1]) / oneDay))
            .attr('x', function (d) {
                return xScale(d.registration);
            })
            .attr('y', function (d) {
                return yScale(d.counterTotal);
            });
         });

    var selected =  "Реєстрація місця проживання/перебування";
    var firstData = data.filter(function (d) {
        return d.service === selected
    });

    update(firstData, "counterTotal");
    var selectedNew = "Реєстрація місця проживання/перебування";


    //draw TABLE
    d3.csv('data/services_2018.csv', function (tabledata) {
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
            .text("Послуга");

        var tbody = table
            .append("tbody");

        var rows = tbody.selectAll("tr")
            .data(popular)
            .enter()
            .append("tr");


        rows.append("td")
            .text(function (d) {
                return d.Freq
            })
            ;

        rows.append("td")
            .text(function (d) {
                return d.Var1
            })
            .style("font-weight", function(d) {
                if(d.Var1 === "Реєстрація місця проживання/перебування"){
                    return "800"
                } else {
                    return "300"
                }

                    })
            .on("click", function(d){
                selectedNew = d.Var1;
                var type = $('select[name=applicant]').val();
                $('td').css("font-weight", "300");
                $(this).css("font-weight", "800");
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
});



