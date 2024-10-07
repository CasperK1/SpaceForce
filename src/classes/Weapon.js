class Weapon {
  constructor({ x, y }) {
    this.image = new Image();
    this.image.src = "assets/images/laser-rifle.png";
    this.height = 70;
    this.width = 75;
    this.angle = 0;
    this.rotationPointY = this.height / 2;
  }

  updateAngle(playerX, playerY, mouseX, mouseY) {
    this.angle = Math.atan2(
      mouseY - playerY
      ,
      mouseX - playerX
    );
  }

  draw(playerX, playerY) {
    const screenX = (playerX - camera.x) * zoomFactor;
    const screenY = (playerY - camera.y) * zoomFactor;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.angle);
    ctx.drawImage(this.image, 0, -this.rotationPointY, this.width, this.height);
    ctx.restore();
  }
}