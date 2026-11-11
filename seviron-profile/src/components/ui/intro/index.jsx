'use client';
import React, { useLayoutEffect, useRef } from 'react'
import styles from './styles.module.css';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function Index() {

    const background = useRef(null);
    const introImage = useRef(null);

    useLayoutEffect( () => {
        gsap.registerPlugin(ScrollTrigger);

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: document.documentElement,
                scrub: true,
                start: "top",
                end: () => `+=${Math.max(window.innerHeight * 0.6, 320)}`,
                invalidateOnRefresh: true,
            },
        })

        timeline
            .to(background.current, {clipPath: "inset(0%)"})

        return () => {
            timeline.scrollTrigger?.kill()
            timeline.kill()
        }
    }, [])

    return (
        <div className={styles.homeHeader}>
            <div className={styles.backgroundImage} ref={background}>
                <Image 
                    src={'/images/image_hi_2.webp'}
                    fill={true}
                    alt="background image"
                    priority={true}
                />
            </div>
        </div>
    )
}
