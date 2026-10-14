"""Render the checked-in OSM snapshot; no hand-drawn street coordinates.
Refresh source from the bbox URL documented in assets/venue-map-source.md.
"""
from pathlib import Path
import json, math, html
ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'assets/venue-map-osm.json').read_text())
# Local equirectangular projection, north up, same metres per pixel on both axes.
LAT, LON, SCALE = 44.82235, 20.4666, 1.12

def project(p):
    lat, lon = p
    return (320 + (lon-LON)*111320*math.cos(math.radians(LAT))*SCALE,
            240 - (lat-LAT)*111320*SCALE)

def path(points):
    return 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x,y in map(project, points))

parts = ['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480" role="img" aria-labelledby="title desc">',
'<title id="title">Prostor Miljenko Dereta · Dobračina 55</title>',
'<desc id="desc">North-up map of real OpenStreetMap streets in Dorćol, Belgrade. The red 55 marks the venue building.</desc>',
'<rect width="640" height="480" fill="#f7e7de"/>',
'<g fill="none" stroke="#4f364b" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".28">']
for w in data['streets']:
    parts.append(f'<path data-osm-way="{w["id"]}" d="{path(w["points"])}"/>')
parts.append('</g><g fill="none" stroke="#261123" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">')
for w in data['streets']:
    if w['name'] in ('Dobračina','Cara Dušana','Gundulićev venac'):
        parts.append(f'<path d="{path(w["points"])}"/>')
parts.append('</g>')
parts.append(f'<path d="{path(data["venue"]["points"])} Z" fill="#8eb9c7"/>')
# Label positions are cartographic annotations; street vertices above are untouched.
parts.append('<g fill="#4f364b" font-family="Geologica, Arial, sans-serif" font-size="22" paint-order="stroke" stroke="#f7e7de" stroke-width="7" stroke-linejoin="round">')
for label,x,y,angle in [('Dobračina',165,357,-47),('Gundulićev venac',393,314,48),('Cara Dušana',22,309,38),('Dositejeva',454,250,-46)]:
    parts.append(f'<text x="{x}" y="{y}" transform="rotate({angle} {x} {y})">{html.escape(label)}</text>')
parts.append('</g>')
pts=data['venue']['points'][:-1]
x,y=project((sum(p[0] for p in pts)/len(pts),sum(p[1] for p in pts)/len(pts)))
parts.append(f'<g transform="translate({x:.2f} {y:.2f})"><circle r="37" fill="#f7e7de"/><circle r="30" fill="#db3e1d"/><text y="9" text-anchor="middle" font-family="Geologica, Arial, sans-serif" font-size="27" font-weight="600" fill="#f7e7de">55</text></g>')
parts.append(f'<path d="M{x-30:.2f} {y:.2f} H{x-80:.2f} V{y-64:.2f}" fill="none" stroke="#db3e1d" stroke-width="2"/>')
parts.append(f'<g transform="translate({x-260:.2f} {y-130:.2f})"><rect width="237" height="64" rx="8" fill="#f7e7de"/><text x="12" y="25" fill="#db3e1d" font-family="Geologica, Arial, sans-serif" font-size="25" font-weight="500"><tspan>Prostor</tspan><tspan x="12" dy="26">Miljenko Dereta</tspan></text></g>')
parts.append('</svg>')
(ROOT/'assets/venue-map.svg').write_text('\n'.join(parts)+'\n')
print('marker',x,y)
