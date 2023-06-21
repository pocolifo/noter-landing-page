import { Setter, createSignal } from 'solid-js';
import styles from './NoteTakingAnimation.module.css';
import blockLibraryStyles from './BlockLibrary.module.css';
import AddBlock from './AddBlock';
import type { MouseController } from '../Mouse';
import BlockCard from './BlockCard';
import BlockLibrary from './BlockLibrary';
import AnimationStarter, { AnimationContainerType } from '../AnimationContainer';
import AnimationContainer from '../AnimationContainer';

const NOTES = [
    'Biology is the study of living organisms and their interactions with the environment',
    'Cells are the basic block of life',
    'Genetics: heredity, DNA structure, inheritance patterns'
];

const JOINED_NOTES = NOTES.join("\n");
const IMAGE_URL = 'https://unsplash.com/photos/8o_LkMpo8ug/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8NXx8ZG5hfGVufDB8MHx8fDE2ODcxOTA3ODZ8MA&force=true&w=640';

export default function NoteTakingAnimation() {
    const [ characterIndex, setCharacterIndex ] = createSignal<number>(0);
    let image: HTMLImageElement | undefined = undefined;
    let addBlock: HTMLElement | undefined = undefined;
    let library: HTMLDivElement | undefined = undefined;
    let textBlockButton: HTMLDivElement | undefined = undefined;
    let textBlock: HTMLDivElement | undefined = undefined;

    async function runAnimation(controller: MouseController) {
        if (addBlock === undefined || image === undefined || library === undefined || textBlockButton === undefined || textBlock === undefined) return;

        setCharacterIndex(0);
        image.classList.add(styles.hideImage);
        library.classList.add(blockLibraryStyles.hidden);
        textBlock.classList.add(styles.hideTextBlock);
        textBlock.innerHTML = "This is your new text block";
        controller.goTo(textBlockButton);
        controller.setAttachedImage(IMAGE_URL);
        await controller.wait(500);
        controller.show();

        await controller.move(addBlock);
        await controller.wait(500);
        
        controller.setAttachedImage(undefined);
        image.classList.remove(styles.hideImage);

        await controller.wait(250);
        await controller.move(addBlock);
        
        await controller.click(addBlock);
        library.classList.remove(blockLibraryStyles.hidden);

        await controller.wait(250);
        await controller.move(textBlockButton);
        
        await controller.click(textBlockButton);
        library.classList.add(blockLibraryStyles.hidden);
        textBlock.classList.remove(styles.hideTextBlock);

        await controller.move(textBlock);
        await controller.click(null);

        // Typing animation
        await new Promise<void>((resolve, reject) => {
            let interval = setInterval(() => {
                if (textBlock === undefined) return;
    
                setCharacterIndex(characterIndex() + 3);
                textBlock.innerHTML = JOINED_NOTES.substring(0, characterIndex()).replaceAll("\n", "<br />");

                if (characterIndex() > JOINED_NOTES.length) {
                    clearInterval(interval);
                    resolve();
                }
            }, 25);
        });

        await controller.move(textBlock);
        await controller.click(textBlock);

        textBlock.innerHTML = `<ul>${NOTES.map(val => `<li>${val}</li>`).join("")}</ul>`;

        controller.hide();
    }

    return (
        <AnimationContainer type={AnimationContainerType.PHONE} animateFunction={runAnimation}>
            <div class={styles.container}>
                <h1 class={styles.title}>1.1 Biology Review</h1>

                <img src={IMAGE_URL} ref={image} class={`${styles.hideImage} ${styles.contentImage}`} />
                <div ref={textBlock} class={`${styles.textBlock} ${styles.hideTextBlock}`}>This is your new text block</div>

                <AddBlock ref={addBlock} />

                <BlockLibrary ref={library}>
                    <BlockCard ref={textBlockButton} name="Text" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="feTextAlignLeft0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="feTextAlignLeft1" fill="currentColor"><path id="feTextAlignLeft2" d="M19 7H5a1 1 0 1 1 0-2h14a1 1 0 0 1 0 2Zm-4 4H5a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2Zm4 4H5a1 1 0 0 1 0-2h14a1 1 0 0 1 0 2Zm-4 4H5a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2Z"/></g></g></svg>} />
                    <BlockCard ref={undefined} name="Image" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="fePictureSquare0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="fePictureSquare1" fill="currentColor" fill-rule="nonzero"><path id="fePictureSquare2" d="M5 5v14h14V5H5Zm0-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3.5 7a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3ZM7 14l2-2l2 2l3-3l3 3v3H7v-3Z"/></g></g></svg>} />
                    <BlockCard ref={undefined} name="Header" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="feTextSize0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="feTextSize1" fill="currentColor"><path id="feTextSize2" d="m13.5 16.494l2.408-7.224h2.182L21 17.995h-1.968l-.569-1.927h-2.966l-.643 1.927h-.853l.002.005h-2.707l-.782-2.65h-4.08L5.55 18H3L7 6h3l3.5 10.494ZM7 13h3L8.496 9L7 13Zm8.908 1.36h2.182l-1.094-2.909l-1.088 2.909Z"/></g></g></svg>} />
                    <BlockCard ref={undefined} name="Table" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="feTable0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="feTable1" fill="currentColor" fill-rule="nonzero"><path id="feTable2" d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Zm9 10v4h7v-4h-7Zm-9 0v4h7v-4H4Zm9-6v4h7V8h-7ZM4 8v4h7V8H4Z"/></g></g></svg>} />
                </BlockLibrary>
            </div>
        </AnimationContainer>
    )
}