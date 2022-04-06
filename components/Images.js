"use strict";
import { Utils } from "./utils.js";

const utils = new Utils();
const mapLevel = [];
let checker = [];

let imageAreReady = false;

function loadAllImages() {
  for (let i = 0; i < 8; i++) {
    mapLevel.push(new Map({ level: i }));
  }

  const id = setInterval(() => {
    checker = mapLevel.filter((map) => !map.loaded());
    if (checker.length === 0) {
      clearInterval(id);
      imageAreReady = true;
    }
  }, 1);
}

class Map {
  constructor({ level }) {
    this.level = level;
    this.exit = utils.requestImage({
      source: `./img/levels/Exit-${this.level}.png`,
    });
    this.floor = utils.requestImage({
      source: `./img/levels/Floor-${this.level}.png`,
    });
    this.rock = utils.requestImage({
      source: `./img/levels/Rock-${this.level}.png`,
    });
    this.wall = utils.requestImage({
      source: `./img/levels/Wall-${this.level}.png`,
    });
  }

  loaded() {
    return (
      this.exit.complete &&
      this.floor.complete &&
      this.wall.complete &&
      this.rock.complete
    );
  }
}

export { imageAreReady, loadAllImages, mapLevel };
