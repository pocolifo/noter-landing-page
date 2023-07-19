import { Show, createResource } from "solid-js";
import { API_URL } from "../../pages/async/utils";
import LoadingSpinner from "../LoadingSpinner";
import styles from "./EmailVerifier.module.css"
import ButtonLink from "../ButtonLink";
import EmailVerifiedMessage from "./EmailVerifiedMessage";

interface Props {
    verificationId: string | null;
}

export default function EmailVerifier(props: Props) {
    const url = `${API_URL}/verify?${new URLSearchParams({
        id: props.verificationId || '',
    })}`;

    const [ verifier ] = createResource(async () => await fetch(url));

    return (
        <Show when={ verifier.loading } fallback={
            <Show when={ verifier()?.status === 204 } fallback={
                <>                    
                    <h2>Email verification failed</h2>
                    <p>Try clicking the link in your inbox again or resending the email.</p>
                </>
            }>
                <EmailVerifiedMessage />
            </Show>
        }>
            <div class={styles.grid}>
                <LoadingSpinner />
                <h2>Verifying your email...</h2>
            </div>
            
            <p style={{ margin: 0 }}>Please wait while we verify your email. It will only take a few seconds.</p>
        </Show>
    )
}