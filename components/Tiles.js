export default class Tiles {
  constructor({
    canvas,
    x = 0,
    y = 0,
    tileSize = 100,
    passable = false,
    exit = false,
    image = undefined,
    maxFrame = 0,
    framePosition = 0,
    bomb = false,
    bombImage = undefined,
    bombDelay = 3,
    bombMaxFrame = 0,
    bombRadius = 1,
    breakable = false,
    powerup = false,
    floor = false,
    frameStagger = 10,
  }) {
    this.canvas = canvas;
    this.c = canvas ? this.canvas.getContext("2d") : undefined;
    this.position = {
      x,
      y,
    };
    this.tileSize = tileSize;
    this.breakable = breakable;
    this.powerup = powerup;
    this.exit = exit;
    this.floor = floor;

    this.passable = passable;
    this.image = image;
    this.remove = false;

    this.framePosition = framePosition;
    this.maxFrame = maxFrame;
    this.frameWidth =
      (this.image ? this.image.width : this.tileSize) / this.maxFrame;
    this.frameHeigth = this.image ? this.image.height : this.tileSize;

    this.currentFrame = 0;
    this.elapseFrame = 0;
    this.frameStagger = frameStagger;

    this.visible = true;
    this.bomb = bomb;
    this.bombImage = bombImage;
    this.bombMaxFrame = bombMaxFrame;
    this.bombFrameWidth = 224 / this.bombMaxFrame;
    this.bombDelay = bombDelay;
    this.explosionTime = Date.now() + bombDelay * 1000;

    this.bombCurrentFrame = 0;
    this.bombElapseTime = 0;
    this.bombFrameStagger = 10;
    this.bombRadius = bombRadius;
    this.bombLimit = 1;
  }

  getRemoveWalls() {
    const walls = [];
    for (
      let posX = this.position.x - this.tileSize * this.bombRadius;
      posX <= this.position.x + this.tileSize * this.bombRadius;
      posX += this.tileSize
    ) {
      for (
        let posY = this.position.y - this.tileSize * this.bombRadius;
        posY <= this.position.y + this.tileSize * this.bombRadius;
        posY += this.tileSize
      ) {
        if (posX === this.position.x || posY === this.position.y) {
          walls.push({ posX: posX, posY: posY });
        }
      }
    }
    return walls;
  }

  tick(player) {
    if (!this.bomb) return;
    if (this.remove) return;
    const now = Date.now();

    if (now > this.explosionTime) {
      this.visible = false;

      this.getRemoveWalls().forEach((wall) => {
        if (
          wall.posX === player.position.x &&
          wall.posY === player.position.y
        ) {
          player.remove = true;
        }
        this.c.drawImage(
          this.bombImage,
          this.bombCurrentFrame * this.bombFrameWidth,
          0,
          this.bombFrameWidth,
          this.bombImage.height,
          wall.posX,
          wall.posY,
          this.tileSize,
          this.tileSize
        );
      });

      this.bombElapseTime++;
      if (this.bombElapseTime % this.bombFrameStagger === 0) {
        this.bombElapseTime = 0;
        this.bombCurrentFrame++;
      }
      if (this.bombCurrentFrame >= this.bombMaxFrame) {
        this.remove = true;
      }
    }
  }

  draw() {
    if (!this.visible) return;

    if (this.image) {
      this.c.drawImage(
        this.image,
        this.currentFrame * this.frameWidth,
        this.framePosition,
        this.frameWidth,
        this.frameHeigth,
        this.position.x,
        this.position.y,
        this.tileSize,
        this.tileSize
      );

      this.elapseFrame++;
      if (this.elapseFrame % this.frameStagger === 0) {
        this.elapseFrame = 0;
        this.currentFrame++;
      }
      if (this.currentFrame >= this.maxFrame) {
        if (!this.remove) this.currentFrame = 0;
      }
    } else {
      if (this.c) {
        this.c.fillStyle = "pink";
        this.c.fillRect(
          this.position.x,
          this.position.y,
          this.tileSize,
          this.tileSize
        );
      }
    }
  }

  move(direction, obstacle) {
    if (this.remove) return;
    for (let i = 0; i < obstacle.length; i++) {
      const obs = obstacle[i];

      switch (direction) {
        case "up":
          if (
            this.position.x === obs.position.x &&
            this.position.y - this.tileSize === obs.position.y &&
            obs.passable
          ) {
            if (obs.powerup) {
              this.bombLimit++;
              obs.remove = true;
            }
            this.position.y -= this.tileSize;
            return obs.powerup ? i : false;
          }
          break;
        case "down":
          if (
            this.position.x === obs.position.x &&
            this.position.y + this.tileSize === obs.position.y &&
            obs.passable
          ) {
            if (obs.powerup) {
              this.bombLimit++;
              obs.remove = true;
            }
            this.position.y += this.tileSize;
            return obs.powerup ? i : false;
          }
          break;
        case "left":
          if (
            this.position.x - this.tileSize === obs.position.x &&
            this.position.y === obs.position.y &&
            obs.passable
          ) {
            if (obs.powerup) {
              this.bombLimit++;
              obs.remove = true;
            }
            this.position.x -= this.tileSize;
            return obs.powerup ? i : false;
          }
          break;
        case "right":
          if (
            this.position.x + this.tileSize === obs.position.x &&
            this.position.y === obs.position.y &&
            obs.passable
          ) {
            if (obs.powerup) {
              this.bombLimit++;
              obs.remove = true;
            }
            this.position.x += this.tileSize;
            return obs.powerup ? i : false;
          }
          break;
      }
    }
  }

  update() {
    this.draw();
  }
}
