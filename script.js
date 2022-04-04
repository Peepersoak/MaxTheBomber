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
const deathImg = utils.requestImage({ source: "./img/DeathSFX.png" });
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

let player;

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

      if (
        posX === 0 ||
        posY === 0 ||
        posX === canvas.width - tileSize ||
        posY === canvas.height - tileSize
      ) {
        // Outline Wall
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
        // Inner Wall
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
        }
        // Rocks and Floors
        else {
          // Floor
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
          }

          // rocks
          else {
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
                powerup: Math.random() < 0.15 ? true : false,
              })
            );
          }
        }
      }
      countY++;
      count++;
    }
    countX++;
  }

  let hasExit = false;
  let increments = 1 / rockArrayIndex.length;
  let percentage = increments;
  for (let i = 0; i < rockArrayIndex.length; i++) {
    percentage += increments;
    if (Math.random() < percentage && !hasExit) {
      hasExit = true;
      tilesArray[rockArrayIndex[i]].exit = true;
    }
  }
}

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
    bomb.tick(player);

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

  if (player) {
    player.update();
    if (player.remove) {
      player.image = deathImg;
      player.maxFrame = 6;
    }
  }
}

let intervalID = setInterval(() => {
  if (
    boomSFXImg.complete &&
    characterImg.complete &&
    floorImg.complete &&
    maxBombImg.complete &&
    rockImg.complete &&
    wallImg.complete &&
    deathImg.complete &&
    toiletImg.complete &&
    milkImg.complete
  ) {
    player = new Tile({
      canvas: canvas,
      image: characterImg,
      x: tileSize,
      y: tileSize,
      tileSize: tileSize,
      maxFrame: 2,
      frameWidth: tileSize,
      frameHeigth: tileSize,
      framePosition: 0,
      frameStagger: 20,
    });
    initMap();
    animate();
    clearInterval(intervalID);
  }
});
