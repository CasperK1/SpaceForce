class Player {
  constructor({ x, y, color, userName }) {
    this.userName = userName;
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.color = color;
    this.score = 0;
    this.weapon = new Weapon({});
  }

  draw() {
    const screenX = (this.x - camera.x) * zoomFactor;
    const screenY = (this.y - camera.y) * zoomFactor;

    // Username
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    const textWidth = ctx.measureText(this.userName).width;
    ctx.fillText(this.userName, screenX - textWidth / 2, screenY - 35);

    // Draw player
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * zoomFactor, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();

    this.weapon.draw(this.x, this.y);
  }
}