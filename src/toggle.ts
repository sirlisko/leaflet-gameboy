import { Control, DomEvent, DomUtil, type ControlOptions } from "leaflet";
import type { GameboyTileLayer } from "./tile-layer.js";

export interface GameboyToggleOptions extends ControlOptions {
  layer: GameboyTileLayer;
  title?: string;
}

/** A button that switches the layer between the palette and its original colours. */
export class GameboyToggle extends Control {
  declare options: GameboyToggleOptions;

  constructor(options: GameboyToggleOptions) {
    super({ position: "topright", title: "Show original colours", ...options });
  }

  onAdd() {
    const { layer, title = "" } = this.options;
    const bar = DomUtil.create("div", "leaflet-bar");
    const button = DomUtil.create("button", "leaflet-gameboy-toggle", bar);
    button.type = "button";
    button.title = title;
    button.setAttribute("aria-label", title);
    button.setAttribute("aria-pressed", String(!layer.isEnabled()));
    DomEvent.disableClickPropagation(bar);
    DomEvent.on(button, "click", () => {
      layer.setEnabled(!layer.isEnabled());
      button.setAttribute("aria-pressed", String(!layer.isEnabled()));
    });
    return bar;
  }
}

export const gameboyToggle = (options: GameboyToggleOptions) =>
  new GameboyToggle(options);
