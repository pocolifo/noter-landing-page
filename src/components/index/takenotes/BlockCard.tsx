import styles from './BlockCard.module.css';

interface BlockCardProps {
    name: string;
    icon: any;
    ref: any;
}

export default function BlockCard(props: BlockCardProps) {
    return (
        <div class={styles.blockCard} ref={props.ref}>
            { props.icon }
            <h2>{ props.name }</h2>
        </div>
    )
}