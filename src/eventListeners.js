
addEventListener('click', (e) => {
  const angle = Math.atan2(
    e.clientY - canvas.height / 2,
    e.clientX - canvas.width / 2
  )
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(
    new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity)
  )
})


window.addEventListener('DOMContentLoaded', (event) => {
  const canvas = document.querySelector('canvas');

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeCanvas);

  // Initial resize to set canvas size
  resizeCanvas();
});
