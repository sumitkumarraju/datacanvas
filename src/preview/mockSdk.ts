/**
 * Local-only host fixture. It is selected only with ?preview=1 on localhost
 * so the panel can be smoke-tested outside Adobe Express without weakening
 * the real host connection path.
 */
export function createPreviewSdk() {
    const listeners = new Map<string, Set<(data: { theme?: string }) => void>>();
    return {
        ready: Promise.resolve(),
        app: {
            ui: { theme: "light" },
            on(name: string, handler: (data: { theme?: string }) => void) {
                const handlers = listeners.get(name) ?? new Set();
                handlers.add(handler);
                listeners.set(name, handlers);
            },
            off(name: string, handler: (data: { theme?: string }) => void) {
                listeners.get(name)?.delete(handler);
            },
            document: {
                async addImage(_blob: Blob, _options: { title: string }) {
                    return { id: "preview-image" };
                },
            },
        },
    };
}
