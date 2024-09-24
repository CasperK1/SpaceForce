class Player {
  constructor({x, y, radius, color, userName}) {
    this.userName = userName;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.score = 0;
  }

  draw() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    const textWidth = ctx.measureText(this.userName).width; // Width of the text to center it
    ctx.fillText(this.userName, this.x - textWidth / 2, this.y - 35);
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
  }
}
