"use strict";
import { Utils } from "./components/utils.js";
import Tile from "./components/Tiles.js";

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 1000;

const grid = 11;

export const utils = new Utils();
let tileSize = 50;

const tilesArray = [];
let bombsArray = [];

export const player = new Tile({
  canvas: canvas,
  image: utils.requestImage({ source: "./img/Poo.png" }),
  x: tileSize,
  y: tileSize,
  tileSize: tileSize,
  maxFrame: 2,
  frameWidth: tileSize,
  frameHeigth: tileSize,
  framePosition: 0,
});

function initMap() {
  tileSize = Math.floor(canvas.width / grid);
  canvas.width = tileSize * grid;
  canvas.height = tileSize * grid;

  player.tileSize = tileSize;
  player.position.x = tileSize;
  player.position.y = tileSize;

  let countX = 2;
  let countY = 2;
  for (let posX = 0; posX <= canvas.width - tileSize; posX += tileSize) {
    for (let posY = 0; posY <= canvas.width - tileSize; posY += tileSize) {
      if (
        posX === 0 ||
        posY === 0 ||
        posX === canvas.width - tileSize ||
        posY === canvas.height - tileSize
      ) {
        tilesArray.push(
          new Tile({
            x: posX,
            y: posY,
            canvas: canvas,
            tileSize: tileSize,
            image: utils.requestImage({ source: "./img/Wall.png" }),
            maxFrame: 1,
            frameWidth: tileSize,
            frameHeigth: tileSize,
            framePosition: 0,
            passable: false,
          })
        );
      } else {
        if (countX % 2 === 0 && countY % 2 === 0) {
          tilesArray.push(
            new Tile({
              x: posX,
              y: posY,
              canvas: canvas,
              tileSize: tileSize,
              image: utils.requestImage({ source: "./img/Wall.png" }),
              maxFrame: 1,
              frameWidth: tileSize,
              frameHeigth: tileSize,
              framePosition: 0,
              passable: false,
            })
          );
        } else {
          tilesArray.push(
            new Tile({
              x: posX,
              y: posY,
              canvas: canvas,
              tileSize: tileSize,
              image: utils.requestImage({ source: "./img/Floor.png" }),
              maxFrame: 1,
              frameWidth: tileSize,
              frameHeigth: tileSize,
              framePosition: 0,
              passable: true,
            })
          );
        }
      }
      countY++;
    }
    countX++;
  }
}
initMap();

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
      player.move("up", tilesArray);
      break;
    case "a":
      player.move("left", tilesArray);
      break;
    case "s":
      player.move("down", tilesArray);
      break;
    case "d":
      player.move("right", tilesArray);
      break;
    case " ":
      tilesArray.forEach((tile) => {
        if (
          player.position.x === tile.position.x &&
          player.position.y === tile.position.y
        ) {
          tile.passable = false;
        }
      });
      const bomb = new Tile({
        x: player.position.x,
        y: player.position.y,
        tileSize: tileSize,
        canvas: canvas,
        image: utils.requestImage({ source: "./img/MaxBomb.png" }),
        passable: false,
        maxFrame: 3,
        frameWidth: tileSize,
        frameHeigth: tileSize,
        framePosition: 0,
      });
      bombsArray.push(bomb);
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);

  c.clearRect(0, 0, canvas.width, canvas.height);
  [...tilesArray, ...bombsArray].forEach((obs) => {
    obs.update();
  });

  bombsArray = bombsArray.sort((bomb) => (bomb.remove = false));

  if (player) player.update();
}

animate();
