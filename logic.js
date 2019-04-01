// Import & Visualize the Data
// Get data-set from USGS
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl, function(data) {
    // log to examine the data
    console.log(data.features);
  
    // fuction to be called on the data
    createFeatures(data.features);
});

// Function to set color based on magnitude
function getColor(d) {
    return d > 6.5 ? '#990000' :
           d > 6 ? '#d7301f' :
           d > 5.5 ? '#ef6548' :
           d > 5 ? '#fc8d59' :
           d > 4.5 ? '#fdbb84' :
           d > 4 ? '#fdd49e' :
           '#fef0d9';
};

// Function to scale radius to better distinguish between magnitudes
function scaleRadius(d) {
    var radius = d3.scaleLinear()
    .domain([4,7])
    .range([1,20]);

    console.log(d);
    console.log(radius(d));

    return +radius(d);
};

// Set world boundary to not let map pan past markers
var bounds = [[-90, -180], [90, 180]];

// Create a map using Leaflet that plots all of the earthquakes from your data set 
// based on their longitude and latitude.
function createFeatures(earthquakeData) {

    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        // Include popups that provide additional information about the earthquake when a marker is clicked.
        layer.bindPopup('<h3>Magnitude: ' + feature.properties.mag + '</h3><hr><p>' + feature.properties.place + '</p>');
        layer.on('click', function() {
            layer.openPopup();
        });
    };

    // Your data markers should reflect the magnitude of the earthquake in their size and color. 
    // Earthquakes with higher magnitudes should appear larger and darker in color.
    // Data marker function
    function pointToLayer(feature, latlng) {
        let options = {
            radius: scaleRadius(feature.properties.mag),
            // find the magnitude and assign color based on getColor function
            fillColor: getColor(feature.properties.mag),
            color: getColor(feature.properties.mag),
            weight: 2,
            opacity: 1,
            fillOpacity: 0.7
        }
        return L.circleMarker(latlng, options);
    };

    // Create layer holding earthquake popups and circles
    var earthquakes = L.geoJson(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: pointToLayer,
    });

    // make earthquake layer
    createMap(earthquakes);
};

//   Create a legend that will provide context for your map data.

// MAke map
function createMap(earthquakes) {
    // Define map layers
    // Satellite
    var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 7,
        id: 'mapbox.satellite',
        accessToken: API_KEY
    });

    // Different satellite version with country names
    // Tilelayers
    var satellite_names = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 5,
        id: "mapbox.streets-satellite",
        accessToken: API_KEY
    });

    // baseMaps object (base layers)
    var baseMaps = {
        "Satellite": satellite,
        "Show Country Names": satellite_names
    };
    
    // overlayMaps object (earthquake data)
    var overlayMaps = {
        '4.5 Magnitude Earthquakes': earthquakes,
    };

    // Create a new map
    var myMap = L.map("map", {
        center: [14.4974, 14.4524],
        zoom: 3,
        layers: [satellite, earthquakes],
        maxBounds: bounds,
    });

    // Layer control with baseMaps and overlayMaps
    L.control.layers(baseMaps, overlayMaps).addTo(myMap);

    // Legend for magnitudes
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {

        // define color ranges and labels for legend
        var div = L.DomUtil.create('div', 'info legend'),
            magnitudes = [4, 4.5, 5, 5.5, 6, 6.5, 7],
            labels = ['0-4', '4-4.5', '4.5-5', '5-5.5', '5.5-6', '6-6.5', '>6.5'];

        // loop through magnitudes and add color to legend
        for (var i = 0; i < magnitudes.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitudes[i]) + '"></i> ' +
                labels[i] + '<br>';
            }
            
            return div;
    };
        
    legend.addTo(myMap);
}

