import { TileLayer, type Map, type TileLayerOptions } from "leaflet";
import { ensureFilters, type Theme } from "./palette.js";

export interface GameboyTileLayerOptions extends TileLayerOptions {
  /** "auto" follows prefers-color-scheme. */
  theme?: Theme | "auto";
  /** Restyle the map's controls, attribution and tooltips too. */
  skin?: boolean;
}

const DARK_QUERY = "(prefers-color-scheme: dark)";

export class GameboyTileLayer extends TileLayer {
  declare options: GameboyTileLayerOptions;
  declare private _gameboyOff: boolean | undefined;
  declare private _darkQuery: MediaQueryList | undefined;

  constructor(urlTemplate: string, options: GameboyTileLayerOptions = {}) {
    super(urlTemplate, { theme: "auto", skin: true, ...options });
  }

  onAdd(map: Map) {
    ensureFilters();
    super.onAdd(map);
    this._watchScheme();
    this._updateClasses();
    return this;
  }

  onRemove(map: Map) {
    this._unwatchScheme();
    map
      .getContainer()
      .classList.remove("leaflet-gameboy", "leaflet-gameboy-dark");
    super.onRemove(map);
    return this;
  }

  setTheme(theme: Theme | "auto") {
    this.options.theme = theme;
    if (this._map) {
      this._unwatchScheme();
      this._watchScheme();
      this._updateClasses();
    }
    return this;
  }

  getTheme(): Theme {
    const { theme } = this.options;
    if (theme === "light" || theme === "dark") return theme;
    return window.matchMedia(DARK_QUERY).matches ? "dark" : "light";
  }

  /** Off shows the tiles in their original colours. */
  setEnabled(enabled: boolean) {
    this._gameboyOff = !enabled;
    this._updateClasses();
    return this;
  }

  isEnabled() {
    return !this._gameboyOff;
  }

  private _watchScheme() {
    if (this.options.theme !== "auto") return;
    this._darkQuery = window.matchMedia(DARK_QUERY);
    this._darkQuery.addEventListener("change", this._updateClasses);
  }

  private _unwatchScheme() {
    this._darkQuery?.removeEventListener("change", this._updateClasses);
    this._darkQuery = undefined;
  }

  private _updateClasses = () => {
    const container = this.getContainer();
    if (!this._map || !container) return;
    const dark = this.getTheme() === "dark";
    container.classList.add("leaflet-gameboy-tiles");
    container.classList.toggle("leaflet-gameboy-dark", dark);
    container.classList.toggle("leaflet-gameboy-off", !this.isEnabled());
    const mapClasses = this._map.getContainer().classList;
    mapClasses.toggle("leaflet-gameboy", this.options.skin !== false);
    mapClasses.toggle("leaflet-gameboy-dark", dark);
  };
}

export const gameboyTileLayer = (
  urlTemplate: string,
  options?: GameboyTileLayerOptions
) => new GameboyTileLayer(urlTemplate, options);
