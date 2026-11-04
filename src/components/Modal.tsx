import { useEffect, useRef, type ReactNode, type RefObject } from "react";

interface ModalProps {
  open: boolean;
  // Ids del título y el mensaje (para aria-labelledby / aria-describedby).
  titleId: string;
  messageId?: string;
  // Elemento a enfocar al abrir (si no se pasa, se enfoca el modal mismo).
  initialFocusRef?: RefObject<HTMLElement | null>;
  // Con busy=true no se puede cerrar con Escape ni clic en el fondo.
  busy?: boolean;
  // Se invoca cuando el usuario pide cerrar (Escape o clic en el fondo).
  onClose: () => void;
  children: ReactNode;
}

// Contenedor modal genérico (fondo oscuro + tarjeta centrada):
// - Se cierra con Escape o clic en el fondo (salvo que esté busy).
// - Enfoca el elemento indicado al abrir y bloquea el scroll del fondo.
// - Cierra el scroll de la página mientras está abierto.
// Lo usan los diálogos de formularios; ConfirmDialog (M.4) mantiene el suyo.
function Modal({
  open,
  titleId,
  messageId,
  initialFocusRef,
  busy = false,
  onClose,
  children,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Guardamos las últimas props en refs para que los efectos no se
  // re-disparen en cada render del padre (evita perder el foco al tipear).
  const onCloseRef = useRef(onClose);
  const busyRef = useRef(busy);
  useEffect(() => {
    onCloseRef.current = onClose;
    busyRef.current = busy;
  });

  // Foco inicial + bloqueo del scroll mientras el modal está abierto.
  useEffect(() => {
    if (!open) return;

    if (initialFocusRef?.current) {
      initialFocusRef.current.focus();
    } else {
      dialogRef.current?.focus();
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open, initialFocusRef]);

  // Escape para cerrar (si no está ocupado).
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) onCloseRef.current();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="modal__backdrop"
      onClick={busy ? undefined : () => onCloseRef.current()}
    >
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
        onClick={(event) => event.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
