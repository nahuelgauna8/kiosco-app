// Canal de difusión para notificar (entre pestañas/ventanas) que se creó
// un nuevo pedido, para que el Panel de Administración refresque sus
// métricas sin necesidad de recargar la página.
//
// BroadcastChannel está disponible en navegadores modernos; si no lo
// estuviera, las funciones degradan silenciosamente (sin romper nada).
let channel: BroadcastChannel | null = null;
try {
  channel = new BroadcastChannel("kiosco-orders");
} catch {
  channel = null;
}

// Avisa que se acaba de crear un pedido. Los listeners (p. ej. AdminPanel)
// deben refrescar las stats del dashboard.
export function notifyNewOrder() {
  channel?.postMessage({ type: "new-order" });
}

// Suscribe un callback que se ejecuta cuando hay un nuevo pedido.
// Devuelve una función para desuscribir.
export function subscribeNewOrder(callback: () => void): () => void {
  if (!channel) return () => {};
  channel.onmessage = (event) => {
    if (event.data?.type === "new-order") callback();
  };
  return () => {
    channel!.onmessage = null;
  };
}
