import React, { useEffect, useRef } from 'react';

interface StarfieldCanvasProps {
  intensity?: number;
}

export const StarfieldCanvas: React.FC<StarfieldCanvasProps> = ({ intensity = 1.0 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

    if (gl) {
      // WebGL Shader implementation matching user's animation specification
      const vsSource = `
        attribute vec2 a_position;
        varying vec2 v_texCoord;
        void main() {
          v_texCoord = a_position * 0.5 + 0.5;
          gl_Position = vec4(a_position, 0.0, 1.0);
        }
      `;

      const fsSource = `
        precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;
        uniform vec2 u_resolution;

        float random (vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        void main() {
          vec2 st = v_texCoord;
          vec3 color = vec3(0.015, 0.025, 0.055); // Deep cosmic abyss
          
          // Stars layer 1
          vec2 st_stars = st * 120.0;
          vec2 ipos = floor(st_stars);
          float rnd = random(ipos);
          if (rnd > 0.975) {
            float blink = 0.4 + 0.6 * sin(u_time * 2.2 + rnd * 12.0);
            color += vec3(0.7, 0.85, 1.0) * blink * (rnd > 0.995 ? 1.4 : 0.8);
          }
          
          // Stars layer 2 (fainter micro-stars)
          vec2 st_stars2 = st * 240.0;
          vec2 ipos2 = floor(st_stars2);
          if (random(ipos2) > 0.985) {
            color += vec3(0.4, 0.6, 0.9) * 0.4;
          }
          
          // Subtle celestial nebula glow
          float nebula = sin(st.x * 2.2 + u_time * 0.08) * sin(st.y * 2.2 - u_time * 0.04);
          vec3 nebulaColor = vec3(0.08, 0.04, 0.18) * (0.5 + 0.5 * nebula);
          
          color += nebulaColor;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `;

      const createShader = (type: number, src: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
      };

      const vs = createShader(gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return;

      const program = gl.createProgram();
      if (!program) return;
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      gl.useProgram(program);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
        gl.STATIC_DRAW
      );

      const pos = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(program, 'u_time');
      const uRes = gl.getUniformLocation(program, 'u_resolution');

      const handleResize = () => {
        if (!canvas) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        if (uRes) gl.uniform2f(uRes, w, h);
      };

      window.addEventListener('resize', handleResize);
      handleResize();

      let startTime = performance.now();
      const render = (now: number) => {
        const elapsed = (now - startTime) * 0.001;
        if (uTime) gl.uniform1f(uTime, elapsed * intensity);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
      };
    } else {
      // 2D Canvas fallback
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let stars = Array.from({ length: 150 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.2 + 0.05,
        alpha: Math.random()
      }));

      const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);
      handleResize();

      const render2D = () => {
        ctx.fillStyle = '#0c1324';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        stars.forEach(s => {
          s.y -= s.speed;
          if (s.y < 0) s.y = canvas.height;
          ctx.fillStyle = `rgba(170, 199, 255, ${0.3 + 0.7 * Math.sin(Date.now() * 0.002 + s.x)})`;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        });

        animId = requestAnimationFrame(render2D);
      };

      animId = requestAnimationFrame(render2D);
      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#191f31]/30 via-transparent to-[#070d1f]/80 pointer-events-none" />
      <div className="scanline absolute inset-0 opacity-25 pointer-events-none" />
    </div>
  );
};
