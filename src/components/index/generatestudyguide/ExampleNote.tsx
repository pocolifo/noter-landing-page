import styles from './ExampleNote.module.css'

interface Props {
    name: string;
}

export default function ExampleNote(props: Props) {
    return (
        <div class={styles.flex}>
            <p>{ props.name }</p>

            {/* https://icon-sets.iconify.design/fe/plus/ */}
            <svg class={styles.icon} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="fePlus0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="fePlus1" fill="currentColor"><path id="fePlus2" d="M13 13v7a1 1 0 0 1-2 0v-7H4a1 1 0 0 1 0-2h7V4a1 1 0 0 1 2 0v7h7a1 1 0 0 1 0 2h-7Z"/></g></g></svg>
        </div>
    )
}