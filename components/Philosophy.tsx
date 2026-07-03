'use client';

import { motion } from 'framer-motion';

const paragraphs = [
    '“Shine a Light”とはThe Rolling Stonesのアルバム『メイン・ストリートのならず者』に収録されている楽曲のタイトル。僕はこの曲や言葉の響きがとても好きで、自分のクリエイティブ活動を“Shine a Light”と名付けることにしました。',
    'カメラを使い、映像や写真を撮る際に必ず必要になってくるのが光です。光がないと何も撮れません。そして“人生の真理”としても非常に重要なファクターとも言えますが、それと同時に無視できないのが影の存在です。',
    '光と影は表裏一体であり、東から太陽が昇れば西に沈むことと同じで自然の摂理です。僕は光があたっている部分だけを見ようとするのではなく、影を見たい。そしてその影にこそ、まだ語られていない物語があると思っています。',
];

const reveal = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.165, 0.84, 0.44, 1] as [number, number, number, number], delay: i * 0.12 },
    }),
};

export default function Philosophy() {
    return (
        <section id="philosophy" className="section philosophy-section">
            <div className="philosophy-inner">
                <motion.p
                    className="philosophy-eyebrow"
                    custom={0}
                    variants={reveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.6 }}
                >
                    Philosophy
                </motion.p>

                <motion.h2
                    className="philosophy-statement"
                    custom={1}
                    variants={reveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.6 }}
                >
                    影ある所に
                    <br />
                    必ず光がある。
                </motion.h2>

                <motion.p
                    className="philosophy-statement-en"
                    custom={2}
                    variants={reveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.6 }}
                >
                    There is strong shadow where there is much light.
                </motion.p>

                <div className="philosophy-body">
                    {paragraphs.map((text, i) => (
                        <motion.p
                            key={i}
                            custom={i + 3}
                            variants={reveal}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                        >
                            {text}
                        </motion.p>
                    ))}
                </div>
            </div>
        </section>
    );
}
