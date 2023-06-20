import styles from "./BlockLibrary.module.css";
import BlockCard from "./BlockCard";
import { children } from "solid-js";

export default function BlockLibrary(props: any) {
    const c = children(() => props.children);

    return (
        <div class={`${styles.blocksContainer} ${styles.hidden}`} ref={props.ref}>
            <div style={{ padding: "1rem" }}>
                <h1>Add block</h1>

                <div class={styles.grid}>
                    { c() }
                </div>
            </div>
        </div>
    )
}