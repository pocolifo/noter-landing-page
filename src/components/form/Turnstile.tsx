const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA';

export default function Turnstile() {
    return (
        <>
            <div class="cf-turnstile" data-sitekey={ SITE_KEY } data-theme="light" style={{ "margin-top": "1rem" }}></div>
            <script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
        </>
    )
}
