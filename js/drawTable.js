/**
 * Created by yevheniia on 12.12.18.
 */
// d3.csv('data/services.csv', function (data) {
//     data.forEach(function (d) {
//         d.Freq = +d.Freq;
//        
//     });
//    
//    
//     data.sort(function(a, b){ return a.Freq - b.Freq});
//
//
//     var table = d3.select("#table");
//
//
//     var tbody = table
//         .append("tbody");
//
//     var rows = tbody.selectAll("tr")
//         .data(data)
//         .enter()
//         // .append("table")
//         .append("tr");
//
//
//     rows.append("td")
//         .text(function (d) {
//             return d.Var1
//         })
//         .on("click", function(d){
//             console.log(d)
//             var selected = d.Var1
//         });
//
//          drawPlot(selected);
//    
//
// });

