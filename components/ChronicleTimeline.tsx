'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { milestones, Milestone } from '../data/chronicle-milestones';
import { MapPin, User } from 'lucide-react';
import styles from './ChronicleTimeline.module.css';

export default function ChronicleTimeline() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeMilestone, setActiveMilestone] = useState<Milestone>(milestones[0]);

    useEffect(() => {
        // Force scroll to top on mount
        window.scrollTo(0, 0);

        // Ensure first milestone is active when near top
        const handleScroll = () => {
            if (window.scrollY < 100) {
                setActiveMilestone(milestones[0]);
            }
        };

        const observer = new IntersectionObserver(
            (entries) => {
                // Don't update if we're at the very top (first milestone should stay active)
                if (window.scrollY < 100) {
                    return;
                }
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('data-id');
                        const milestone = milestones.find((m) => m.id === id);
                        if (milestone) {
                            setActiveMilestone(milestone);
                        }
                    }
                });
            },
            {
                root: null,
                rootMargin: '-10% 0px -50% 0px', // Top 40% of viewport triggers
                threshold: 0.1,
            }
        );

        const sections = document.querySelectorAll(`.${styles.milestoneSection}`);
        sections.forEach((section) => observer.observe(section));

        window.addEventListener('scroll', handleScroll);

        return () => {
            observer.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={styles.container} ref={containerRef}>
            {/* Translucent Background Image Container */}
            <div className={styles.bgImageContainer}>
                <AnimatePresence mode="wait">
                    <motion.img
                        key={activeMilestone.image}
                        src={activeMilestone.image}
                        alt=""
                        className={styles.bgImage}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                </AnimatePresence>
                <div className={styles.bgOverlay}></div>
            </div>

            {/* Narrative Scroll Panel */}
            <div className={styles.narrativePanel}>
                <header style={{ marginBottom: '60px' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '20px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        CHRONICLE: DAISUKE KOBAYASHI
                    </div>
                    <div style={{ width: '50px', height: '2px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                </header>

                {milestones.map((milestone) => (
                    <div
                        key={milestone.id}
                        data-id={milestone.id}
                        className={`${styles.milestoneSection} ${activeMilestone.id === milestone.id ? styles.active : ''}`}
                    >
                        <div className={styles.yearStamp}>
                            {milestone.month ? `${milestone.month} ` : ''}{milestone.year}
                        </div>
                        <h2 className={styles.milestoneTitle}>
                            {milestone.title}
                        </h2>
                        <p className={styles.milestoneContent}>
                            {milestone.content}
                        </p>
                    </div>
                ))}

                <footer style={{ marginTop: '100px', paddingBottom: '100px', opacity: 0.5 }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.7rem' }}>
                        © 2026 DAISUKE KOBAYASHI | MITOFLOW40
                    </div>
                </footer>
            </div>

            {/* Sticky Dashboard */}
            <div className={styles.dashboardPanel}>
                <div className={styles.dashboardContent}>
                    <div className={styles.dashboardCard} style={{ marginBottom: '20px' }}>
                        <div className={styles.statLabel}>Current Status</div>
                        <div className={`${styles.statValue} ${styles.accentYellow}`} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '38px' }}>
                            <AnimatePresence mode="wait">
                                <motion.span
                                    key={activeMilestone.dashboard.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                                >
                                    <User size={24} /> {activeMilestone.dashboard.title}
                                </motion.span>
                            </AnimatePresence>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className={styles.dashboardCard}>
                            <div className={styles.statLabel}>Age</div>
                            <div className={styles.statValue}>
                                {activeMilestone.dashboard.age}
                            </div>
                        </div>
                        <div className={styles.dashboardCard}>
                            <div className={styles.statLabel}>Location</div>
                            <div className={styles.statValue} style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', minHeight: '30px' }}>
                                <AnimatePresence mode="wait">
                                    <motion.span
                                        key={activeMilestone.dashboard.location}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                                    >
                                        <MapPin size={18} /> {activeMilestone.dashboard.location.split(',')[0]}
                                    </motion.span>
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>

                    <div className={styles.dashboardCard}>
                        <div className={styles.statLabel}>Energy Level</div>
                        <div className={styles.statValue} style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                            {activeMilestone.dashboard.energy}<span style={{ fontSize: '1rem' }}>%</span>
                        </div>
                        <div className={styles.energyBarBg}>
                            <div
                                className={styles.energyBarFill}
                                style={{ width: `${activeMilestone.dashboard.energy}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className={styles.dashboardCard}>
                        <div className={styles.statLabel}>Attributes</div>
                        <div className={styles.statsContainer}>
                            <div className={styles.statRow}>
                                <span className={styles.statRowLabel}>Creativity</span>
                                <div className={styles.statBarBg}>
                                    <div className={`${styles.statBarFill} ${styles.creativity}`} style={{ width: `${activeMilestone.dashboard.stats.creativity}%` }}></div>
                                </div>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statRowLabel}>Tech</span>
                                <div className={styles.statBarBg}>
                                    <div className={`${styles.statBarFill} ${styles.technology}`} style={{ width: `${activeMilestone.dashboard.stats.technology}%` }}></div>
                                </div>
                            </div>
                            <div className={styles.statRow}>
                                <span className={styles.statRowLabel}>Lifestyle</span>
                                <div className={styles.statBarBg}>
                                    <div className={`${styles.statBarFill} ${styles.lifestyle}`} style={{ width: `${activeMilestone.dashboard.stats.lifestyle}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chuunibyou Stats */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className={styles.dashboardCard}>
                            <div className={styles.statLabel} style={{ color: '#00FFFF' }}>Sync Rate</div>
                            <div className={`${styles.statValue} ${styles.syncRateValue}`}>
                                {activeMilestone.dashboard.stats.syncRate}<span style={{ fontSize: '0.8rem' }}>%</span>
                            </div>
                        </div>
                        <div className={styles.dashboardCard}>
                            <div className={`${styles.statLabel} ${styles.distortionLabel}`}>Reality Distortion</div>
                            <div className={styles.energyBarBg}>
                                <div
                                    className={styles.distortionBarFill}
                                    style={{ width: `${activeMilestone.dashboard.stats.realityDistortion}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.dashboardCard}>
                        <div className={styles.statLabel}>Current Focus</div>
                        <div className={styles.focusTags}>
                            <AnimatePresence mode="popLayout">
                                {activeMilestone.dashboard.focus.map((tag) => (
                                    <motion.span
                                        key={tag}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        className={styles.focusTag}
                                    >
                                        #{tag}
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className={styles.dashboardCard} style={{ marginTop: '20px', background: 'none', border: 'none', padding: '0' }}>
                        <div className={styles.statLabel}>Ref. Timeline</div>
                        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.8rem' }}>
                            {activeMilestone.year} ARCHIVE_00{milestones.indexOf(activeMilestone) + 1}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
