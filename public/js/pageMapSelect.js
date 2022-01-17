mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-74.5, 40], // starting position
    zoom: 9 // starting zoom
});

const locationInput = document.getElementById('location');

map.addControl(new mapboxgl.NavigationControl());

map.on('click', (e) => {
    let markers = document.getElementsByClassName('mapboxgl-marker mapboxgl-marker-anchor-center');
    locationInput.value = e.lngLat.lat + ',' + e.lngLat.lng;
    if(markers.length > 0){
        markers[0].remove();
    }
    let selectMarker = new mapboxgl.Marker();
    selectMarker.setLngLat(e.lngLat)
        .addTo(map);
});

locationInput.addEventListener('input', (e) => {
    e.stopPropagation();
    if(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/i.test(String(locationInput.value))){
        let longlat = {lng: parseFloat(locationInput.value.split(',')[1]), lat: parseFloat(locationInput.value.split(',')[0])};
        let markers = document.getElementsByClassName('mapboxgl-marker mapboxgl-marker-anchor-center');
        if(markers.length > 0){
            markers[0].remove();
        }
        let selectMarker = new mapboxgl.Marker();
        selectMarker.setLngLat(longlat)
            .addTo(map);
        map.jumpTo({center: longlat});
    }
});

const getLocation = document.getElementById("getLocation");
getLocation.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    var currentPos;
    var geoSuccess = function(position) {
      currentPos = position;
      document.getElementById('location').value = currentPos.coords.latitude + ',' + currentPos.coords.longitude;
      let longlat = {lng: parseFloat(currentPos.coords.longitude), lat: parseFloat(currentPos.coords.latitude)};
      let markers = document.getElementsByClassName('mapboxgl-marker mapboxgl-marker-anchor-center');
      if(markers.length > 0){
          markers[0].remove();
      }
      let selectMarker = new mapboxgl.Marker();
      selectMarker.setLngLat(longlat)
          .addTo(map);
      map.jumpTo({center: longlat});
    };
    navigator.geolocation.getCurrentPosition(geoSuccess);

});