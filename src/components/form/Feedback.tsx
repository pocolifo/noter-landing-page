import IconCheck from "../icon/IconCheck";
import IconCross from "../icon/IconCross";
import styles from "./Feedback.module.css";

interface Props {
    feedback: string | null;
}

export default function Feedback(props: Props) {
    return (
        <div classList={{ [styles.feedback]: true, [styles.success]: props.feedback === null }}>
            { props.feedback === null ? <IconCheck /> : <IconCross /> }
            <span>{ props.feedback || 'Looks good!' }</span>
        </div>
    )
}