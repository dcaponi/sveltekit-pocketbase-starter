import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { SpeechGenerationProvider } from "./provider";

export class ElevenLabsSpeechGenerationProvider implements SpeechGenerationProvider {
    client: ElevenLabsClient;
    modelId = "eleven_multilingual_v2"

    constructor(apiKey: string) {
        this.client = new ElevenLabsClient({apiKey})
    }


    public getTrack = async (voice: string, text: string): Promise<ReadableStream<Uint8Array<ArrayBufferLike>> | null> => {
        return await this.client.textToSpeech.convert(voice, {
            text, modelId: this.modelId,
        });
    }

    public listVoices = async(): Promise<Array<string> | null>  => {
        const voices = await this.client.voices.getAll();
        // todo there needs to be a type that packs up id, description, and a sample (if practical)
        return voices.voices.map(voice => voice.voiceId);
    }
}