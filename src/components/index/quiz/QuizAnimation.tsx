import { For, createSignal } from 'solid-js';
import type { MouseController } from "../Mouse";
import styles from '../generatestudyguide/GenerateStudyGuidesAnimation.module.css';
import quizStyles from './QuizAnimation.module.css';
import buttonStyles from '../Button.module.css'
import AnimationStarter, { AnimationContainerType } from '../AnimationContainer';
import AnimationContainer from '../AnimationContainer';

const QUESTIONS = [
    [
        "Which domain of life consists of single-celled organisms that lack a nucleus and membrane-bound organelles?",
        "bacteria",
        "archaea",
        "eukarya",
        "protista"
    ],
    [
        "What is the process by which plants convert light energy into chemical energy, producing glucose and releasing oxygen?",
        "cellular respiration",
        "photosynthesis",
        "metabolism",
        "reproduction"
    ],
    [
        "Which process involves the conversion of glucose and oxygen into carbon dioxide, water, and ATP?",
        "photosynthesis",
        "DNA replication",
        "protein synthesis",
        "cellular respiration"
    ]
];

const ANSWERS = [0, 1, 3];
const CORRECT_BACKGROUND_COLOR = '#34d399';
const INCORRECT_BACKGROUND_COLOR = '#fb7185';

export default function QuizAnimation() {
    const [ questionIndex, setQuestionIndex ] = createSignal<number>(0);
    const [ showAnswers, setShowAnswers ] = createSignal<boolean>(false);
    let scrollContainer: HTMLDivElement | undefined = undefined;
    let circleSvg: SVGCircleElement | undefined = undefined;

    async function runAnimation(mouse: MouseController) {
        if (scrollContainer === undefined || circleSvg === undefined) return;

        setQuestionIndex(0);
        setShowAnswers(false);
        circleSvg.classList.remove(quizStyles.animateIn);
        scrollContainer.scrollTo(0, 0);
        mouse.show();

        for (let i = 0; QUESTIONS.length > i; i++) {
            setQuestionIndex(i);

            let correctAnswer = ANSWERS[questionIndex()];
            let correctAnswerElement = scrollContainer.querySelector<HTMLElement>(`p[data-answer="${correctAnswer}"][data-question="${questionIndex()}"]`);

            if (correctAnswerElement === null) return;
            
            
            await mouse.move(correctAnswerElement);
            await mouse.click(correctAnswerElement);
            setShowAnswers(true);
            await mouse.wait(1000);
            setShowAnswers(false);

            scrollContainer.scrollTo({
                behavior: "smooth",
                left: scrollContainer.scrollWidth / 4 * (questionIndex() + 1),
                top: 0
            });
            
            // Wait for scrollTo to finish
            // HACK: this number is arbitrary! If a browser takes longer to scroll than this, game over!
            // TODO: fix this hack
            await mouse.wait(1000);
        }

        circleSvg.classList.add(quizStyles.animateIn);
        await mouse.hide();
    }

    return (
        <AnimationContainer type={AnimationContainerType.DESKTOP} animateFunction={runAnimation}>
            <div class={styles.scrollContainer} ref={scrollContainer}>
                <div class={styles.pages} style={{ "grid-template-columns": "1fr 1fr 1fr 1fr", "width": "400%" }}>
                    {/* 3 questions, 3 pages */}
                    <For each={ QUESTIONS }>
                        {(questions, questionI) => (
                            <div class={styles.page}>
                                <h2>{questionI()+1}. {questions[0]}</h2>

                                <div>
                                    <For each={ questions.slice(1) }>
                                        {(answer, answerI) => (
                                            <p class={buttonStyles.button} style={{
                                                "background": showAnswers() ? (ANSWERS[questionI()] === answerI() ? CORRECT_BACKGROUND_COLOR : INCORRECT_BACKGROUND_COLOR) : 'var(--button-color)',
                                                "transition": "background 0.15s ease"
                                            }} data-question={questionI()} data-answer={answerI()}>{answer}</p>
                                        )}
                                    </For>
                                </div>
                            </div>
                        )}
                    </For>
                    
                    {/* +1 final page */}
                    <div class={styles.page}>
                        <h1>Score</h1>

                        <div class={quizStyles.scorePageBox}>
                            <svg width={32} height={32} viewBox="0 0 32 32">
                                <circle cx={16} cy={16} r={12} stroke={CORRECT_BACKGROUND_COLOR} stroke-width={8} fill="none" ref={circleSvg} />
                            </svg>

                            <div class={quizStyles.textContainer}>
                                <div>
                                    <h1>You aced that!</h1>
                                    <p>Excellent! That's every single question answered correctly. Hungry for more? Generate another quiz!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimationContainer>
    )
}