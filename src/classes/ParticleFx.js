class Particle {
  constructor(x, y, color, size, speedX, speedY, life) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.size = size;
    this.speedX = speedX;
    this.speedY = speedY;
    this.life = life;
    this.opacity = 1;
  }

  draw() {
    //update
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.02; // gravity
    this.life--;
    this.opacity = Math.max(0, this.life / 30);
    //draw
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}
