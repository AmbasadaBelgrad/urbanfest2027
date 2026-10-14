# Venue map source and reproduction

Retrieved 2026-10-14 from the official OpenStreetMap API:
https://www.openstreetmap.org/api/0.6/map?bbox=20.4625,44.8195,20.4710,44.8258

`venue-map-osm.json` retains the selected named street ways, OSM IDs and all their original latitude/longitude vertices. The venue footprint is [OSM way 286217725](https://www.openstreetmap.org/way/286217725), tagged Prostor Miljenko Dereta, Dobračina 55. The marker is at the average of its unique footprint vertices, not at the centre of the map.

Run `python3 tools/build-venue-map.py` from the repository to reproduce `venue-map.svg`. North is up. An equirectangular projection uses cos(latitude) for longitude and the same metres-to-pixels scale on both axes. Geometry is neither rotated nor manually adjusted. The SVG viewport clips roads outside the displayed area. Service roads and unrelated streets are omitted; four street labels are placed separately for legibility.

Map data © OpenStreetMap contributors, [ODbL](https://www.openstreetmap.org/copyright). The OSM-derived coordinate snapshot remains under ODbL. Visible attribution and its copyright link are included on all three pages. The shared SVG uses UrbanFest's palette and site typeface; it contains no interactive map UI or remote tile dependencies.
