import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const CYAN = '0,229,255';
const MAGENTA = '255,43,214';
const VIOLET = '139,92,255';

export function NexusThreadBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let particles: Particle[] = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const buildParticles = () => {
      const area = width * height;
      const count = Math.max(58, Math.min(145, Math.round(area / 14500)));
      particles = Array.from({ length: count }, () => ({
        x:
          Math.random() < 0.7
            ? Math.random() < 0.5
              ? Math.random() * width * 0.34
              : width - Math.random() * width * 0.34
            : Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        radius: Math.random() * 1.35 + 0.62,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildParticles();
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      const linkDistance = width < 768 ? 102 : 138;
      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < linkDistance) {
            const alpha = (1 - distance / linkDistance) * 0.46;
            context.beginPath();
            context.moveTo(particles[i].x, particles[i].y);
            context.lineTo(particles[j].x, particles[j].y);
            context.strokeStyle = `rgba(${CYAN},${alpha})`;
            context.lineWidth = 0.9;
            context.stroke();
          }
        }
      }

      particles.forEach((particle) => {
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        if (particle.radius > 1.68) {
          context.fillStyle = `rgba(${MAGENTA},0.88)`;
        } else if (particle.radius > 1.25) {
          context.fillStyle = `rgba(${VIOLET},0.72)`;
        } else {
          context.fillStyle = `rgba(${CYAN},0.82)`;
        }
        context.fill();

        if (!reducedMotion) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          if (particle.x < -10 || particle.x > width + 10) particle.vx *= -1;
          if (particle.y < -10 || particle.y > height + 10) particle.vy *= -1;
        }
      });

      animationFrame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="nexus-thread-background" aria-hidden="true" />;
}
