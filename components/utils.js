export class Utils {
  requestImage({ source }) {
    const image = new Image();
    image.src = source;
    return image;
  }

  isCollidingRect({ sx, sy, sw, sh, ox, oy, ow, oh }) {
    return sx < ox + ow && sx + sw > ox && sy < oy + oh && sy + sh > oh;
  }

  getCenterCoords({ x, y, width, height }) {
    let posX = x - width / 2;
    let posY = y - height / 2;
    return { posX, posY };
  }
}
