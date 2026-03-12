import * as webllm from "@mlc-ai/web-llm";

export interface InferenceProgress {
  status: string;
  progress: number;
  modelId?: string;
}

type ProgressListener = (p: InferenceProgress) => void;

class InferenceService {
  private engine: webllm.MLCEngine | null = null;
  private currentModelId: string | null = null;
  private initPromise: Promise<webllm.MLCEngine> | null = null;
  private listeners: Set<ProgressListener> = new Set();
  private lastProgress: InferenceProgress | null = null;

  subscribe(listener: ProgressListener) {
    this.listeners.add(listener);
    if (this.lastProgress) listener(this.lastProgress);
    return () => this.listeners.delete(listener);
  }

  private notify(p: InferenceProgress) {
    this.lastProgress = p;
    this.listeners.forEach(l => l(p));
  }

  async initEngine(modelId: string, modelUrl?: string) {
    // If already initialized with this model, return it
    if (this.currentModelId === modelId && this.engine) return this.engine;
    
    // If initialization is already in progress for this model, wait for it
    if (this.currentModelId === modelId && this.initPromise) return this.initPromise;

    // If switching models, unload first
    if (this.engine || this.initPromise) {
      await this.unload();
    }

    this.currentModelId = modelId;
    this.initPromise = (async () => {
      try {
        const appConfig = modelUrl ? {
          model_list: [
            {
              model_id: modelId,
              model: modelUrl,
              model_lib: webllm.modelLibURLPrefix + webllm.modelVersion + "/" + modelId + "-ctx4k_cs1k-webgpu.wasm" // We might need a generic lib or let webllm handle it if possible. Usually custom models need a matching lib. We'll let webllm try to resolve it or fallback.
            }
          ]
        } : undefined;

        const engine = await webllm.CreateMLCEngine(modelId, {
          initProgressCallback: (report) => {
            this.notify({
              status: report.text,
              progress: report.progress,
              modelId
            });
          },
          appConfig
        });

        this.engine = engine;
        this.initPromise = null;
        return engine;
      } catch (error) {
        this.engine = null;
        this.currentModelId = null;
        this.initPromise = null;
        this.notify({ status: 'Failed to load model', progress: 0, modelId });
        throw error;
      }
    })();

    return this.initPromise;
  }

  async generate(messages: webllm.ChatCompletionMessageParam[], onToken?: (token: string) => void) {
    if (!this.engine) throw new Error("Engine not initialized");

    const temperature = parseFloat(localStorage.getItem('nova_temperature') || '0.7');
    const top_p = parseFloat(localStorage.getItem('nova_topP') || '0.9');
    const max_tokens = parseInt(localStorage.getItem('nova_maxTokens') || '2048', 10);

    const chunks = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature,
      top_p,
      max_tokens,
    });

    let fullText = "";
    for await (const chunk of chunks) {
      const content = chunk.choices[0]?.delta?.content || "";
      fullText += content;
      if (onToken) onToken(content);
    }

    return fullText;
  }

  async unload() {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
    }
    this.initPromise = null;
    this.currentModelId = null;
    this.lastProgress = null;
  }

  getCurrentModelId() {
    return this.currentModelId;
  }

  isInitializing() {
    return !!this.initPromise;
  }
}

export const inferenceService = new InferenceService();
