import type { MouseController } from "../Mouse";
import CreateEntryButton from "./CreateEntryButton";
import ExampleNote from "./ExampleNote";
import styles from './GenerateStudyGuidesAnimation.module.css';
import buttonStyles from '../Button.module.css'
import { createSignal } from "solid-js";
import Magic from "../Magic";
import AnimationStarter, { AnimationContainerType } from "../AnimationContainer";
import AnimationContainer from "../AnimationContainer";

const STUDY_GUIDE_NAME = '1.1-1.3 Study Guide';

export default function GenerateStudyGuidesAnimation() {
    const [ characterIndex, setCharacterIndex ] = createSignal<number>(0);
    const [ magicDone, setMagicDone ] = createSignal<boolean>(false);
    let studyGuideButton: HTMLDivElement | undefined = undefined;
    let scrollContainer: HTMLDivElement | undefined = undefined;
    let textBox: HTMLParagraphElement | undefined = undefined;
    let generateFromFolder: HTMLDivElement | undefined = undefined;

    async function runAnimation(mouse: MouseController) {
        if (studyGuideButton === undefined || scrollContainer === undefined || textBox === undefined || generateFromFolder === undefined) return;

        textBox.textContent = 'New study guide';
        scrollContainer.scrollTo(0, 0);
        setCharacterIndex(0);
        setMagicDone(false);
        
        mouse.goTo(studyGuideButton);
        mouse.show();

        await mouse.wait(1000);
        await mouse.click(studyGuideButton);

        scrollContainer.scrollTo({
            behavior: "smooth",
            left: scrollContainer.scrollWidth / 3,
            top: 0
        });

        // Wait for scrollTo to finish
        // HACK: this number is arbitrary! If a browser takes longer to scroll than this, game over!
        // TODO: fix this hack
        await mouse.wait(1000);

        await mouse.move(textBox);
        await mouse.click(null);

        await new Promise<void>((resolve, reject) => {
            let interval = setInterval(() => {
                if (textBox === undefined) return;
    
                setCharacterIndex(characterIndex() + 3);
                textBox.textContent = STUDY_GUIDE_NAME.substring(0, characterIndex());

                if (characterIndex() > STUDY_GUIDE_NAME.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, 75);
        });

        await mouse.move(generateFromFolder);
        await mouse.click(generateFromFolder);
        await mouse.hide();

        // Scroll to generation page
        scrollContainer.scrollTo({
            behavior: "smooth",
            left:scrollContainer.scrollWidth / 3 * 2,
            top: 0
        });

        // Wait for scrollTo to finish
        // HACK: this number is arbitrary! If a browser takes longer to scroll than this, game over!
        // TODO: fix this hack
        await mouse.wait(1000);

        // Study guide generation animation waiting
        await mouse.wait(500);

        setMagicDone(true)
    }

    return (
        <AnimationContainer type={AnimationContainerType.DESKTOP} animateFunction={runAnimation}>
            <div class={styles.scrollContainer} ref={scrollContainer}>
                <div class={styles.pages}>
                    {/* Create page */}
                    <div class={styles.page}>
                        <h1>Create...</h1>

                        <div class={styles.creationOptionsRow}>
                            <CreateEntryButton ref={studyGuideButton} name="Study Guide" color="#F472B6" icon={ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="feDocument0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="feDocument1" fill="currentColor" fill-rule="nonzero"><path id="feDocument2" d="M15 4H6v16h12V7h-3V4ZM6 2h10l4 4v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 9h8v2H8v-2Zm0 4h8v2H8v-2Z"/></g></g></svg> } />
                            <CreateEntryButton name="Note" color="#C084FC" icon={ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="feBook0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="feBook1" fill="currentColor" fill-rule="nonzero"><path id="feBook2" d="m13 16.006l7-.047V5.992l-5.17.007l-1.814 1.814L13 16.006Zm-2-8.193L9.179 6.038L4 6.003v9.956l7 .047V7.813Zm-1-3.77L12 6l2-2l5.997-.008A2 2 0 0 1 22 5.989v9.97a2 2 0 0 1-1.986 2L14 18l-1.996 2L10 18l-6.014-.041a2 2 0 0 1-1.986-2V6.003a2 2 0 0 1 2-2l6 .04Z"/></g></g></svg> } />
                            <CreateEntryButton name="Folder" color="#60A5FA" icon={ <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="feFolder0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="feFolder1" fill="currentColor" fill-rule="nonzero"><path id="feFolder2" d="M11 5h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h4l2 2ZM5 7v12h14V7H5Z"/></g></g></svg> } />
                        </div>
                    </div>

                    {/* Options page */}
                    <div class={styles.page}>
                        <h1>Create Study Guide</h1>

                        <div style={{ 'margin': '1rem 0 1rem 0' }}>
                            <small>NAME</small>
                            <p class={styles.textBox} ref={textBox}>
                                New study guide
                            </p>
                        </div>

                        <small>RECENT</small>
                        <ExampleNote name="1.1 Biology Review" />
                        <ExampleNote name="1.2 Cells" />
                        <ExampleNote name="1.3 Macromolecules" />

                        <div style={{ "margin-top": 'auto' }}>
                            <p class={buttonStyles.button}>Generate study guide with selected notes</p>
                            <p class={buttonStyles.button} ref={generateFromFolder}>Generate study guide from all notes in this folder</p>
                        </div>
                    </div>

                    {/* Generated page */}
                    <div class={styles.page}>
                        <div>
                            <h1>1.1-1.3 Study Guide</h1>

                            <Magic doneState={ magicDone }>
                                <h2>Summary</h2>
                                <p>Biology studies living organisms and their interactions. Life is classified into Bacteria, Archaea, and Eukarya domains. Cells are the basic units of life. Genetics focuses on heredity, DNA, and inheritance.</p>
                            </Magic>

                            <Magic doneState={ magicDone }>
                                <h2>Vocbaulary to know</h2>
                                <ul>
                                    <li><strong>Prokaryote:</strong> A single-celled organism that lacks a nucleus and membrane-bound organelles.</li>
                                    <li><strong>Eukaryote:</strong> An organism with cells that have a nucleus and membrane-bound organelles.</li>
                                    <li><strong>DNA:</strong> Deoxyribonucleic acid, a molecule carrying genetic information in cells.</li>
                                </ul>
                            </Magic>

                            <Magic doneState={ magicDone }>
                                <p class={buttonStyles.button}>Quiz me on this vocbaulary</p>
                            </Magic>

                        </div>
                    </div>
                </div>
            </div>
        </AnimationContainer>
    )
}