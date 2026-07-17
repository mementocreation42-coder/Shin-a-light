'use client';

import { useState, useRef, useEffect } from 'react';
import { milestones, Milestone } from '../data/chronicle-milestones';
import { MapPin, User } from 'lucide-react';
import styles from './ChronicleTimeline.module.css';

export default function ChronicleTimeline() {
    const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
    const activeIdRef = useRef(milestones[0].id);
    const tickingRef = useRef(false);
    const [activeMilestone, setActiveMilestone] = useState<Milestone>(milestones[0]);

    useEffect(() => {
        // Force scroll to top on mount
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const updateActive = () => {
            tickingRef.current = false;
            let closestIndex = -1;
            let closestDistance = Infinity;

            sectionRefs.current.forEach((section, index) => {
                if (!section) return;
                const rect = section.getBoundingClientRect();
                // Find the section closest to the top of the viewport (within upper half)
                const distance = Math.abs(rect.top - 100); // 100px from top is our target
                if (rect.top < window.innerHeight * 0.6 && distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });

            if (closestIndex >= 0) {
                const milestone = milestones[closestIndex];
                if (milestone.id !== activeIdRef.current) {
                    activeIdRef.current = milestone.id;
                    setActiveMilestone(milestone);
                }
            }
        };

        const handleScroll = () => {
            if (tickingRef.current) return;
            tickingRef.current = true;
            requestAnimationFrame(updateActive);
        };

        // Initial check
        updateActive();

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={styles.container}>
            {/* Translucent Background Image Container */}
            <div className={styles.bgImageContainer}>
                <img
                    key={activeMilestone.image}
                    src={activeMilestone.image}
                    alt=""
                    decoding="async"
                    className={styles.bgImage}
                />
                <div className={styles.bgOverlay}></div>
            </div>

            {/* Narrative Scroll Panel */}
            <div className={styles.narrativePanel}>
                <header style={{ marginBottom: '60px' }}>
                    <div style={{ fontSize: '0.8rem', letterSpacing: '0.2em', marginBottom: '20px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        CHRONICLE: DAISUKE KOBAYASHI
                    </div>
                    <div style={{ width: '50px', height: '2px', background: 'rgba(255, 255, 255, 0.1)' }}></div>
                </header>

                {milestones.map((milestone, index) => (
                    <div
                        key={milestone.id}
                        ref={(el) => { sectionRefs.current[index] = el; }}
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

            </div>

            {/* Sticky Dashboard */}
            <div className={styles.dashboardPanel}>
                <div className={styles.dashboardContent}>
                    <div className={styles.dashboardCard} style={{ marginBottom: '20px' }}>
                        <div className={styles.statLabel}>Current Status</div>
                        <div className={styles.statValue} style={{ display: 'flex', alignItems: 'center', gap: '12px', minHeight: '38px' }}>
                            <span key={activeMilestone.dashboard.title} className={styles.fadeUp} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <User size={24} /> {activeMilestone.dashboard.title}
                            </span>
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
                                <span key={activeMilestone.dashboard.location} className={styles.fadeIn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <MapPin size={18} /> {activeMilestone.dashboard.location.split(',')[0]}
                                </span>
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
                            <div className={styles.statLabel}>Sync Rate</div>
                            <div className={`${styles.statValue} ${styles.syncRateValue}`}>
                                {activeMilestone.dashboard.stats.syncRate}<span style={{ fontSize: '0.8rem' }}>%</span>
                            </div>
                        </div>
                        <div className={styles.dashboardCard}>
                            <div className={styles.statLabel}>Reality Distortion</div>
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
                            {activeMilestone.dashboard.focus.map((tag) => (
                                <span key={tag} className={`${styles.focusTag} ${styles.fadeIn}`}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.dashboardCard} style={{ marginTop: '20px', background: 'none', border: 'none', padding: '0' }}>
                        <div className={styles.statLabel}>Ref. Timeline</div>
                        <div style={{ fontSize: '0.8rem' }}>
                            {activeMilestone.year} ARCHIVE_00{milestones.indexOf(activeMilestone) + 1}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
