import { Accessor, Setter, Show, Signal, createEffect, createSignal, onMount } from "solid-js";
import styles from './Mouse.module.css';

const CLICK_DURATION = 500;
const MOVE_DURATION = 1000;

export class MouseController {
    private mouse: HTMLDivElement;
    private currentAnimation: Animation | null;
    public setAttachedImage: Setter<string | undefined>;

    constructor(mouse: HTMLDivElement, setAttachedImage: Setter<string | undefined>) {
        this.mouse = mouse;
        this.setAttachedImage = setAttachedImage;
        this.currentAnimation = null;
    }

    private getElementVerticalCenter(element: HTMLElement) {
        let rect = element.getBoundingClientRect();
        return rect.top + rect.height / 2 + window.scrollY;
    }

    private getElementHorizontalCenter(element: HTMLElement) {
        let rect = element.getBoundingClientRect();
        return rect.left + rect.width / 2 + window.scrollX;
    }

    async click(element: HTMLElement | null) {
        this.currentAnimation = this.mouse.animate([{
            transform: 'scale(1)'
        }, {
            transform: 'scale(0.7)'
        }, {
            transform: 'scale(1)'
        }], {
            duration: CLICK_DURATION,
            iterations: 1,
            easing: 'ease',
            fill: "forwards"
        });

        if (element !== null) {
            element.animate([{
                transform: 'scale(1)'
            }, {
                transform: 'scale(0.7)'
            }, {
                transform: 'scale(1)'
            }], {
                duration: CLICK_DURATION,
                iterations: 1,
                easing: 'ease',
                fill: "forwards"
            });
        }

        return this.wait(CLICK_DURATION);
    }

    async move(element: HTMLElement) {
        this.currentAnimation = this.mouse.animate([{
            top: `${this.getElementVerticalCenter(element)}px`,
            left: `${this.getElementHorizontalCenter(element)}px`
        }], {
            duration: MOVE_DURATION,
            iterations: 1,
            easing: 'ease',
            fill: "forwards"
        });

        return this.wait(MOVE_DURATION);
    }

    goTo(element: HTMLElement) {
        this.currentAnimation = this.mouse.animate([{
            top: `${this.getElementVerticalCenter(element)}px`,
            left: `${this.getElementHorizontalCenter(element)}px`
        }], {
            duration: 0,
            iterations: 1,
            easing: 'ease',
            fill: "forwards"
        });
    }

    show() {
        this.mouse.classList.remove(styles.hidden);
    }

    hide() {
        this.mouse.classList.add(styles.hidden);
    }

    async wait(duration: number) {
        return new Promise((resolve, reject) => {
            setTimeout(resolve, duration);
        });
    }
}

interface Props {
    attachedImage: Accessor<string | undefined>,
    setAttachedImage: Setter<string | undefined>,
    ref: any
}

export default function Mouse(props: Props) {
    return (
        // https://icon-sets.iconify.design/fa-solid/mouse-pointer/
        <div ref={props.ref} class={`${styles.hidden} ${styles.container}`}>
            <Show when={props.attachedImage() !== undefined}>
                <img src={props.attachedImage()} class={styles.image} alt='Image being dragged by a cursor' />
            </Show>

            <svg xmlns="http://www.w3.org/2000/svg" width="320" height="512" viewBox="0 0 320 512" style={{
                width: "2rem",
                height: "2rem",
                "z-index": 10
            }}>
                <path fill="currentColor" d="M302.189 329.126H196.105l55.831 135.993c3.889 9.428-.555 19.999-9.444 23.999l-49.165 21.427c-9.165 4-19.443-.571-23.332-9.714l-53.053-129.136l-86.664 89.138C18.729 472.71 0 463.554 0 447.977V18.299C0 1.899 19.921-6.096 30.277 5.443l284.412 292.542c11.472 11.179 3.007 31.141-12.5 31.141z" />
            </svg>
        </div>
    )
}