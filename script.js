"use strict";
import { Utils } from "./components/utils.js";
import Tile from "./components/Tiles.js";

const utils = new Utils();
const boomSFXImg = utils.requestImage({ source: "./img/BoomSFX.png" });
const characterImg = utils.requestImage({ source: "./img/Poo.png" });
const floorImg = utils.requestImage({ source: "./img/Floor.png" });
const maxBombImg = utils.requestImage({ source: "./img/MaxBomb.png" });
const rockImg = utils.requestImage({ source: "./img/Rock.png" });
const wallImg = utils.requestImage({ source: "./img/Wall.png" });
const flushImg = utils.requestImage({ source: "./img/Flush.png" });
const toiletImg = utils.requestImage({ source: "./img/Toilet.png" });
const milkImg = utils.requestImage({ source: "./img/Milk.png" });

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 1000;

const grid = 11;

let tileSize = 50;

const floorArray = [];
let tilesArray = [];
let bombsArray = [];
let powerupArray = [];
let rockArrayIndex = [];

let activeBomb = 0;

export const player = new Tile({
  canvas: canvas,
  image: characterImg,
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

  let count = 0;

  for (let posX = 0; posX <= canvas.width - tileSize; posX += tileSize) {
    for (let posY = 0; posY <= canvas.width - tileSize; posY += tileSize) {
      floorArray.push(
        new Tile({
          x: posX,
          y: posY,
          canvas: canvas,
          tileSize: tileSize,
          image: floorImg,
          maxFrame: 1,
          frameWidth: tileSize,
          frameHeigth: tileSize,
          framePosition: 0,
          passable: true,
          breakable: false,
        })
      );

      count++;

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
            image: wallImg,
            maxFrame: 1,
            frameWidth: tileSize,
            frameHeigth: tileSize,
            framePosition: 0,
            passable: false,
            breakable: false,
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
              image: wallImg,
              maxFrame: 1,
              frameWidth: tileSize,
              frameHeigth: tileSize,
              framePosition: 0,
              passable: false,
              breakable: false,
            })
          );
        } else {
          if (Math.random() > 0.25) {
            tilesArray.push(
              new Tile({
                x: posX,
                y: posY,
                passable: true,
                breakable: false,
                floor: true,
              })
            );
          } else {
            rockArrayIndex.push(count);
            tilesArray.push(
              new Tile({
                x: posX,
                y: posY,
                canvas: canvas,
                tileSize: tileSize,
                image: rockImg,
                maxFrame: 1,
                frameWidth: tileSize,
                frameHeigth: tileSize,
                framePosition: 0,
                passable: false,
                breakable: true,
                exit: false,
                powerup: true,
              })
            );
          }
        }
      }
      countY++;
    }
    countX++;
  }
  const randomIndex = Math.floor(Math.random() * rockArrayIndex.length - 1);
  console.log(randomIndex);

  tilesArray[rockArrayIndex[randomIndex]].exit = true;
  console.log(tilesArray[rockArrayIndex[randomIndex]]);
}
initMap();

window.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "w":
      const powerUpW = player.move("up", [...powerupArray, ...tilesArray]);
      break;
    case "a":
      const powerUpA = player.move("left", [...powerupArray, ...tilesArray]);
      break;
    case "s":
      const powerUpS = player.move("down", [...powerupArray, ...tilesArray]);
      break;
    case "d":
      const powerUpD = player.move("right", [...powerupArray, ...tilesArray]);
      break;
    case " ":
      if (activeBomb >= player.bombLimit) return;
      activeBomb++;
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
        image: maxBombImg,
        passable: false,
        maxFrame: 3,
        frameWidth: tileSize,
        frameHeigth: tileSize,
        framePosition: 0,
        bombImage: boomSFXImg,
        bomb: true,
        bombMaxFrame: 7,
        breakable: true,
      });
      bombsArray.push(bomb);
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);

  c.clearRect(0, 0, canvas.width, canvas.height);

  [...floorArray, ...tilesArray, ...bombsArray, ...powerupArray].forEach(
    (obs) => {
      obs.update();
    }
  );

  bombsArray.forEach((bomb) => {
    bomb.tick();

    if (bomb.remove) {
      activeBomb--;
      const walls = bomb.getRemoveWalls();
      walls.forEach((wall) => {
        [...tilesArray, ...powerupArray].forEach((tile) => {
          if (wall.posX === tile.position.x && wall.posY === tile.position.y) {
            if (tile.floor) {
              tile.passable = true;
            }
            if (tile.exit) {
              tilesArray.push(
                new Tile({
                  x: wall.posX,
                  y: wall.posY,
                  tileSize: tileSize,
                  canvas: canvas,
                  image: toiletImg,
                  maxFrame: 1,
                  frameWidth: tileSize,
                  frameHeigth: tileSize,
                  framePosition: 0,
                  passable: true,
                  breakable: false,
                  powerup: false,
                })
              );
            } else if (tile.powerup && !tile.passable) {
              tile.powerup = false;
              powerupArray.push(
                new Tile({
                  x: wall.posX,
                  y: wall.posY,
                  tileSize: tileSize,
                  canvas: canvas,
                  image: milkImg,
                  maxFrame: 2,
                  frameWidth: tileSize,
                  frameHeigth: tileSize,
                  framePosition: 0,
                  passable: true,
                  breakable: true,
                  powerup: true,
                })
              );
            }
            if (tile.breakable) {
              tile.passable = true;
              tile.visible = false;
              if (tile.powerup) tile.powerup = false;
            }
          }
        });
      });
    }
  });

  bombsArray = bombsArray.filter((bomb) => bomb.remove === false);
  tilesArray = tilesArray.filter((tile) => tile.remove === false);
  powerupArray = powerupArray.filter((powerup) => powerup.remove === false);

  if (player) player.update();
}

animate();
