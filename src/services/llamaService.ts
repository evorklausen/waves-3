import fetchWithProxy from 'fetch-with-cors-proxy';

const API_URL = 'http://localhost:3000';  // Your local Express server

const u='http://localhost:3000';export class LlamaService {
  constructor(private apiKey: string) {}

  async run(prompt: string): Promise<{ content: string }> {
    try {
      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({ prompt }),
        redirect: 'follow',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Validate the response data
      if (!data || !data.content) {
        throw new Error("Invalid response format");
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
}

export const createLlamaService = (apiKey: string) => new LlamaService(apiKey);
