'use client';

import { useEffect, useRef } from 'react';

export default function TitleGrain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener('resize', resize);

        let raf: number;
        let frame = 0;

        const draw = () => {
            frame++;
            // update grain every 3 frames — feels like film
            if (frame % 3 === 0) {
                const w = canvas.offsetWidth;
                const h = canvas.offsetHeight;
                const imageData = ctx.createImageData(
                    canvas.width,
                    canvas.height
                );
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const v = Math.random() * 255;
                    data[i] = v;
                    data[i + 1] = v;
                    data[i + 2] = v;
                    data[i + 3] = Math.random() * 55 + 20; // subtle alpha
                }
                ctx.putImageData(imageData, 0, 0);
                void w; void h;
            }
            raf = requestAnimationFrame(draw);
        };
        draw();

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="universe-grain"
            aria-hidden="true"
        />
    );
}
