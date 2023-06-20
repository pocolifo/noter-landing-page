import styles from "./AudioBar.module.css";

export default function AudioBar() {

    return (
        <div class={styles.bar} style={{
            height: `${Math.random() * 80 + 50}px`,
            "animation-delay": `${Math.random()}s`
        }}></div>
    )
}