'use client';

import { useRef } from 'react';
import {
    motion,
    useScroll,
    useTransform,
    useReducedMotion,
    type MotionValue,
} from 'framer-motion';

export interface ParallaxData {
    background: string;
    eyebrow?: string;
    title: string;
    lead?: string;
    motifs: string[];
}

// 各モチーフの配置と視差スピード。手前(near)ほど速く、奥(far)ほど遅く動く。
const PRESETS = [
    { pos: { top: '16%', left: '6%' }, size: 'is-lg', axis: 'y', speed: 0.9, front: true },
    { pos: { top: '30%', right: '8%' }, size: 'is-md', axis: 'y', speed: 0.5, front: false },
    { pos: { top: '60%', left: '10%' }, size: 'is-md', axis: 'x', speed: 1.2, front: true },
    { pos: { top: '70%', right: '12%' }, size: 'is-lg', axis: 'y', speed: 0.7, front: false },
    { pos: { top: '46%', left: '4%' }, size: 'is-sm', axis: 'x', speed: 1.4, front: true },
    { pos: { top: '84%', right: '6%' }, size: 'is-md', axis: 'y', speed: 0.4, front: false },
] as const;

function Motif({
    progress,
    text,
    index,
    reduced,
}: {
    progress: MotionValue<number>;
    text: string;
    index: number;
    reduced: boolean | null;
}) {
    const preset = PRESETS[index % PRESETS.length];
    const range = 60 * preset.speed; // 移動量(%)
    const move = useTransform(progress, [0, 1], [`${range}%`, `${-range}%`]);
    const y = preset.axis === 'y' ? move : undefined;
    const x = preset.axis === 'x' ? move : undefined;

    return (
        <motion.span
            aria-hidden
            className={`fl-parallax-motif ${preset.size} ${preset.front ? 'is-front' : 'is-back'}`}
            style={{ ...preset.pos, ...(reduced ? {} : { x, y }) }}
        >
            {text}
        </motion.span>
    );
}

export default function HistoryParallax({ data }: { data: ParallaxData }) {
    const ref = useRef<HTMLElement>(null);
    const reduced = useReducedMotion();

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ['start end', 'end start'],
    });

    // 奥の背景は最もゆっくり、中景テキストは控えめに動く。
    const bgY = useTransform(scrollYProgress, [0, 1], ['-12%', '12%']);
    const bgScale = useTransform(scrollYProgress, [0, 1], [1.15, 1.25]);
    const textY = useTransform(scrollYProgress, [0, 1], ['18%', '-18%']);

    return (
        <section className="fl-block fl-parallax" ref={ref}>
            {/* 奥：モノクロ背景（素材未定のときは暗幕のみで、モチーフと照明が場をつくる） */}
            {data.background && (
                <motion.div
                    className="fl-parallax-bg"
                    style={reduced ? {} : { y: bgY, scale: bgScale }}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={data.background} alt="" />
                </motion.div>
            )}
            <div className="fl-parallax-overlay" />

            {/* 手前：横切る/漂うグラフィック（年号・起源の断片） */}
            {data.motifs.map((m, i) => (
                <Motif key={i} progress={scrollYProgress} text={m} index={i} reduced={reduced} />
            ))}

            {/* 中景：テキスト */}
            <motion.div
                className="fl-parallax-content"
                style={reduced ? {} : { y: textY }}
            >
                {data.eyebrow && <p className="fl-eyebrow">{data.eyebrow}</p>}
                <h2 className="fl-parallax-title">{data.title}</h2>
                {data.lead && <p className="fl-parallax-lead">{data.lead}</p>}
            </motion.div>
        </section>
    );
}
