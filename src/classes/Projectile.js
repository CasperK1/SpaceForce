class Projectile {
  constructor({x, y, radius, color = "white", velocity}) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.trail = []; // Store previous positions for trail effect
    this.maxTrailLength = 18; // Limit the length of the trail
  }

  draw() {
    // Draw the trail
    for (let i = 0; i < this.trail.length; i++) {
      const radius = this.radius * (i / this.trail.length) * 0.5;
      const screenX = (this.trail[i].x - camera.x) * zoomFactor;
      const screenY = (this.trail[i].y - camera.y) * zoomFactor;
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(screenX, screenY, radius * zoomFactor, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.restore();
    }

    // Draw the current projectile
    const screenX = (this.x - camera.x) * zoomFactor;
    const screenY = (this.y - camera.y) * zoomFactor;
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * 0.5 * zoomFactor, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();

    // Update the trail
    this.trail.push({x: this.x, y: this.y});
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();
    }
  }
}

