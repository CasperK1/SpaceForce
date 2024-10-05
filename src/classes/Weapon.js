class Weapon {
  constructor({ x, y }) {
    this.height = 15;
    this.width = 40;
    this.angle = 0;
    this.rotationPointY = this.height / 2;
  }

  updateAngle(playerX, playerY, mouseX, mouseY) {
    this.angle = Math.atan2(
      mouseY - playerY,
      mouseX - playerX
    );
  }

  draw(playerX, playerY) {
    const screenX = (playerX - camera.x) * zoomFactor;
    const screenY = (playerY - camera.y) * zoomFactor;

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.angle);
    ctx.fillStyle = "yellow";
    ctx.fillRect(0, -this.rotationPointY, this.width, this.height);
    ctx.restore();
  }
}