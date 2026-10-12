export type Theme = "light" | "dark";

/*
 * Each tile pixel's luminance picks a shade, darkest first. Widths are out of
 * 25 luminance steps, tuned for OpenStreetMap tiles: most land falls in the
 * palest band, so countryside reads as one field while water, woods, roads and
 * labels keep their own shades.
 */
const BANDS: Record<Theme, [shade: string, width: number][]> = {
  light: [
    ["#0f380f", 7],
    ["#306230", 6],
    ["#8bac0f", 6],
    ["#c8d3a2", 2],
    ["#dde4c3", 4],
  ],
  dark: [
    ["#d3dfb0", 7],
    ["#9bbc0f", 6],
    ["#306230", 6],
    ["#253f22", 2],
    ["#142a12", 4],
  ],
};

const LUMINANCE =
  "0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0.2126 0.7152 0.0722 0 0 0 0 0 1 0";

const SVG_NS = "http://www.w3.org/2000/svg";

export const filterId = (theme: Theme) => `leaflet-gameboy-${theme}`;

function tableValues(theme: Theme, offset: number) {
  return BANDS[theme]
    .flatMap(([shade, width]) => Array<string>(width).fill(shade))
    .map(hex => (parseInt(hex.slice(offset, offset + 2), 16) / 255).toFixed(3))
    .join(" ");
}

function svgElement(name: string, attributes: Record<string, string>) {
  const el = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  return el;
}

function createFilter(theme: Theme) {
  const filter = svgElement("filter", {
    id: filterId(theme),
    "color-interpolation-filters": "sRGB",
  });
  filter.append(svgElement("feColorMatrix", { type: "matrix", values: LUMINANCE }));
  const transfer = svgElement("feComponentTransfer", {});
  ["R", "G", "B"].forEach((channel, i) => {
    transfer.append(
      svgElement(`feFunc${channel}`, {
        type: "discrete",
        tableValues: tableValues(theme, 1 + i * 2),
      })
    );
  });
  filter.append(transfer);
  return filter;
}

// CSS filters can only shift colours; mapping to a fixed palette needs SVG
// filters, which must live in the document for url(#id) to find them.
export function ensureFilters() {
  if (document.getElementById(filterId("light"))) return;
  const svg = svgElement("svg", {
    "aria-hidden": "true",
    width: "0",
    height: "0",
    style: "position: absolute",
  });
  svg.append(createFilter("light"), createFilter("dark"));
  document.body.append(svg);
}
