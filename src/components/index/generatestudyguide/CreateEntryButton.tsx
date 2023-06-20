import styles from './CreateEntryButton.module.css'

interface Props {
    name: string;
    color: string;
    icon: any;
    ref?: any;
}

export default function CreateEntryButton(props: Props) {
    return (
        <div class={styles.entry} ref={props.ref}>
            <div class={styles.button} style={{ background: props.color }}>
                { props.icon }
            </div>

            <p>{ props.name }</p>
        </div>
    )
}