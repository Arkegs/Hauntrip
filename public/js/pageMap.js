mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/dark-v10', // style URL
    center: mystery.geometry.coordinates, // starting position [lng, lat]
    zoom: 11 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl());

new mapboxgl.Marker()
    .setLngLat(mystery.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset: 15})
        .setHTML(
            `<p>${mystery.title}</p>`
        )
    )
    .addTo(map);