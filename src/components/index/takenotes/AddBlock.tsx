import styles from './AddBlock.module.css';

export default function AddBlock(props: any) {
    return (
        <p class={styles.block} ref={props.ref}>
            + Add block or drop media
        </p>
    )
}