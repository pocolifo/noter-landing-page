/// <reference types="astro/client" />
declare namespace App {
    interface Locals {
        user: null | {
            email: string,
            email_verified: boolean,
            has_noter_access: boolean
        },
    }
}