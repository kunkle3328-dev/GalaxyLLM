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
    
    let adapterInfo = {};
    try {
      if (adapter.info) {
        adapterInfo = adapter.info;
      } else if (typeof adapter.requestAdapterInfo === 'function') {
        adapterInfo = await adapter.requestAdapterInfo();
      }
    } catch (infoError) {
      console.warn("Could not get adapter info", infoError);
    }

    return {
      supported: true,
      hasF16,
      adapterInfo
    };
  } catch (e) {
    return {
      supported: false,
      hasF16: false,
      error: e instanceof Error ? e.message : "Unknown WebGPU error"
    };
  }
}
