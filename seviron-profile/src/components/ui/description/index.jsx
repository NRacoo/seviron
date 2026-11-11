'use client';
import React, { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './style.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const phrases = ["Secure", "Environmental", "Organization"];

export default function Description() {
  return (
    <div className={styles.description}>
      {phrases.map((phrase, i) => <AnimatedText key={i}>{phrase}</AnimatedText>)}
    </div>
  );
}

function AnimatedText({ children }) {
  const text = useRef(null);

  useGSAP(() => {
    gsap.fromTo(text.current,
      { opacity: 0, x: -200 },
      {
        opacity: 1,
        x: 0,
        ease: "power3.out",
        scrollTrigger: {
          trigger: text.current,
          start: "top 100%",
          end: "top 70%",
          scrub: true,
          // markers: true,
        },
      }
    );
  }, { scope: text });

  return <p ref={text}>{children}</p>;
}