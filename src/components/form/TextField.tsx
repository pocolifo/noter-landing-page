import { createSignal } from "solid-js";

interface TextFieldProps {
    maxCharacters: number;
}

export default function TextField(props: TextFieldProps) {
    const [ characterCountText, setCharacterCountText ] = createSignal<string>(`${props.maxCharacters} characters max`);
    const [ characterCountColor, setCharacterCountColor ] = createSignal<string>('inherit');

    function onKeyupCallback(e: Event) {
        let target = e.currentTarget as HTMLTextAreaElement;
        let charactersLeft = props.maxCharacters - target.value.length;

        setCharacterCountText(target.value.length > 0 ? `${charactersLeft} characters left` : `${props.maxCharacters} characters max`);
        setCharacterCountColor(charactersLeft > 0 ? 'inherit' : '#ff0000');
    }

    return (
        <>
            <small style={{ 'color': characterCountColor() }}>{characterCountText()}</small>

            <textarea id="text" spellcheck={true} autocapitalize="on" name="text" required onKeyUp={ e => onKeyupCallback(e) }></textarea>
        </>
    )
}