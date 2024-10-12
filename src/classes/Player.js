class Player {
  constructor({ x, y, color, userName }) {
    this.userName = userName;
    this.playerImage = new Image();
    this.playerImage.src = "assets/images/spaceman-right.png";
    this.x = x;
    this.y = y;
    this.radius = 7;
    this.color = color;
    this.score = 0;
    this.weapon = new Weapon({});
    this.jetpack = new JetpackEffect(x, y); // Add jetpack
  }

  updateImage() {
    if (Math.abs((this.weapon.angle * 180) / Math.PI) > 90) {
      this.playerImage.src = "assets/images/spaceman-left.png";
    } else {
      this.playerImage.src = "assets/images/spaceman-right.png";
    }
  }

  update() {
    // Add any existing update logic here
    this.updateImage();

    // Update jetpack position and particles
    this.jetpack.x = this.x + 10;
    this.jetpack.y = this.y;
    this.jetpack.update();
  }

  draw() {
    const screenX = (this.x - camera.x) * zoomFactor;
    const screenY = (this.y - camera.y) * zoomFactor;

    // Draw player
    ctx.save();
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 80;
    ctx.beginPath();
    ctx.arc(screenX, screenY, this.radius * zoomFactor, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.restore();

    // Draw player image
    ctx.drawImage(this.playerImage, screenX - 80, screenY - 100, 150, 150);

    // Draw weapon, jetpack
    this.weapon.draw(this.x, this.y);
    this.jetpack.draw(this.x, this.y);

    // Username
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    const textWidth = ctx.measureText(this.userName).width;
    ctx.fillText(this.userName, screenX - textWidth / 2, screenY - 90);
  }
}
