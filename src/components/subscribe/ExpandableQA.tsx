import { Show, createSignal } from 'solid-js';
import styles from './ExpandableQA.module.css'

interface Props {
    question: string;
    answer: string;
}

export default function ExpandableQA(props: Props) {
    const [ open, setOpen ] = createSignal<boolean>(false);

    return (
        <div class={styles.qa}>
            <div class={styles.row} onClick={ () => setOpen(!open()) }>
                <p>{props.question}</p>

                {/* https://icon-sets.iconify.design/fe/arrow-down/ */}
                <svg classList={{
                    [styles.close]: true,
                    [styles.opened]: open()
                }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="feArrowDown0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="feArrowDown1" fill="currentColor"><path id="feArrowDown2" d="m6 7l6 6l6-6l2 2l-8 8l-8-8z"/></g></g></svg>
            </div>

            <p classList={{
                [styles.answer]: true,
                [styles.opened]: open()
            }}>{props.answer}</p>
        </div>
    )
}