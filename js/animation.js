const canvas = document.getElementById('wc');
const ctx = canvas.getContext('2d');
let W, H;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

const ripples = [];

class Ripple {
  constructor(x, y, isClick = false) {
    this.x = x;
    this.y = y;
    this.r = 0;
    this.maxR  = isClick ? 120 + Math.random() * 80  : 50 + Math.random() * 100;
    this.speed = isClick ? 2.5 + Math.random() * 1.5 : 0.5 + Math.random() * 0.7;
    this.alpha = isClick ? 0.6 : 0;
    this.isClick = isClick;
    this.rings = isClick ? 3 : (Math.random() < 0.4 ? 2 : 1);
    this.color = isClick ? '200,221,232' : (Math.random() < 0.3 ? '46,125,168' : '127,168,192');
    this.done  = false;
  }

  update() {
    this.r += this.speed;
    const p = this.r / this.maxR;
    if (this.isClick) {
      this.alpha = p < 0.1 ? p / 0.1 * 0.6 : (1 - (p - 0.1) / 0.9) * 0.6;
    } else {
      this.alpha = p < 0.15 ? p / 0.15 * 0.35 : (1 - (p - 0.15) / 0.85) * 0.35;
    }
    if (this.r > this.maxR) this.done = true;
  }

  draw() {
    for (let i = 0; i < this.rings; i++) {
      const r = this.r - i * (this.isClick ? 18 : 14);
      if (r < 0) continue;
      ctx.beginPath();
      ctx.arc(this.x, this.y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${this.color},${Math.max(0, this.alpha * (1 - i * 0.3))})`;
      ctx.lineWidth = this.isClick ? 1.2 - i * 0.25 : 0.8 - i * 0.2;
      ctx.stroke();
    }
    if (this.r < 6 && this.isClick) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.alpha * 2})`;
      ctx.fill();
    }
  }
}

const splashes = [];

class Splash {
  constructor(x, y) {
    this.drops = [];
    const count = 8 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
      const speed = 2 + Math.random() * 4;
      this.drops.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3 - Math.random() * 4,
        gravity: 0.18 + Math.random() * 0.1,
        alpha: 0.7  + Math.random() * 0.3,
        size:  1    + Math.random() * 2.5,
        trail: []
      });
    }
    this.done = false;
  }

  update() {
    let allDone = true;
    this.drops.forEach(d => {
      if (d.alpha <= 0) return;
      allDone = false;
      d.trail.push({ x: d.x, y: d.y });
      if (d.trail.length > 5) d.trail.shift();
      d.x  += d.vx;
      d.y  += d.vy;
      d.vy += d.gravity;
      d.vx *= 0.99;
      d.alpha -= 0.022;
    });
    if (allDone) this.done = true;
  }

  draw() {
    this.drops.forEach(d => {
      if (d.alpha <= 0) return;
      if (d.trail.length > 1) {
        ctx.beginPath();
        ctx.moveTo(d.trail[0].x, d.trail[0].y);
        d.trail.forEach(t => ctx.lineTo(t.x, t.y));
        ctx.strokeStyle = `rgba(200,221,232,${d.alpha * 0.4})`;
        ctx.lineWidth = d.size * 0.5;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.size * 0.5, d.size, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,221,232,${d.alpha})`;
      ctx.fill();
    });
  }
}

const autoRipples = [];
for (let i = 0; i < 15; i++) {
  const r = new Ripple(Math.random() * W, Math.random() * H, false);
  r.r = Math.random() * r.maxR * 0.8;
  autoRipples.push(r);
}

class FDrop {
  constructor(delay = 0) { this.reset(delay); }

  reset(delay = 0) {
    this.x     = Math.random() * W;
    this.y     = -10 - Math.random() * 50;
    this.vy    = 3 + Math.random() * 5;
    this.alpha = 0.25 + Math.random() * 0.3;
    this.size  = 0.8  + Math.random() * 1.8;
    this.delay = delay;
    this.timer = 0;
  }

  update() {
    if (this.timer < this.delay) { this.timer++; return; }
    this.y += this.vy;
    if (this.y > H + 10) this.reset(Math.random() * 80);
  }

  draw() {
    if (this.timer < this.delay) return;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = '#c8dde8';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.size * 0.4, this.size * 1.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

const fdrops = Array.from({ length: 12 }, (_, i) => new FDrop(i * 25));

document.addEventListener('click', e => {
  const cx = e.clientX;
  const cy = e.clientY;

  ripples.push(new Ripple(cx, cy, true));
  for (let i = 0; i < 3; i++) {
    const r = new Ripple(
      cx + (Math.random() - 0.5) * 30,
      cy + (Math.random() - 0.5) * 30,
      false
    );
    r.maxR  = 40 + Math.random() * 50;
    r.speed = 1  + Math.random() * 0.8;
    r.alpha = 0.2;
    setTimeout(() => ripples.push(r), i * 80);
  }

  splashes.push(new Splash(cx, cy));
});


function drawBg() {
  ctx.fillStyle = '#041120';
  ctx.fillRect(0, 0, W, H);
}

let frame = 0;

function animate() {
  ctx.clearRect(0, 0, W, H);
  drawBg();

  autoRipples.forEach((r, i) => {
    r.update(); r.draw();
    if (r.done) autoRipples[i] = new Ripple(Math.random() * W, Math.random() * H, false);
  });
  if (frame % 45 === 0) autoRipples.push(new Ripple(Math.random() * W, Math.random() * H, false));
  if (autoRipples.length > 20) autoRipples.splice(0, autoRipples.length - 20);

  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].update(); ripples[i].draw();
    if (ripples[i].done) ripples.splice(i, 1);
  }

  for (let i = splashes.length - 1; i >= 0; i--) {
    splashes[i].update(); splashes[i].draw();
    if (splashes[i].done) splashes.splice(i, 1);
  }

  if (frame % 50 === 0) {
    const d = fdrops.find(d => d.y > H + 50);
    if (d) d.reset(0);
  }
  fdrops.forEach(d => { d.update(); d.draw(); });

  frame++;
  requestAnimationFrame(animate);
}

animate();


function toggleSkill(el) {
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.skill-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
}

const tlFill = document.querySelector('.tl-line-fill');
const tlItems = document.querySelectorAll('.tl-item');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setTimeout(() => { tlFill.style.width = '75%'; }, 200);
      tlItems.forEach((item, i) => {
        setTimeout(() => item.classList.add('visible'), i * 200);
      });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

const timeline = document.querySelector('.timeline');
if (timeline) observer.observe(timeline);