import { Show, createEffect, createSignal } from "solid-js";
import Turnstile from "./Turnstile";

import LoadingSpinner from "../LoadingSpinner";
import styles from './Form.module.css';

interface Props {
    defaultSubmittedRegistration: boolean;
}

export default function RegisterForm(props: Props) {
    const [ isFormSubmitting, setFormSubmitting ] = createSignal<boolean>(false);
    const [ formStatus, setFormStatus ] = createSignal<string | null>(null);
    const [ submissionSuccess, setSubmissionSuccess ] = createSignal<boolean>(false);
    const [ submittedRegistration, setSubmittedRegistration ] = createSignal<boolean>(props.defaultSubmittedRegistration);
    const [ submittedResend, setSubmittedResend ] = createSignal<boolean>(false);
    const [ emailAddress, setEmailAddress ] = createSignal<string>('');

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
            if (result.headers.get('X-GetNoter-Turnstile') === 'refresh') {
                turnstile.reset('.cf-turnstile');
            }
            
            setSubmissionSuccess(result.status === 200);
            result.text().then(txt => setFormStatus(txt));
        })
        .catch(err => {
            console.log(err);
            setSubmissionSuccess(false);
            setFormStatus("There was an error. We'll fix this as soon as possible!");
        })
        .finally(() => setFormSubmitting(false));
    }

    createEffect(() => {
        if (submissionSuccess() && !submittedRegistration()) {
            setSubmittedRegistration(true);
        }
    });

    return (
        <>
            <Show when={ submittedRegistration() } fallback={
                <form method="post" enctype="multipart/form-data" action="/async/register" onSubmit={ async e => handleAsyncFormSubmission(e) }>
                    <div class={styles.field}>
                        <label for="email">Your email address</label>
                        <input id="email" type="email" name="email" required onChange={ e => setEmailAddress(e.target.value) }/>
                    </div>
                    
                    <div class={styles.field}>
                        <label for="password">Your password</label>
                        <input id="password" type="password" name="password" required />
                    </div>

                    <div class={styles.field}>
                        <label for="confirm-password">Type your password again</label>
                        <input id="confirm-password" type="password" name="confirm-password" required />
                    </div>


                    <button disabled={isFormSubmitting()} type="submit" class={styles.flex} name="create-account">
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
                    <p>We just sent an email to <strong>{ emailAddress() }</strong>. If you didn't get it, you can resend it if you need. Wrong email? Go back and rewrite your email and new password.</p>
                    
                    <div class={styles.buttonFlex}>
                        <a class={`${styles.flex} ${styles.button}`} href="/register?r">
                            {/* https://icon-sets.iconify.design/fe/arrow-left/ */}
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g id="feArrowLeft0" fill="none" fill-rule="evenodd" stroke="none" stroke-width="1"><g id="feArrowLeft1" fill="currentColor"><path id="feArrowLeft2" d="m15 4l2 2l-6 6l6 6l-2 2l-8-8z"/></g></g></svg>
                            Back
                        </a>

                        <button disabled={isFormSubmitting()} type="submit" class={styles.flex} name="resend-email">
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
                    </div>
                    
                    <Turnstile />
                </form>
            </Show>

            <Show when={formStatus() !== null}>
                <p classList={{
                    [styles.formStatus]: true,
                    [styles.success]: submissionSuccess()
                }}>
                    { formStatus() }
                </p>
            </Show>
        </>
    )
}