import { Clock, CreditCard, Truck, type LucideIcon } from "lucide-react";

interface TrustItem {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}

// Beneficios del kiosco que se muestran como badges en el hero.
// Centralizarlos acá permite reordenar o agregar beneficios sin tocar el JSX.
const TRUST_ITEMS: TrustItem[] = [
  {
    icon: Truck,
    title: "Envíos en 15-30 min",
    subtitle: "O retiro en el local al instante",
  },
  {
    icon: CreditCard,
    title: "Medios de Pago",
    subtitle: "Efectivo, Mercado Pago y Transferencia",
  },
  {
    icon: Clock,
    title: "Abierto las 24 hs",
    subtitle: "Atención continua y horario extendido",
  },
];

// Columna derecha del hero: 3 tarjetas horizontales con estilo
// glassmorphism (fondo translúcido + blur + borde blanco) sobre el
// degradado cálido de la tarjeta principal.
function TrustBadges() {
  return (
    <ul className="hero-badges" aria-label="Beneficios del kiosco">
      {TRUST_ITEMS.map(({ icon: Icon, title, subtitle }) => (
        <li key={title} className="hero-badge">
          <span className="hero-badge__icon" aria-hidden="true">
            <Icon size={20} strokeWidth={2} />
          </span>
          <span className="hero-badge__text">
            <span className="hero-badge__title">{title}</span>
            <span className="hero-badge__subtitle">{subtitle}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}

export default TrustBadges;
