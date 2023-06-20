import { Accessor, children } from 'solid-js';
import styles from './Magic.module.css';

interface Props {
    doneState: Accessor<boolean>,
    children: any
}

export default function Magic(props: Props) {
    const c = children(() => props.children);

    return (
        <div classList={{
            [styles.magic]: true,
            [styles.done]: props.doneState()
        }}>
            <div style={{
                'opacity': props.doneState() ? 1 : 0
            }}>
                { c() } 
            </div>
        </div>
    )
}