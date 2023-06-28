// https://commons.wikimedia.org/wiki/File:Simple_transcription_elongation1_NL.svg
const NoteTakingImage = "data:image/png;base64,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";

export default NoteTakingImage;