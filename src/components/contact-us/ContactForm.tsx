import { For, Show, createSignal } from "solid-js";
import TextField from "./TextField";
import Turnstile from "./Turnstile";
import contactMetadata from "./contact-us-metadata.json";

import styles from './ContactForm.module.css';


export default function ContactForm() {
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
        <form method="post" enctype="multipart/form-data" action="/async/contact-us" onSubmit={ async e => handleFormSubmission(e) }>
            <div class={styles.field}>
                <label for="reason-for-contact">Reason for contact</label>

                <select id="reason-for-contact" name="reason-for-contact" required>
                    <For each={contactMetadata.reasons}>
                        {((reason, _) => <option>{reason}</option>)}
                    </For>
                </select>
            </div>

            <div class={styles.field}>
                <label for="subject">Subject</label>
                <input id="subject" type="text" name="subject" required />
            </div>

            <div class={styles.field}>
                <label for="email">Your email address</label>
                <input id="email" type="email" name="email" required />
            </div>
            
            <div class={styles.field}>
                <label for="text">Your words</label>
                <TextField maxCharacters={contactMetadata.messageMaxLength} />
            </div>

            {/* Cloudflare Turnstile to protect against bots */}
            <Turnstile />

            <input type="submit" value="Send" disabled={isFormSubmitting()} />

            <Show when={formStatus() !== null}>
                <p classList={{
                    [styles.formStatus]: true,
                    [styles.success]: submissionSuccess()
                }}>{ formStatus() }</p>
            </Show>
        </form>
    )
}