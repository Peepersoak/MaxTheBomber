export default class Tiles {
  constructor({
    canvas,
    x = 0,
    y = 0,
    tileSize,
    passable = false,
    exit = false,
    image,
    maxFrame,
    framePosition = 0,
  }) {
    this.canvas = canvas;
    this.c = this.canvas.getContext("2d");
    this.position = {
      x,
      y,
    };
    this.tileSize = tileSize;

    this.passable = passable;
    this.exit = exit;
    this.image = image;
    this.remove = false;

    this.framePosition = framePosition;
    this.maxFrame = maxFrame;
    this.frameWidth = this.image.width / maxFrame;
    this.frameHeigth = this.image.height;

    this.currentFrame = 0;
    this.elapseFrame = 0;
    this.frameStagger = 10;
  }

  draw() {
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
      if (this.currentFrame >= this.maxFrame) this.currentFrame = 0;
    } else {
      this.c.fillStyle = "pink";
      this.c.fillRect(
        this.position.x,
        this.position.y,
        this.tileSize,
        this.tileSize
      );
    }
  }

  move(direction, obstacle) {
    for (let i = 0; i < obstacle.length; i++) {
      const obs = obstacle[i];

      switch (direction) {
        case "up":
          if (
            this.position.x === obs.position.x &&
            this.position.y - this.tileSize === obs.position.y &&
            obs.passable
          ) {
            this.position.y -= this.tileSize;
            return;
          }
          break;
        case "down":
          if (
            this.position.x === obs.position.x &&
            this.position.y + this.tileSize === obs.position.y &&
            obs.passable
          ) {
            this.position.y += this.tileSize;
            return;
          }
          break;
        case "left":
          if (
            this.position.x - this.tileSize === obs.position.x &&
            this.position.y === obs.position.y &&
            obs.passable
          ) {
            this.position.x -= this.tileSize;
            return;
          }
          break;
        case "right":
          if (
            this.position.x + this.tileSize === obs.position.x &&
            this.position.y === obs.position.y &&
            obs.passable
          ) {
            this.position.x += this.tileSize;
            return;
          }
          break;
      }
    }
  }

  update() {
    this.draw();
  }
}
