import ButtonLink from "../ButtonLink";

export default function EmailVerifiedMessage() {
    return (
        <>
            <h2>Email verified successfully</h2>
            <p>Let's select your plan for Noter. After you select your plan, you'll checkout.</p>
            <ButtonLink href="/plans">Continue to plans</ButtonLink>
        </>
    )
}