import { Show, createEffect, createSignal } from "solid-js";
import Turnstile from "./Turnstile";

import styles from './Form.module.css';
import registerFormStyles from './RegisterForm.module.css';
import Link from "../Link.astro";
import LoadingSpinner from "../LoadingSpinner";

export default function RegisterForm() {
    const [ isFormSubmitting, setFormSubmitting ] = createSignal<boolean>(false);
    const [ formStatus, setFormStatus ] = createSignal<string | null>(null);
    const [ submissionSuccess, setSubmissionSuccess ] = createSignal<boolean>(false);
    const [ submittedRegistration, setSubmittedRegistration ] = createSignal<boolean>(false);
    const [ submittedResend, setSubmittedResend ] = createSignal<boolean>(false);

    async function handleAsyncFormSubmission(e: SubmitEvent) {
        setFormSubmitting(true);

        e.preventDefault();
        let target = e.currentTarget as HTMLFormElement;
        let formData = new FormData(target);
        
        fetch(target.action, {
            method: 'POST',
            body: formData
        })
        .then(result => {
            setSubmissionSuccess(result.status === 200);
            result.text().then(txt => setFormStatus(txt));
        })
        .catch(err => {
            setSubmissionSuccess(false);
            setFormStatus("There was an error. We'll fix this as soon as possible!");
        })
        .finally(() => setFormSubmitting(false));
    }

    createEffect(() => {
        if (submissionSuccess() && !submittedRegistration()) {
            setSubmittedRegistration(true);
        }
    })

    return (
        <>
            <Show when={formStatus() !== null}>
                <p classList={{
                    [styles.formStatus]: true,
                    [styles.success]: submissionSuccess()
                }}>
                    { formStatus() }
                </p>
            </Show>

            <Show when={ submittedRegistration() } fallback={
                <form method="post" enctype="multipart/form-data" action="/async/register" onSubmit={ async e => handleAsyncFormSubmission(e) }>
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


                    <button disabled={isFormSubmitting()} type="submit" class={registerFormStyles.flex} name="create-account">
                        <Show when={isFormSubmitting()}>
                            <LoadingSpinner />
                        </Show>

                        Create account
                    </button>
                
                    <Turnstile />
                </form>
            }>
                <form method="post" enctype="multipart/form-data" action="/async/resend-email" onSubmit={ async e => handleAsyncFormSubmission(e).then(() => setSubmittedResend(true)) }>
                    <h3>Didn't get the email?</h3>
                    <p>If you didn't get the email we sent you, you can resend it if you need.</p>
                    
                    <button disabled={isFormSubmitting()} type="submit" class={registerFormStyles.flex} name="create-account">
                        <Show when={isFormSubmitting()} fallback={
                            <Show when={ submittedResend() }>
                                { /* mdi:check https://icon-sets.iconify.design/mdi/check/ */ }
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M21 7L9 19l-5.5-5.5l1.41-1.41L9 16.17L19.59 5.59L21 7Z"/></svg>
                            </Show>
                        }>
                            <LoadingSpinner />
                        </Show>

                        Resend email
                    </button>
                </form>
            </Show>
        </>
    )
}