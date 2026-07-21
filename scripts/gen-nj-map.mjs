// Generates the accurate New Jersey + Bergen County SVG paths used in the
// homepage "Where I'm From" map (index.html, #about-personal frame 1).
//
// Source data: US Census county/state boundaries via the public-domain
// `us-atlas` package (counties-10m.json TopoJSON). NJ = FIPS 34, Bergen = 34003.
//
// One-time setup (deps are intentionally NOT added to package.json since this
// is a generator, not a runtime dependency):
//   npm i --no-save d3-geo topojson-client
//   curl -o counties-10m.json https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json
//   node scripts/gen-nj-map.mjs
//
// Then paste out.viewBox / stateD / bergenD into the <svg> in index.html.
// The pin is placed by an outer <g transform> so bergenCentroid tells you
// where its tip should land (see index.html for the translate offset).
import { geoConicConformal, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import fs from 'node:fs';

const topo = JSON.parse(fs.readFileSync(new URL('./counties-10m.json', import.meta.url)));
const states = feature(topo, topo.objects.states);
const counties = feature(topo, topo.objects.counties);
const nj = states.features.find((f) => f.id === '34');
const bergen = counties.features.find((f) => f.id === '34003');
if (!nj || !bergen) throw new Error('NJ (34) or Bergen (34003) not found');

const TARGET_H = 300;
const PAD = 6;
// Conformal conic centered on NJ keeps the true shape (plain mercator shears a
// mid-latitude state). Parallels bracket NJ's latitude range.
const projection = geoConicConformal().parallels([39, 41.5]).rotate([74.5, 0]);
projection.fitHeight(TARGET_H - 2 * PAD, nj);
const t = projection.translate();
projection.translate([t[0] + PAD, t[1] + PAD]);

const path = geoPath(projection);
const round = (d) => d.replace(/-?\d+\.?\d*/g, (n) => String(Math.round(parseFloat(n) * 10) / 10));
const stateD = round(path(nj));
const bergenD = round(path(bergen));
const [, [x1, y1]] = path.bounds(nj);
const out = {
  viewBox: `0 0 ${Math.ceil(x1 + PAD)} ${Math.ceil(y1 + PAD)}`,
  bergenCentroid: path.centroid(bergen).map((n) => Math.round(n * 10) / 10),
  stateD,
  bergenD,
};
console.log(JSON.stringify(out, null, 2));
