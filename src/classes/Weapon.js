class Weapon {
  constructor(x, y) {
    this.height = 15;
    this.width = 40;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.rotationPointY = this.height / 2;
  }


  updateAngle(mouseX, mouseY) {
  this.angle = Math.atan2(mouseY - (this.y + this.rotationPointY), mouseX - this.x);
}

draw() {
  ctx.save();
  ctx.translate(this.x, this.y + this.rotationPointY);
  ctx.rotate(this.angle);
  ctx.fillStyle = "yellow";
  ctx.fillRect(0, -this.rotationPointY, this.width, this.height);
  ctx.restore();
}

  update(x ,y) {
        this.x = x
        this.y = y
        this.draw()
    }
}