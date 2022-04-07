"use strict";
import { Utils } from "./components/utils.js";
import Tile from "./components/Tiles.js";
import { imageAreReady, loadAllImages, mapLevel } from "./components/Images.js";

const gameName = "MaxPotatoeGame";

loadAllImages();

const utils = new Utils();

const plantAudio = new Audio("./sound/plant.wav");

const boomSFXImg = utils.requestImage({ source: "./img/BoomSFX.png" });
const deathImg = utils.requestImage({ source: "./img/DeathSFX.png" });
const nextLevelAnim = utils.requestImage({ source: "./img/MaxNext.png" });

let characterImg = utils.requestImage({ source: "./img/Poo.png" });
let maxBombImg = utils.requestImage({ source: "./img/MaxBomb2.png" });
let milkImg = utils.requestImage({ source: "./img/BombPowerup.png" });

let floorImg, rockImg, wallImg, exitImg;

const menu = document.querySelector(".menu");

const level = document.querySelector(".level");
const score = document.querySelector(".score");
const highscore = document.querySelector(".highscore");
let title = document.querySelector(".title");
let desc = document.querySelector(".desc");
let playerScoreDesc = document.querySelector(".playerscore");

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
canvas.width = 1000;
canvas.height = 1000;

let grid = 9;

let tileSize = 50;

let safeZone = [];
let floorArray = [];
let tilesArray = [];
let bombsArray = [];
let powerupArray = [];
let rockArrayIndex = [];

let activeBomb = 0;

let player;

let currentLevelCount = 0;
let playerMapLevel = 0;

let playerLevel = 0;
let playerScore = 0;
let playerHighScore = 0;

let enemyBombSpawn = 0;

