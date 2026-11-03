import { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // Muestra "Borrando..." y bloquea el cierre mientras dura la petición.
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Diálogo de confirmación modal, con el estilo de la interfaz del kiosco
// (reemplaza al window.confirm nativo del navegador).
//
// Comportamiento profesional:
// - Se cierra con Escape o clic en el fondo.
// - El foco inicial va a "Cancelar" (la opción segura).
// - No se puede cerrar mientras `busy` está en true (durante la petición).
function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    // Opción segura enfocada + bloqueo del scroll del fondo.
    cancelRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm__backdrop"
      onClick={busy ? undefined : onCancel}
    >
      <div
        className="confirm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="confirm__title" id="confirm-dialog-title">
          ⚠️ {title}
        </h2>
        <p className="confirm__message" id="confirm-dialog-message">
          {message}
        </p>

        <div className="confirm__actions">
          <button
            type="button"
            className="button button--secondary"
            onClick={onCancel}
            disabled={busy}
            ref={cancelRef}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="button button--danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Borrando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
