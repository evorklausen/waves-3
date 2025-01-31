export interface LlamaFunctionParameter {
  type: string;
  description?: string;
  enum?: string[];
}

export interface LlamaFunction {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, LlamaFunctionParameter>;
    required?: string[];
  };
}

export interface LlamaMessage {
  role: "user" | "assistant";
  content: string;
}

export interface LlamaRequest {
  messages: LlamaMessage[];
  functions?: LlamaFunction[];
  stream?: boolean;
  function_call?: string;
}

export interface LlamaResponse {
  // Add response type definitions based on actual API response
  content: string;
  role: string;
}