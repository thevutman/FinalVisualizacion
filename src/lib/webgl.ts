let cached: boolean | undefined;

/** Comprueba una sola vez si el navegador puede crear un contexto WebGL2. */
export function isWebGLAvailable(): boolean {
  if (cached !== undefined) return cached;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2');
    cached = context !== null;
    context?.getExtension('WEBGL_lose_context')?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}
