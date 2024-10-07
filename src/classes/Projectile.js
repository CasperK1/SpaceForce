class Projectile {
  constructor({x, y, radius, color = "white", velocity, angle}) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
    this.angle = angle;
    this.laserLength = radius * 4;
  }

  draw() {
    const screenX = (this.x - camera.x) * zoomFactor;
    const screenY = (this.y - camera.y) * zoomFactor;
    const laserWidth = this.radius * 0.8 * zoomFactor;

    ctx.save();

    // Calculate end points of the laser
    const endX = screenX + Math.cos(this.angle) * this.laserLength * zoomFactor;
    const endY = screenY + Math.sin(this.angle) * this.laserLength * zoomFactor;

    // Create a gradient for the laser beam
    const gradient = ctx.createLinearGradient(screenX, screenY, endX, endY);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(0.5, this.color);
    // Draw the main laser beam with a taper
    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = laserWidth;
    ctx.strokeStyle = gradient;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Add a glow effect
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 55;
    ctx.lineWidth = laserWidth * 0.7;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.stroke();

    // Add a bright core
    ctx.beginPath();
    ctx.moveTo(screenX, screenY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = laserWidth * 0.3;
    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }
}