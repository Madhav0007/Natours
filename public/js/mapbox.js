export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibWFkaGF2MDA3IiwiYSI6ImNseWZmMnNidDBjYWIycnMxZTA5ajl0bDQifQ.4nwIOEsJO4cMWOXNQuGkKQ';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    // style: 'mapbox://styles/madhav007/clyfyrvc900tm01qp2g6z9eyh',
    scrollZoom: false,
    // center: [-118.113491, 34.111745],
    // zoom: 9,
    // interactive:false
  });
  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create Marker
    const el = document.createElement('div');
    el.className = 'marker';
    //  Add Marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}:${loc.description}</p>`)
      .addTo(map);

    //  Extend Map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
