import { children } from "solid-js";
import styles from "./ButtonLink.module.css"

interface Props {
    href: string;
    children: any;
}

export default function ButtonLink(props: Props) {
    const c = children(() => props.children);
    
    return <a {...props} class={styles.link}>{ c() }</a>
}