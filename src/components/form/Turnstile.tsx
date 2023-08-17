import { onMount } from "solid-js";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export default function Turnstile() {
    onMount(() => {
        if ('turnstile' in window) {
            turnstile.ready(() => {
                turnstile.render('.cf-turnstile', {
                    sitekey: SITE_KEY,
                    theme: 'light',
                    refresh_expired: 'auto'
                });
            });
        }
    })

    return (
        <>
            <div class="cf-turnstile" data-sitekey={ SITE_KEY } data-theme="light" data-refresh-expired="auto" style={{ "margin-top": "1rem" }}></div>
        </>
    )
}
