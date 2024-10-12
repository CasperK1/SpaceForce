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

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.speedY += 0.05; // gravity
    this.life--;
    this.opacity = Math.max(0, this.life / 30);
  }

  draw() {
    ctx.globalAlpha = this.opacity;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

class JetpackEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
  }

  createFlameParticle() {
    const colors = ["#007FFF", "#00BFFF", "#1E90FF", "#6495ED"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 3 + 1;
    const speedX = Math.random() - 0.5;
    const speedY = Math.random() * 2 + 2;
    const life = Math.random() * 15 + 5;
    this.particles.push(
      new Particle(this.x, this.y, color, size, speedX, speedY, life),
    );
  }

  createSmokeParticle() {
    const color = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
    const size = Math.random() * 4 + 2;
    const speedX = (Math.random() - 0.5) * 0.5;
    const speedY = Math.random() + 1;
    const life = Math.random() * 50 + 30;
    const offsetX = (Math.random() - 0.5) * 10;
    this.particles.push(
      new Particle(this.x + offsetX, this.y, color, size, speedX, speedY, life),
    );
  }

  drawSolidFlame() {
    const flameHeight = 20;
    const flameWidth = 10;

    ctx.beginPath();
    ctx.moveTo(this.x - flameWidth / 2, this.y);
    ctx.lineTo(this.x, this.y + flameHeight);
    ctx.lineTo(this.x + flameWidth / 2, this.y);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x,
      this.y + flameHeight,
    );
    gradient.addColorStop(0, "#00BFFF");
    gradient.addColorStop(1, "#007FFF");

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  draw(playerX, playerY) {
    const screenX = (playerX - camera.x) * zoomFactor;
    const screenY = (playerY - camera.y) * zoomFactor;
    this.x = screenX;
    this.y = screenY;
    this.createFlameParticle();
    for (let i = 0; i < 3; i++) {
      this.createSmokeParticle();
    }
    this.particles.forEach((particle) => particle.update());
    this.particles.forEach((particle) => particle.draw());
    this.particles = this.particles.filter((particle) => particle.life > 0);
    this.drawSolidFlame();
  }
}
