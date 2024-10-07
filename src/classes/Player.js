class Player {
  constructor({ x, y, color, userName }) {
    this.userName = userName;
    this.playerImage = new Image();
    this.playerImage.src = "assets/images/spaceman.png";
    this.x = x;
    this.y = y;
    this.radius = 7;
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
    ctx.shadowBlur = 80;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * zoomFactor, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();
    ctx.drawImage(this.playerImage, screenX - 80, screenY -100 , 150, 150);
    this.weapon.draw(this.x, this.y);
  }
}