import { For, Match, Switch, createSignal } from "solid-js";
import Magic from "../Magic";
import styles from './SummarizerAnimation.module.css';
import type { MouseController } from "../Mouse";
import AnimationStarter, { AnimationContainerType } from "../AnimationContainer";
import AnimationContainer from "../AnimationContainer";

const BULLET_POINTS = [
    'Biology studies living organisms and their interactions with the environment.',
    'Living organisms possess characteristics such as organization, energy utilization, growth, reproduction, response to stimuli, and evolution.',
    'Cells are the basic structural and functional units of living organisms, classified into prokaryotic and eukaryotic types.',
    'Energy processes in cells include cellular respiration, converting glucose and oxygen into carbon dioxide, water, and ATP, and photosynthesis, converting light energy into glucose and releasing oxygen.',
    'Genetics explores heredity, DNA structure, and inheritance patterns.',
    'Evolution is driven by natural selection, leading to adaptation and speciation. The fossil record, homologous structures, and vestigial structures provide evidence for evolution and common ancestry.',
    'The study of biology reveals the diversity, complexity, and interconnectedness of life on Earth.'
]

export default function SummarizerAnimation() {
    const [ doneLoading, setDoneLoading ] = createSignal<boolean>(false);
    const [ sentencesSelected, setSentencesSelected ] = createSignal<boolean>(true);
    let sentences: HTMLSpanElement | undefined;
    let bullets: HTMLSpanElement | undefined;

    async function runAnimation(mouse: MouseController) {
        if (sentences === undefined || bullets === undefined) return;

        mouse.goTo(sentences);
        mouse.show();

        while (true) {
            await mouse.wait(1000);
            setDoneLoading(true);
            await mouse.wait(1000);
    
            await mouse.move(sentencesSelected() ? bullets : sentences);
            await mouse.click(sentencesSelected() ? bullets : sentences);
            setDoneLoading(false);
            setSentencesSelected(!sentencesSelected());
        }
    }

    return (
        <AnimationContainer noRestart={true} type={AnimationContainerType.DESKTOP} animateFunction={runAnimation}>
            <div class={styles.bar}>
                <h1>Summary</h1>

                <div class={styles.radio}>
                    <span ref={sentences} classList={{
                        [styles.selected]: sentencesSelected()
                    }}>
                        Sentences
                    </span>

                    <span ref={bullets} classList={{
                        [styles.selected]: !sentencesSelected()
                    }}>
                        Bullets
                    </span>
                </div>
            </div>
            
            <Switch>
                <Match when={ sentencesSelected() }>
                    <div class={styles.content}>
                        <Magic doneState={doneLoading}><p>Biology encompasses the study of living organisms and their interactions with the environment, exploring their characteristics, organization, energy utilization, growth, reproduction, response to stimuli, and evolution. It also examines the levels of biological organization, ranging from atoms and molecules to ecosystems and the biosphere.</p></Magic>
                        <Magic doneState={doneLoading}><p>The scientific method serves as a framework for inquiry in biology, involving observation, questioning, hypothesis formulation, experimentation, data analysis, and conclusion drawing. Life is classified into three domains: Bacteria, Archaea, and Eukarya, with cells being the basic units of life, categorized as prokaryotic or eukaryotic. Energy processes within cells involve cellular respiration and photosynthesis.</p></Magic>
                        <Magic doneState={doneLoading}><p>Genetics focuses on heredity, DNA structure, and the transmission of traits from one generation to the next. Evolution, driven by natural selection, leads to the accumulation of advantageous traits in populations over time. Evidence for evolution includes the fossil record, homologous structures, and other comparative features among species.</p></Magic>
                    </div>
                </Match>

                <Match when={ !sentencesSelected() }>
                    <div class={styles.content}>
                        <For each={ BULLET_POINTS }>
                            { (bulletPoint, i) => (
                                <Magic doneState={ doneLoading }>
                                    <li style={{ "margin-left": "1rem" }}>{ bulletPoint }</li>
                                </Magic>
                            ) }
                        </For>
                    </div>
                </Match>
            </Switch>
        </AnimationContainer>
    )
}