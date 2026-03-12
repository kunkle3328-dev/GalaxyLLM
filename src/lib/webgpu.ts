export async function checkWebGPUSupport() {
  const nav = navigator as any;
  if (!nav.gpu) {
    return {
      supported: false,
      hasF16: false,
      error: "WebGPU is not supported in this browser."
    };
  }

  try {
    const adapter = await nav.gpu.requestAdapter();
    if (!adapter) {
      return {
        supported: false,
        hasF16: false,
        error: "No WebGPU adapter found."
      };
    }

    const hasF16 = adapter.features.has("shader-f16");
    return {
      supported: true,
      hasF16,
      adapterInfo: await adapter.requestAdapterInfo()
    };
  } catch (e) {
    return {
      supported: false,
      hasF16: false,
      error: e instanceof Error ? e.message : "Unknown WebGPU error"
    };
  }
}
