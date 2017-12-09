$(function () {

    var server = {
        localApi: 'localhost:9002',
        analytics:'127.0.0.1:8080'
    };

    var lanes = [];
    var currentLane;

    function loadLanes() {

        $.get('http://' + server.localApi + '/resource/xpo/getLanes', function (res, status) {
            res = JSON.parse(res)

            lanes = res;

            lanes.forEach(function (t, i) {

                var laneData = "<li class=\"tile + " + (i === 0 ? "selected" : "") + "\"" + " data-index='" + i + "'>\n" +
                    "<div class=\"tile-content\">\n" +
                    "<div class=\"tile-icon\">\n" +
                    "<img src=\"../../assets/img/55182-location-on-road.png\"\n" +
                    "     alt=\"\"/>\n" +
                    "</div>\n" +
                    "<div class=\"tile-text\">" + t.Lane.replace("--", "<b>-</b>") + "</div>\n" +
                    "</div>\n" +
                    "</li>";

                $(".lane-selector .list").append(laneData)
            });
            selectedLane(lanes[0]);

        })

    }

    function selectedLane(lane) {
        currentLane = lane;
        locations=currentLane.Lane.split("--");
        drawChart(locations[0],locations[1]);

    }



    function updateSparkCharts() {

        var points = [20, 10, 25, 15, 30, 20, 30, 10, 15, 10, 20, 25, 25, 15, 20, 25, 10, 67, 10, 20, 25, 15, 25, 97, 10, 30, 10, 38, 20, 15, 82, 44, 20, 25, 20, 10, 20, 38];

        materialadmin.App.callOnResize(function () {
            var options = $('.sparkline-revenue').data();
            options.type = 'line';
            options.width = '100%';
            options.height = $('.sparkline-revenue').height() + 'px';
            options.fillColor = false;
            $('.sparkline-revenue').sparkline(points, options);
        });

    }





    $(".lane-selector").on('click', '.tile', function () {
        $(".lane-selector  .tile").removeClass("selected");
        $(this).addClass("selected");
        $(".lane-selector").data("index", $(this).data('index'))
        selectedLane(lanes[$(this).data('index')])
    });


    function drawChart(Fromaddress, Toaddress) {

        var geocoder;
        var map;
        var directionsService = new google.maps.DirectionsService();
        var directionsDisplay = new google.maps.DirectionsRenderer();
        initialize();

        function initialize() {
            var map = new google.maps.Map(
                document.getElementById("map_canvas"), {
                    center: new google.maps.LatLng(37.4419, -122.1419),
                    zoom: 13,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                });
            var directionsService = new google.maps.DirectionsService();
            directionsDisplay.setMap(map);
            calcRoute(Fromaddress, Toaddress);
        }

        google.maps.event.addDomListener(window, "load", initialize);

        function calcRoute(ref1, ref2) {
            var start = String(ref1);
            var end = String(ref2);
            var args = {
                origin: start,
                destination: end,
                provideRouteAlternatives: true,
                travelMode: google.maps.TravelMode.DRIVING
            }
            directionsService.route(args, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    //directionsDisplay.setMap(map);

                    directionsDisplay.setDirections(response);
                    var myroute = directionsDisplay.directions.routes[0];
                    //console.log(directionsDisplay.directions.routes.length);
                    var rout = directionsDisplay.directions.routes;
                    var distanceArray = [];
                    $('#distanceList').html();
                    for (i = 0; i < rout.length; i++) {
                        console.log(rout[i]);
                        var distance = 0;
                        var routeVar = rout[i];
                        for (j = 0; j < routeVar.legs.length; j++) {
                            distance += routeVar.legs[j].distance.value;
                            //for each 'leg'(route between two waypoints) we get the distance and add it to the total
                        }

                        distance = (distance * 0.000621371).toFixed(2);
                        distanceArray.push(distance);
                        $('#distanceList').append('<option>' + distance + '</option>');
                    }
                    //console.log(distanceArray);
                    var opts = {
                        angle: 0, // The span of the gauge arc
                        lineWidth: 0.2, // The line thickness
                        radiusScale: 1, // Relative radius
                        pointer: {
                            length: 0.6, // // Relative to gauge radius
                            strokeWidth: 0.035, // The thickness
                            color: '#000000' // Fill color
                        },
                        limitMax: false,     // If false, max value increases automatically if value > maxValue
                        limitMin: false,     // If true, the min value of the gauge will be fixed
                        colorStart: '#6FADCF',   // Colors
                        colorStop: '#8FC0DA',    // just experiment with them
                        strokeColor: '#E0E0E0',  // to see which ones work best for you
                        generateGradient: true,
                        highDpiSupport: true,     // High resolution support
                        staticLabels: {
                            font: "10px sans-serif",  // Specifies font
                            labels: [1020, , 1935, 2345, 3000, 4000, 5000],  // Print labels at these values
                            color: "#000000",  // Optional: Label text color
                            fractionDigits: 0  // Optional: Numerical precision. 0=round off.
                        },
                    };
                    $(function () {
                        //var target  = canvas-preview ;// $('#myCanvas')[0].getContext('2d'); // your canvas element
                        //console.log(target)
                        distanceArray = distanceArray.map(function (v, i) {
                            return Number(v * (i + 1));
                        })

                        opts.staticLabels.labels = distanceArray;
                        var gauge = new Gauge(document.getElementById("canvas-preview")).setOptions(opts); // c
                        //console.log(223);

                        var lastDist = distanceArray.length;
                        gauge.maxValue = distanceArray[lastDist - 1]; // set max gauge value
                        gauge.setMinValue(distanceArray[0] / 2);  // Prefer setter over gauge.minValue = 0
                        gauge.animationSpeed = 32; // set animation speed (32 is default value)
                        gauge.set(distanceArray[0])
                    });
              /*      lanes.forEach(function (element) {
                        if (element["Lane"] == lne) {
                            buyRate = element["Buy Rate"];
                            console.log("laneId" + buyRate);

                        }
                    });*/
                    $("#distanceList").blur(function () {
                        //console.log($('#distanceList').val()) ;
                        var cst = $('#distanceList').val();
                        var TotalMilesCost = cst * buyRate;

                        $('#milesCost').val(TotalMilesCost);
                    })

                    // var TotalMilesCost = distanceArray[0] * buyRate;

                    // $('#milesCost').val(TotalMilesCost);

                } else {
                    alert("please select a source an destination");
                }
            });

        };
    }


    loadLanes();

});