function initMap() {
  const map = mapLevel.find((map) => map.level === playerMapLevel);

  floorImg = map.floor;
  rockImg = map.rock;
  wallImg = map.wall;
  exitImg = map.exit;

  safeZone = [];
  floorArray = [];
  tilesArray = [];
  bombsArray = [];
  powerupArray = [];
  rockArrayIndex = [];
  activeBomb = 0;

  tileSize = Math.floor(canvas.width / grid);
  canvas.width = tileSize * grid;
  canvas.height = tileSize * grid;

  safeZone.push({ x: tileSize, y: tileSize });
  safeZone.push({ x: tileSize * 2, y: tileSize });
  safeZone.push({ x: tileSize, y: tileSize * 2 });

  player.tileSize = tileSize;
  player.position.x = tileSize;
  player.position.y = tileSize;
  player.image = characterImg;
  player.maxFrame = 2;
  player.framePosition = 0;
  player.frameStagger = 20;
  player.bombLimit = 1;

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
          if (Math.random() > 0.25 || isInSafeZone(posX, posY)) {
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

  // tilesArray[rockArrayIndex[0]].exit = true; // For testing purposes only
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

function isInSafeZone(posX, posY) {
  for (let i = 0; i < safeZone.length; i++) {
    const tempX = safeZone[i].x;
    const tempY = safeZone[i].y;

    if (posX === tempX && posY === tempY) {
      return true;
    }
  }
  return false;
}

window.addEventListener("keydown", (event) => {
  if (!player.isPlaying) {
    if (event.key === "Enter") {
      player.isPlaying = true;
      menu.style.opacity = "0";

      if (player.remove) {
        player.remove = false;
        initMap();
      }
    }
    return;
  }

  switch (event.key) {
    case "w":
      player.move("up", [...powerupArray, ...tilesArray]);
      break;
    case "a":
      player.move("left", [...powerupArray, ...tilesArray]);
      break;
    case "s":
      player.move("down", [...powerupArray, ...tilesArray]);
      break;
    case "d":
      player.move("right", [...powerupArray, ...tilesArray]);
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
      plantAudio.play();
      break;
  }
});

function animate() {
  requestAnimationFrame(animate);

  level.textContent = `Level: ${playerLevel + 1}`;
  score.textContent = `Score: ${playerScore}`;
  highscore.textContent = `Highscore: ${playerHighScore}`;

  c.clearRect(0, 0, canvas.width, canvas.height);

  [...floorArray, ...tilesArray, ...bombsArray, ...powerupArray].forEach(
    (obs) => {
      obs.update();
    }
  );

  bombsArray.forEach((bomb) => {
    bomb.tick(player);

    if (bomb.remove) {
      if (!bomb.bombEnemy) {
        activeBomb--;
      } else {
        enemyBombSpawn--;
      }
      const walls = bomb.getRemoveWalls();
      walls.forEach((wall) => {
        [...tilesArray, ...powerupArray].forEach((tile) => {
          if (wall.posX === tile.position.x && wall.posY === tile.position.y) {
            if (tile.floor) {
              tile.passable = true;
            }
            if (bomb.bombEnemy) return;
            if (tile.exit) {
              tilesArray.push(
                new Tile({
                  x: wall.posX,
                  y: wall.posY,
                  tileSize: tileSize,
                  canvas: canvas,
                  image: exitImg,
                  maxFrame: 1,
                  frameWidth: tileSize,
                  frameHeigth: tileSize,
                  framePosition: 0,
                  passable: true,
                  breakable: false,
                  powerup: false,
                  exit: true,
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
                  frameStagger: 20,
                })
              );
            } else if (
              Math.random() < 0.25 &&
              !tile.passable &&
              tile.breakable
            ) {
              const bomb = new Tile({
                x: wall.posX,
                y: wall.posY,
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
                bombDelay: 1,
                breakable: true,
              });
              bombsArray.push(bomb);
              activeBomb++;
            }
            if (tile.breakable) {
              const addScore = Math.ceil(Math.random() * 5 + 1);
              playerScore += addScore;
              saveHighScore(playerScore);
              tile.passable = true;
              tile.visible = false;
              tile.breakable = false;
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
    spawnBombEnemy();
    if (player.remove) {
      player.image = deathImg;
      player.maxFrame = 6;

      title.textContent = "Game Over!!";
      desc.textContent = "Press ENTER to restart";
      playerScoreDesc.textContent = `Your total score: ${playerScore}`;

      menu.style.opacity = "1";
    }
    if (player.nextLevel) {
      player.image = nextLevelAnim;
      player.maxFrame = 15;
      player.frameStagger = 5;
    }
    if (player.moveNext) {
      player.moveNext = false;
      playerLevel++;
      if (currentLevelCount >= 4) {
        currentLevelCount = 0;
        if (grid < 20) {
          grid += 2;
        }
        if (playerMapLevel < mapLevel.length - 1) {
          playerMapLevel++;
        } else {
          playerMapLevel = 0;
        }
      } else {
        currentLevelCount++;
      }
      initMap();
    }
  }
}

let intervalID = setInterval(() => {
  if (
    boomSFXImg.complete &&
    characterImg.complete &&
    maxBombImg.complete &&
    deathImg.complete &&
    milkImg.complete &&
    imageAreReady
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
    restoreHighscore();
    initMap();
    animate();
    clearInterval(intervalID);
  }
});

function saveHighScore(score) {
  if (score > playerHighScore) {
    playerHighScore = score;
    window.localStorage.setItem(gameName, playerHighScore);
  }
}

function restoreHighscore() {
  if (window.localStorage.getItem(gameName) !== null) {
    playerHighScore = localStorage.getItem(gameName);
  } else {
    playerHighScore = 0;
  }
}

let lastTimeItSpawn = 0;
function spawnBombEnemy() {
  if (!player.isPlaying) return;
  if (Date.now() < lastTimeItSpawn) return;
  lastTimeItSpawn = Date.now() + 5000;

  for (let i = 0; i < tilesArray.length; i++) {
    const tile = tilesArray[i];

    if (!tile.floor) continue;
    if (Math.random() > 0.1) continue;
    if (enemyBombSpawn > playerLevel) continue;

    tile.passable = false;

    enemyBombSpawn++;
    bombsArray.push(
      new Tile({
        x: tile.position.x,
        y: tile.position.y,
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
        bombDelay: 3,
        breakable: true,
        bombEnemy: true,
        bombRadius: 1,
      })
    );

    return;
  }
}
