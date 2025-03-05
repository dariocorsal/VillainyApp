import { Card } from "react-bootstrap";
import Link from "next/link";
import styles from "@/styles/VillanoCard.module.css";

const obtenerImagenPorDefecto = (villano) => {
  const imagenesPorFranquicia = {
    Marvel: "/images/marvel-villain.jpg",
    DC: "/images/dc-villain.jpg",
    "Star Wars": "/images/starwars-villain.jpg",
  };

  const imagenesEspecificas = {
    Joker: "/images/joker.png",
    "Darth Vader": "/images/darth-vader.png",
    Thanos: "/images/thanos.png",
  };

  if (imagenesEspecificas[villano.nombre]) {
    return imagenesEspecificas[villano.nombre];
  }

  if (imagenesPorFranquicia[villano.franquicia]) {
    return imagenesPorFranquicia[villano.franquicia];
  }

  return "/images/default-villain.jpg";
};

const VillanoCard = ({ villano }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-3">
      <Link
        href={`/villano/${encodeURIComponent(villano.nombre)}`}
        className={styles.cardLink}
        passHref
        legacyBehavior={false}
      >
        <Card className={styles.villanoCard}>
          <Card.Img
            variant="top"
            src={villano.imagen || obtenerImagenPorDefecto(villano)}
            alt={villano.nombre}
            className={styles.villanoImage}
            onError={(e) => {
              e.target.onerror = null; // Previene bucles infinitos
              e.target.src = "/images/default-villain.jpg";
            }}
          />
          <Card.Body className={styles.villanoBody}>
            <Card.Title className={styles.villanoTitle}>
              {villano.nombre}
            </Card.Title>
            <Card.Text className={styles.villanoFranquicia}>
              {villano.franquicia}
            </Card.Text>
          </Card.Body>
        </Card>
      </Link>
    </div>
  );
};

export default VillanoCard;
