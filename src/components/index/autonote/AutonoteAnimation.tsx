import { For, Match, Show, Switch, createSignal } from "solid-js";
import AudioBar from "./AudioBar";
import buttonStyles from '../Button.module.css'
import styles from "./Autonote.module.css";
import type { MouseController } from "../Mouse";
import Magic from "../Magic";
import AnimationStarter, { AnimationContainerType } from "../AnimationContainer";
import AnimationContainer from "../AnimationContainer";
import AutonoteImage from "./AutonoteImage";

const WORDS = "Prokaryotic cells lack a nucleus and other membrane-bound organelles, whereas eukaryotic cells possess a nucleus and various specialized organelles. These cells are the building blocks of all living organisms, carrying out essential functions that sustain life.".split(" ");
const BULLET_POINTS = ["Prokaryotes: no nucleus or membrane-bound organelles", "Eurkaryotes: have nucleus and specialized organelles", "Cells are the building blocks of living organisms"]

function addLeadingZeroIfNeeded(n: number): string {
    if (n > 9) {
        return n.toString();
    } else {
        return `0${n}`;
    }
}

enum AnimationPhase {
    PRE_RECORDING,
    RECORDING,
    ALMOST_LOADING,
    LOADING,
    FINISHED_LOADING,
    SHOW_SUGGESTION,
    ADD_IMAGE
}

const INITIAL_PHASES = [AnimationPhase.PRE_RECORDING, AnimationPhase.RECORDING, AnimationPhase.ALMOST_LOADING];
const AFTER_LOADING_PHASES = [AnimationPhase.FINISHED_LOADING, AnimationPhase.SHOW_SUGGESTION, AnimationPhase.ADD_IMAGE];

export default function AutonoteAnimation() {
    const [ wordIndex, setWordIndex ] = createSignal<number>(0);
    const [ second, setSecond ] = createSignal<number>(0);
    const [ phase, setPhase ] = createSignal<AnimationPhase>(AnimationPhase.PRE_RECORDING);
    let contentContainer: HTMLDivElement | undefined = undefined;
    let timestamp: HTMLHeadingElement | undefined = undefined;
    let startRecordingButton: HTMLDivElement | undefined = undefined;
    let doneButton: HTMLParagraphElement | undefined = undefined;
    let suggestionButton: HTMLParagraphElement | undefined = undefined;
    let wordUpdateInterval: number;
    let timeUpdateInterval: number;

    function startTranscript() {
        wordUpdateInterval = setInterval(() => {
            if (WORDS.length > wordIndex()) {
                setWordIndex(wordIndex() + 1);
            } else if (timestamp) {
                clearInterval(wordUpdateInterval);
                clearInterval(timeUpdateInterval);
            }
        }, 100);
    }

    function startTimer() {
        timeUpdateInterval = setInterval(() => {
            setSecond(second() + 1);
        }, 1000);
    }

    async function runAnimation(mc: MouseController) {
        if (startRecordingButton === undefined || timestamp === undefined || doneButton === undefined) return;

        clearInterval(wordUpdateInterval);
        clearInterval(timeUpdateInterval);
        setWordIndex(0);
        setSecond(0);
        setPhase(AnimationPhase.PRE_RECORDING);

        mc.goTo(timestamp);
        mc.show();

        await mc.move(startRecordingButton);
        await mc.click(startRecordingButton);
        mc.hide();

        setPhase(AnimationPhase.RECORDING);
        
        startTranscript();
        startTimer();

        await mc.wait(2500);
        mc.show();
        await mc.move(startRecordingButton);
        await mc.click(startRecordingButton);

        setPhase(AnimationPhase.ALMOST_LOADING);

        await mc.move(doneButton);
        await mc.click(doneButton);

        setPhase(AnimationPhase.LOADING);

        mc.hide();
        await mc.wait(2000);

        setPhase(AnimationPhase.FINISHED_LOADING);

        await mc.wait(1000);

        setPhase(AnimationPhase.SHOW_SUGGESTION);

        if (suggestionButton === undefined) return;

        await mc.wait(500);
        mc.show();
        await mc.move(suggestionButton);
        await mc.click(suggestionButton);
        mc.hide();

        setPhase(AnimationPhase.ADD_IMAGE);
    }

    return (
        <AnimationContainer type={AnimationContainerType.PHONE} animateFunction={runAnimation}>
            <h1>1.2 Cells</h1>
            
            <div classList={{
                [styles.row]: true,
                [styles.audioRow]: true,
                [styles.showAudioBars]: phase() == AnimationPhase.RECORDING
            }}>
                <AudioBar /><AudioBar /><AudioBar />
                <AudioBar /><AudioBar /><AudioBar />
                <AudioBar /><AudioBar /><AudioBar />
                <AudioBar /><AudioBar /><AudioBar />
            </div>
            
            <Show when={ [AnimationPhase.PRE_RECORDING, AnimationPhase.RECORDING, AnimationPhase.ALMOST_LOADING].includes(phase()) }>
                <h2 classList={{
                    [styles.timestamp]: true,
                    [styles.recording]: phase() === AnimationPhase.RECORDING
                }} ref={timestamp}>
                    00:{ addLeadingZeroIfNeeded(second()) }
                </h2>
            </Show>

            <div class={styles.contentContainer} ref={contentContainer}>
                <Switch>
                    <Match when={ INITIAL_PHASES.includes(phase()) }>
                        {/* Show transcript */}
                        <p>{WORDS.slice(0, wordIndex()).join(" ")}</p>
                    </Match>

                    <Match when={ !INITIAL_PHASES.includes(phase()) }>
                        {/* Magic and bulleted list of AI notes */}
                        <For each={ BULLET_POINTS }>
                            { (bulletPoint, i) => (
                                <Magic doneState={ () => AFTER_LOADING_PHASES.includes(phase()) }>
                                    <li style={{ "margin-left": "1rem" }}>{ bulletPoint }</li>
                                </Magic>
                            ) }
                        </For>

                        <Show when={ phase() === AnimationPhase.ADD_IMAGE } fallback={
                            <p classList={{
                                [buttonStyles.button]: true,
                                [styles.hideSuggestionButton]: phase() !== AnimationPhase.SHOW_SUGGESTION
                            }} ref={suggestionButton}>
                                Suggestion: Add cell image
                            </p>
                        }>
                            <img class={styles.animateIn} src={AutonoteImage} alt="Image in note document" />
                        </Show>
                    </Match>
                </Switch>
            </div>

            <Show when={ INITIAL_PHASES.includes(phase()) }>
                <div class={`${styles.row} ${styles.actionRow}`}>
                    <div ref={startRecordingButton} classList={{
                        [styles.recordButton]: true,
                        [styles.recording]: phase() === AnimationPhase.RECORDING
                    }}></div>

                    <p class={buttonStyles.button} ref={doneButton}>Done</p>
                </div>
            </Show>
        </AnimationContainer>
    )
}