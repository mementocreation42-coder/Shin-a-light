'use client';

import { useRef, useState, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

export type HPanel =
    | { kind: 'text'; heading?: string; body: string }
    | { kind: 'image'; src: string; caption?: string };

export interface HorizontalData {
    eyebrow?: string;
    title: string;
    panels: HPanel[];
}

function Panels({ panels }: { panels: HPanel[] }) {
    return (
        <>
            {panels.map((p, i) =>
                p.kind === 'text' ? (
                    <div key={i} className="fl-hpanel is-text">
                        {p.heading && <h3 className="fl-hpanel-heading">{p.heading}</h3>}
                        <p className="fl-hpanel-body">{p.body}</p>
                    </div>
                ) : (
                    <figure key={i} className="fl-hpanel is-image">
                        {p.src ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.src} alt={p.caption || ''} />
                        ) : (
                            <div
                                className="fl-ph is-fill"
                                role="img"
                                aria-label={`${p.caption || '写真'}（取材予定）`}
                            >
                                <span className="fl-ph-label">Photo</span>
                                <span className="fl-ph-note">取材予定</span>
                            </div>
                        )}
                        {p.caption && <figcaption>{p.caption}</figcaption>}
                    </figure>
                )
            )}
        </>
    );
}

export default function HorizontalScroll({ data }: { data: HorizontalData }) {
    const targetRef = useRef<HTMLElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const reduced = useReducedMotion();

    const [maxX, setMaxX] = useState(0);
    const [vh, setVh] = useState(0);

    useLayoutEffect(() => {
        const measure = () => {
            const track = trackRef.current;
            if (!track) return;
            setMaxX(Math.max(0, track.scrollWidth - window.innerWidth));
            setVh(window.innerHeight);
        };
        measure();
        const ro = new ResizeObserver(measure);
        if (trackRef.current) ro.observe(trackRef.current);
        window.addEventListener('resize', measure);
        return () => {
            ro.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, []);

    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ['start start', 'end end'],
    });
    const x = useTransform(scrollYProgress, [0, 1], [0, -maxX]);

    // モーション無効時：横スワイプできる素のスクロール領域にフォールバック
    if (reduced) {
        return (
            <section className="fl-block fl-hscroll-reduced">
                <div className="fl-hscroll-head fl-inner">
                    {data.eyebrow && <p className="fl-eyebrow">{data.eyebrow}</p>}
                    <h2 className="fl-heading">{data.title}</h2>
                </div>
                <div className="fl-hscroll-track is-native">
                    <Panels panels={data.panels} />
                </div>
            </section>
        );
    }

    return (
        <section
            className="fl-block fl-hscroll"
            ref={targetRef}
            style={{ height: maxX ? maxX + vh : '100vh' }}
        >
            <div className="fl-hscroll-sticky">
                <div className="fl-hscroll-intro">
                    {data.eyebrow && <p className="fl-eyebrow">{data.eyebrow}</p>}
                    <h2 className="fl-heading">{data.title}</h2>
                </div>
                <motion.div className="fl-hscroll-track" ref={trackRef} style={{ x }}>
                    <Panels panels={data.panels} />
                </motion.div>
            </div>
        </section>
    );
}
