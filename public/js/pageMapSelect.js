mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-74.5, 40], // starting position
    zoom: 9 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

map.on('click', (e) => {
    let markers = document.getElementsByClassName('mapboxgl-marker mapboxgl-marker-anchor-center');
    document.getElementById('location').value = e.lngLat.lng + ',' + e.lngLat.lat;
    if(markers.length > 0){
        markers[0].remove();
    }
    let selectMarker = new mapboxgl.Marker();
    selectMarker.setLngLat(e.lngLat)
        .addTo(map);
});