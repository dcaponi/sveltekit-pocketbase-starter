import type { SpeechGenerationProvider } from "./provider";

export const TIKTOK_VOICES = [
    // DISNEY VOICES
    "en_us_ghostface",
    "en_us_chewbacca",
    "en_us_c3po",
    "en_us_stitch",
    "en_us_stormtrooper",
    "en_us_rocket",
    // ENGLISH VOICES
    "en_au_001",
    "en_au_002",
    "en_uk_001",
    "en_uk_003",
    "en_us_001",
    "en_us_002",
    "en_us_006",
    "en_us_007",
    "en_us_009",
    "en_us_010",
    // EUROPE VOICES
    "fr_001",
    "fr_002",
    "de_001",
    "de_002",
    "es_002",
    // AMERICA VOICES
    "es_mx_002",
    "br_001",
    "br_003",
    "br_004",
    "br_005",
    // ASIA VOICES
    "id_001",
    "jp_001",
    "jp_003",
    "jp_005",
    "jp_006",
    "kr_002",
    "kr_003",
    "kr_004",
    // SINGING VOICES
    "en_female_f08_salut_damour",
    "en_male_m03_lobby",
    "en_female_f08_warmy_breeze",
    "en_male_m03_sunshine_soon",
    // OTHER
    "en_male_narration",
    "en_male_funny",
    "en_female_emotional"
  ] as const;
  
  export type TiktokVoice = (typeof TIKTOK_VOICES)[number];

export class TikTokSpeechGenerationProvider implements SpeechGenerationProvider {
    TIKTOK_CHAR_LIMIT = 250
    TIKTOK_TTS_URL = "https://tiktok-tts.weilnet.workers.dev/api/generation"

    constructor() {}

    public getTrack = async (voice: TiktokVoice, text: string): Promise<ReadableStream<Uint8Array<ArrayBufferLike>> | null> => {
        try {
            if (text.length < this.TIKTOK_CHAR_LIMIT) {
                const base64 = await this.fetchTTSChunk(text, voice);
                return this.toReadableStream(this.base64ToUint8Array(base64));
            } else {
                const textParts = this.splitString(text, this.TIKTOK_CHAR_LIMIT);
                const base64Chunks = await Promise.all(
                    textParts.map((part) => this.fetchTTSChunk(part, voice))
                );
                const fullBase64 = base64Chunks.join('');
                return this.toReadableStream(this.base64ToUint8Array(fullBase64));
            }
        } catch(e) {
            console.log("[tiktok tts error]:", e)
            return null
        }
    }

    public listVoices = async(): Promise<Array<string> | null> => {
        return Promise.resolve([...TIKTOK_VOICES])
    }

    private toReadableStream = (data: Uint8Array): ReadableStream<Uint8Array> => {
		return new ReadableStream<Uint8Array>({
			start(controller) {
				controller.enqueue(data);
				controller.close();
			}
		});
	};

    private base64ToUint8Array = (base64: string): Uint8Array => {
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes;
    }

    private fetchTTSChunk = async (text: string, voice: string): Promise<string> => {
        const response = await fetch(this.TIKTOK_TTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice })
        });
      
        if (!response.ok) {
            console.log(response)
          throw new Error(`TTS chunk fetch failed: ${response.statusText}`);
        }
      
        const json = await response.json();
        return json.data; // assuming the base64 string is in `data`
      }

    private splitString = (text: string, maxLen: number): string[] => {
        const parts: string[] = [];
        let start = 0;
        while (start < text.length) {
          parts.push(text.slice(start, start + maxLen));
          start += maxLen;
        }
        return parts;
      }
}