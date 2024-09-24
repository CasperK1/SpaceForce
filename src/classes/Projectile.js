class Projectile {
  constructor({ x, y, radius, color = 'white', velocity }) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.trail = [];  // Store previous positions for trail effect
    this.maxTrailLength = 18;  // Limit the length of the trail
  }

  draw() {
    // Draw the trail first
    for (let i = 0; i < this.trail.length; i++) {
      const radius = this.radius * (i / this.trail.length);
      ctx.save();
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2, false);
      ctx.fill();
      ctx.restore();
    }

    // Draw the current projectile
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();

    // Update the trail with the current position
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > this.maxTrailLength) {
      this.trail.shift();  // Remove the oldest position to maintain trail length
    }
  }
}
