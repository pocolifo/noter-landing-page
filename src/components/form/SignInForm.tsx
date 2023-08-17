import { Show, createEffect, createSignal } from "solid-js";
import Turnstile from "./Turnstile";

import LoadingSpinner from "../LoadingSpinner";
import styles from './Form.module.css';

export default function SignInForm() {
    const [ isFormSubmitting, setFormSubmitting ] = createSignal<boolean>(false);
    const [ formStatus, setFormStatus ] = createSignal<string | null>(null);

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
            if (result.status === 204) {
                window.location.replace('/');
            } else {
                result.text().then(txt => setFormStatus(txt));
            }
        })
        .catch(err => {
            setFormStatus("There was an error. We'll fix this as soon as possible!");
        })
        .finally(() => setFormSubmitting(false));
    }

    return (
        <>
            <form method="post" enctype="multipart/form-data" action="/async/sign-in" onSubmit={ async e => handleAsyncFormSubmission(e) }>
                <div class={styles.field}>
                    <label for="email">Your email address</label>
                    <input id="email" type="email" name="email" required />
                </div>
                
                <div class={styles.field}>
                    <label for="password">Your password</label>
                    <input id="password" type="password" name="password" required />
                </div>

                <button disabled={isFormSubmitting()} type="submit" class={styles.flex} name="sign-in">
                    <Show when={isFormSubmitting()}>
                        <LoadingSpinner />
                    </Show>

                    Sign in
                </button>
            
                <Turnstile />
            </form>

            <Show when={formStatus() !== null}>
                <p classList={{
                    [styles.formStatus]: true
                }}>
                    { formStatus() }
                </p>
            </Show>
        </>
    )
}