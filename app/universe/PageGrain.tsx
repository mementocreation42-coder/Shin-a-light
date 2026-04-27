'use client';

import { useEffect, useRef } from 'react';

export default function PageGrain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const W = 256;
        const H = 256;
        canvas.width = W;
        canvas.height = H;

        let raf: number;
        let frame = 0;

        const draw = () => {
            frame++;
            if (frame % 4 === 0) {
                const imageData = ctx.createImageData(W, H);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const v = Math.random() * 255;
                    data[i] = v;
                    data[i + 1] = v;
                    data[i + 2] = v;
                    data[i + 3] = Math.random() * 28 + 8;
                }
                ctx.putImageData(imageData, 0, 0);
            }
            raf = requestAnimationFrame(draw);
        };
        draw();

        return () => cancelAnimationFrame(raf);
    }, []);

    return <canvas ref={canvasRef} className="page-grain" aria-hidden="true" />;
}
