"use strict";

const map = [];

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 1000;

const tileSize = 100;

function init() {
  for (let x = 0; x < 10; x++) {
    for (let y = 0; y < 10; y++) {}
  }
}

class Tiles {
  constructor({ x, y, passable, exit, imageArray }) {
    this.position = {
      x: 100,
      y: 100,
    };
    this.width = tileSize;
    this.height = tileSize;
    this.passable = passable;
    this.exit = exit;
    this.frames = imageArray;
  }

  draw() {
    if (this.frames) {
      c.drawImage(this.frames, this.position.x, this.position.y);
    } else {
      c.fillStyle = "red";
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }
}

function image(src) {
  const image = new Image();
  image.src = src;
  return image;
}
