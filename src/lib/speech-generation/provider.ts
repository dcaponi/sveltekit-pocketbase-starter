export interface SpeechGenerationProvider {
  /**
   * Gets a script to be read aloud
   * Returns a script
   */
  getTrack(voice: string, text: string): Promise<ReadableStream<Uint8Array<ArrayBufferLike>> | null>;
}
