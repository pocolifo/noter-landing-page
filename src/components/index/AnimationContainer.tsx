import { children, createEffect, createSignal, onCleanup, onMount } from "solid-js"
import { MouseController } from "./Mouse"
import Mouse from "./Mouse";
import styles from './AnimationContainer.module.css'

interface Props {
    animateFunction: Awaited<(controller: MouseController) => void>,
    startThreshold?: number,
    children: any,
    type: AnimationContainerType,
    noRestart?: boolean
}

export enum AnimationContainerType {
    PHONE,
    DESKTOP
}

const DEFAULT_THRESHOLD = 0.7;

export default function AnimationContainer(props: Props) {
    const [ attachedImage, setAttachedImage ] = createSignal<string | undefined>(undefined);
    const c = children(() => props.children);
    let container: HTMLDivElement | undefined = undefined;
    let mouse: HTMLDivElement | undefined = undefined;
    let intersectionObserver: IntersectionObserver | undefined = undefined;
    let animationInProgress: boolean = false;

    async function startAnimation() {
        if (mouse !== undefined && !animationInProgress) {
            animationInProgress = true;
            await props.animateFunction(new MouseController(mouse, setAttachedImage));
            animationInProgress = false;
        }
    }

    onMount(() => {
        if (container !== undefined && props.noRestart === undefined) {
            let intersectionObserverOptions = {
                threshold: props.startThreshold || DEFAULT_THRESHOLD
            };

            intersectionObserver = new IntersectionObserver(
                ([entries]) => {
                    if (entries.isIntersecting)
                        startAnimation();
                },
                intersectionObserverOptions
            );

            intersectionObserver.observe(container);
        } else if (props.noRestart)
            startAnimation();
    });

    onCleanup(() => {
        if (intersectionObserver)
            intersectionObserver.disconnect()
    });
    
    return (
        <div ref={container} classList={{
            [styles.animationContainer]: true,
            [styles.phone]: props.type === AnimationContainerType.PHONE,
            [styles.desktop]: props.type === AnimationContainerType.DESKTOP
        }}>
            <Mouse attachedImage={attachedImage} setAttachedImage={setAttachedImage} ref={mouse} />
            
            { c() }
        </div>
    )
}