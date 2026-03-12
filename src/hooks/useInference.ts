import { useState, useCallback, useEffect } from 'react';
import { inferenceService, type InferenceProgress } from '../services/inferenceService';

import type { ChatCompletionMessageParam } from "@mlc-ai/web-llm";

export function useInference() {
  const [isInitializing, setIsInitializing] = useState(inferenceService.isInitializing());
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<InferenceProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = inferenceService.subscribe((p) => {
      setProgress(p);
      setIsInitializing(inferenceService.isInitializing());
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const init = useCallback(async (modelId: string, modelUrl?: string) => {
    setIsInitializing(true);
    setError(null);
    try {
      await inferenceService.initEngine(modelId, modelUrl);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to init engine';
      setError(msg);
      throw err;
    } finally {
      setIsInitializing(inferenceService.isInitializing());
    }
  }, []);

  const generate = useCallback(async (messages: ChatCompletionMessageParam[], onToken?: (token: string) => void) => {
    setIsGenerating(true);
    setError(null);
    try {
      return await inferenceService.generate(messages, onToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    init,
    generate,
    isInitializing,
    isGenerating,
    progress,
    error,
    currentModelId: inferenceService.getCurrentModelId()
  };
}
