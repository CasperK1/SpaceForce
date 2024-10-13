class JetpackEffect {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.particles = [];
  }

  createFlameParticle(velocityX, velocityY) {
    const colors = ["#ff001e", "#ffa600", "#ff5a1e", "#edad64"];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 4 + 1;
    const speedX = Math.random() - 0.5 - velocityX * 0.5;
    const speedY = Math.random() * 4 - velocityY * 0.5;
    const life = Math.random() * 30;
    this.particles.push(
      new Particle(this.x, this.y, color, size, speedX, speedY, life),
    );
  }

  createSmokeParticle(velocityX, velocityY) {
    const color = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
    const size = Math.random() * 3 + 2;
    const speedX = (Math.random() - 0.5) * 0.5 - velocityX * 0.3;
    const speedY = Math.random() + 1 - velocityY * 0.5;
    const life = Math.random() * 50 + 30;
    this.particles.push(
      new Particle(this.x, this.y, color, size, speedX, speedY, life),
    );
  }

  createFlame(velocityX, velocityY) {
    const flameHeight = 50;
    const flameWidth = 1;
    const numParticles = 10;
    const colors = ["#ff001e", "#ffa600", "#ff5a1e", "#edad64"];
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Flame bending effect to match player movement
    const bendFactorX = -velocityX * 7;
    const bendFactorY = -velocityY * 3;

    for (let i = 0; i < numParticles; i++) {
      const progress = i / numParticles;
      const offsetX = (Math.random() - 0.5) * flameWidth;
      const offsetY = progress * flameHeight;
      const size = (1 - progress) * 4;

      // Apply bending effect
      const bendX = bendFactorX * progress;
      const bendY = bendFactorY * progress * 4;

      ctx.save();
      ctx.shadowColor = color;
      ctx.shadowBlur = 80;
      ctx.beginPath();
      ctx.arc(
        this.x + offsetX + bendX,
        this.y + offsetY + bendY,
        size,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }


  draw(playerX, playerY, velocityX, velocityY, direction) {
    const screenX = (playerX - camera.x) * zoomFactor;
    const screenY = (playerY - camera.y) * zoomFactor;
    this.x = screenX + (direction === "right" ? -20 : 10);
    this.y = screenY + 13;

    this.particles.forEach((particle) => particle.draw());
    this.particles = this.particles.filter((particle) => particle.life > 0);

    this.createFlameParticle(velocityX, velocityY);
    this.createSmokeParticle(velocityX, velocityY);
    this.createFlame(velocityX, velocityY);
  }
}