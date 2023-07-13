import { Show, createSignal } from "solid-js";
import Turnstile from "./Turnstile";

import styles from './Form.module.css';

export default function RegisterForm() {
    const [ isFormSubmitting, setFormSubmitting ] = createSignal<boolean>(false);
    const [ formStatus, setFormStatus ] = createSignal<string | null>(null);
    const [ submissionSuccess, setSubmissionSuccess ] = createSignal<boolean>(false);

    async function handleFormSubmission(e: SubmitEvent) {
        setFormSubmitting(true);

        e.preventDefault();
        let target = e.currentTarget as HTMLFormElement;
        let formData = new FormData(target);

        const result = await fetch(target.action, {
            method: 'POST',
            body: formData
        });

        setSubmissionSuccess(result.status == 200);
        setFormStatus(await result.text());
        setFormSubmitting(false);
    }

    return (
        <form method="post" enctype="multipart/form-data" action="/async/register" onSubmit={ async e => handleFormSubmission(e) }>
            <div class={styles.field}>
                <label for="email">Your email address</label>
                <input id="email" type="email" name="email" required />
            </div>
            
            <div class={styles.field}>
                <label for="password">Your password</label>
                <input id="password" type="password" name="password" required />
            </div>

            <div class={styles.field}>
                <label for="confirm-password">Type your password again</label>
                <input id="confirm-password" type="password" name="confirm-password" required />
            </div>

            <Turnstile />

            <input type="submit" value="Create account" disabled={isFormSubmitting()} />

            <Show when={formStatus() !== null}>
                <p classList={{
                    [styles.formStatus]: true,
                    [styles.success]: submissionSuccess()
                }}>{ formStatus() }</p>
            </Show>
        </form>
    )
}