import { createSignal, onCleanup } from "solid-js";
import styles from './TypewriterAnimation.module.css';

const UPDATE_TIME = 100;
const SECONDS_IDLE_AFTER_TYPED = 2;
const IDLE_UNITS = (1000 / UPDATE_TIME) * SECONDS_IDLE_AFTER_TYPED;

export default function TypewriterAnimation() {
    const [charIndex, setCharIndex] = createSignal<number>(0);
    const [adjectiveIndex, setAdjectiveIndex] = createSignal<number>(0);

    const adjectives = [
        'get better grades',
        'learn better',
        'study faster',
        'stay organized',
        'learn easier',
        'study effortlessly',
        'practice easier',
        'pay attention',
        'stay focused',
        'achieve your goals'
    ];

    const timer = setInterval(() => {
        setCharIndex(charIndex() + 1);

        if (charIndex() > adjectives[adjectiveIndex()].length + IDLE_UNITS) {
            setCharIndex(0);
            setAdjectiveIndex((adjectiveIndex() + 1) % adjectives.length);
        }
    }, UPDATE_TIME);

    onCleanup(() => clearInterval(timer));

    return (
        <h2>
            Noter helps you <br />
            <span class={styles.adjective}>{ adjectives[adjectiveIndex()].substring(0, charIndex()) }</span>.
        </h2>
    )
}