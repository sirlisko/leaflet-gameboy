# leaflet-gameboy

A [Leaflet](https://leafletjs.com) tile layer that repaints map tiles in the greens of the original Game Boy, with a matching skin for controls, tooltips and vector layers.

**[Demo](https://sirlisko.github.io/leaflet-gameboy/)**

![London in the Game Boy palette](https://raw.githubusercontent.com/sirlisko/leaflet-gameboy/main/demo/screenshot.png)

CSS filters can only shift colours (grayscale, hue-rotate, sepia), so they can't limit a map to a fixed palette. This plugin uses an SVG filter instead: each pixel's luminance picks one of the Game Boy shades.

> [!NOTE]
> Game Boy is a trademark of Nintendo. This project is not affiliated with, endorsed by or sponsored by Nintendo.

## Requirements

- Leaflet 1.9
- A browser with CSS nesting (Chrome 120, Firefox 117, Safari 17.2 or newer)
- An ES module setup: a bundler, or an import map in the browser

## Install

```sh
npm install leaflet-gameboy
```

## Usage

```js
import { map as createMap } from "leaflet";
import GameboyTileLayer, { gameboyToggle } from "leaflet-gameboy";
import "leaflet/dist/leaflet.css";
import "leaflet-gameboy/style.css";

const map = createMap("map").setView([51.505, -0.09], 13);

const tiles = new GameboyTileLayer(
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors",
  }
).addTo(map);

// Optional: a button to show the original colours
gameboyToggle({ layer: tiles }).addTo(map);
```

The palette is tuned for OpenStreetMap's standard tiles at city zoom levels. Zoomed out to a whole country, sea and land fall into nearly the same shade. Other tile styles work, but may put too much or too little in each shade.

If you use OpenStreetMap's own tile servers, follow their [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).

## Palette

The original Game Boy (DMG-01) screen had four shades and no official RGB values. The greens used here come from the popular [Original Gameboy palette on Lospec](https://lospec.com/palette-list/original-gameboy): `#0f380f`, `#306230`, `#8bac0f`, `#9bbc0f`.

To keep large areas of land calm, the light theme swaps the brightest green for two paler tints, `#c8d3a2` and `#dde4c3`. The dark theme turns the ramp around, so roads and labels are lit on a dark screen:

| Theme | Darkest luminance → lightest                                   |
| ----- | -------------------------------------------------------------- |
| light | `#0f380f` `#306230` `#8bac0f` `#c8d3a2` `#dde4c3`              |
| dark  | `#d3dfb0` `#9bbc0f` `#306230` `#253f22` `#142a12`              |

### Lines and markers

Vector layers keep Leaflet's default blue unless you pass one of these classes through `className`:

| Class                             | Effect                         |
| --------------------------------- | ------------------------------ |
| `leaflet-gameboy-line`            | Darkest green stroke           |
| `leaflet-gameboy-line-dashed`     | Dashed stroke                  |
| `leaflet-gameboy-line-highlight`  | Red stroke, like the power LED |
| `leaflet-gameboy-marker`          | Outlined circle marker         |

```js
polyline(latlngs, { className: "leaflet-gameboy-line", weight: 3 }).addTo(map);
circleMarker(latlng, { className: "leaflet-gameboy-marker", radius: 6 }).addTo(map);
```

### Theming

The skin reads these custom properties. Set them on the map container (or any ancestor) to match your site:

```css
.leaflet-container {
  --gb-darkest: #0f380f;
  --gb-dark: #306230;
  --gb-light: #8bac0f;
  --gb-lighter: #c8d3a2;
  --gb-lightest: #dde4c3;
  --gb-highlight: #c8231b;
  --gb-font: inherit;
}
```

The dark theme swaps them under `.leaflet-gameboy-dark`. The tile palette itself is fixed, since SVG filters can't read CSS variables.

## API

### `GameboyTileLayer`

Extends [`L.TileLayer`](https://leafletjs.com/reference.html#tilelayer). Also available as the factory `gameboyTileLayer(url, options)`.

| Option  | Type                          | Default  | Description                                                   |
| ------- | ----------------------------- | -------- | ------------------------------------------------------------- |
| `theme` | `"auto" \| "light" \| "dark"` | `"auto"` | `"auto"` follows `prefers-color-scheme`.                      |
| `skin`  | `boolean`                     | `true`   | Restyle the map's controls, attribution, border and tooltips. |

All `L.TileLayer` options are supported too.

| Method                | Returns                | Description                                    |
| --------------------- | ---------------------- | ---------------------------------------------- |
| `setTheme(theme)`     | `this`                 | Switch theme without reloading tiles.          |
| `getTheme()`          | `"light" \| "dark"`    | The theme in use, with `"auto"` resolved.      |
| `setEnabled(enabled)` | `this`                 | `false` shows the tiles in original colours.   |
| `isEnabled()`         | `boolean`              | Whether the palette is applied.                |

### `GameboyToggle`

Extends [`L.Control`](https://leafletjs.com/reference.html#control). Also available as the factory `gameboyToggle(options)`.

| Option     | Type               | Default                   | Description                 |
| ---------- | ------------------ | ------------------------- | --------------------------- |
| `layer`    | `GameboyTileLayer` | required                  | The layer to switch.        |
| `title`    | `string`           | `"Show original colours"` | Tooltip and accessible name |
| `position` | `string`           | `"topright"`              | Any Leaflet control corner. |

The button is keyboard accessible and reports its state with `aria-pressed`.

## Notes

- The filter is set on each tile, not on the tile pane: Safari ignores an SVG filter on the pane.
- The filter definitions are added once to `document.body` as a hidden SVG.

## Development

```sh
pnpm install
pnpm run build
python3 -m http.server   # then open http://localhost:8000/demo/
```

## License

[MIT](./LICENSE)
