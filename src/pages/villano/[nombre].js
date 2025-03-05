"use client";

import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Container, Card, Button, Spinner, Modal } from "react-bootstrap";
import { Trash2 } from "lucide-react";
import Comentarios from "@/components/Comentarios";
import styles from "@/styles/VillanoDetalle.module.css";

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

export default function VillanoDetalle() {
  const router = useRouter();
  const { nombre } = router.query;

  const [villano, setVillano] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarModalConfirmacion, setMostrarModalConfirmacion] =
    useState(false);
  const [eliminando, setEliminando] = useState(false);

  useEffect(() => {
    if (nombre) {
      setCargando(true);
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/villanos/${nombre}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error("No se pudo encontrar el villano");
          }
          return res.json();
        })
        .then((data) => {
          setVillano(data);
          setCargando(false);
        })
        .catch((err) => {
          console.error("Error al obtener villano:", err);
          setError(err.message);
          setCargando(false);
        });
    }
  }, [nombre]);

  const confirmarEliminacion = () => {
    setMostrarModalConfirmacion(true);
  };

  const cancelarEliminacion = () => {
    setMostrarModalConfirmacion(false);
  };

  const eliminarVillano = async () => {
    if (!villano || !nombre) return;

    setEliminando(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/villanos/${nombre}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al eliminar: ${response.status} ${response.statusText}`
        );
      }

      setMostrarModalConfirmacion(false);

      alert(`El villano ${villano.nombre} ha sido eliminado con éxito`);

      router.push("/");
    } catch (error) {
      console.error("Error al eliminar villano:", error);
      alert(`Error al eliminar el villano: ${error.message}`);
      setEliminando(false);
      setMostrarModalConfirmacion(false);
    }
  };

  if (cargando) {
    return (
      <div className={styles.loadingContainer}>
        <Spinner animation="border" variant="danger" />
        <p>Cargando información del villano...</p>
      </div>
    );
  }

  if (error || !villano) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error al cargar el villano</h2>
        <p>{error || "No se pudo encontrar la información del villano"}</p>
        <Link href="/" passHref>
          <Button variant="danger">Volver al inicio</Button>
        </Link>
      </div>
    );
  }

  const imagenVillano = villano.imagen || obtenerImagenPorDefecto(villano);

  return (
    <div className={styles.mainContainer}>
      <Head>
        <title>{villano.nombre} | VillainApp</title>
        <meta
          name="description"
          content={`Información detallada sobre ${villano.nombre}`}
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Creepster&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <Container className={styles.contentContainer}>
        <div className={styles.deleteButtonContainer}>
          <Button
            variant="danger"
            className={styles.deleteButton}
            onClick={confirmarEliminacion}
          >
            <Trash2 size={20} />
            <span className="ms-2">Eliminar Villano</span>
          </Button>
        </div>

        <Card className={styles.infoCard}>
          <Card.Body>
            <h1 className={styles.villanoNombre}>{villano.nombre}</h1>

            <div className={styles.villanoImageContainer}>
              <img
                src={imagenVillano}
                alt={villano.nombre}
                className={styles.villanoImageDetalle}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/images/default-villain.jpg";
                }}
              />
            </div>

            <div className={styles.infoSection}>
              <p>
                <strong>Franquicia:</strong>{" "}
                {villano.franquicia || "Desconocida"}
              </p>

              <p>
                <strong>Poderes:</strong>{" "}
                {villano.poderes && villano.poderes.length > 0
                  ? villano.poderes.join(", ")
                  : "No se han registrado poderes para este villano."}
              </p>

              <p>
                <strong>Derrotado por:</strong>{" "}
                {villano.derrotadoPor ||
                  villano.derrotado_por ||
                  "Aún no ha sido derrotado"}
              </p>
            </div>
          </Card.Body>
        </Card>

        <div className={styles.comentariosSection}>
          <h2 className={styles.sectionTitle}>Comentarios</h2>
          <Comentarios villanoId={nombre} />
        </div>

        <div className={styles.navigationButtons}>
          <Link href="/" passHref>
            <Button variant="outline-danger" className={styles.backButton}>
              Volver al inicio
            </Button>
          </Link>
        </div>
      </Container>

      <Modal
        show={mostrarModalConfirmacion}
        onHide={cancelarEliminacion}
        centered
        backdrop="static"
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#222", color: "white" }}
        >
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#333", color: "white" }}>
          <p>
            ¿Estás seguro de que deseas eliminar a{" "}
            <strong>{villano.nombre}</strong>?
          </p>
          <p>Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#222", color: "white" }}>
          <Button variant="secondary" onClick={cancelarEliminacion}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={eliminarVillano}
            disabled={eliminando}
          >
            {eliminando ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                />
                <span className="ms-2">Eliminando...</span>
              </>
            ) : (
              "Eliminar"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
