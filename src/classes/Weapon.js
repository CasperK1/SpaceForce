class Weapon {
  constructor() {
    this.image = new Image();
    this.image.src = "assets/images/laser-rifle-right.png";
    this.height = 70;
    this.width = 75;
    this.angle = 0;
    this.rotationPointY = this.height / 2;
  }

  updateAngle(playerX, playerY, mouseX, mouseY) {
    this.angle = Math.atan2(mouseY - playerY, mouseX - playerX);
    if (Math.abs((this.angle * 180) / Math.PI) > 90) {
      this.image.src = "assets/images/laser-rifle-left.png";
    } else {
      this.image.src = "assets/images/laser-rifle-right.png";
    }
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
