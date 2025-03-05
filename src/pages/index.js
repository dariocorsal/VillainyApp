"use client";

import { useState, useEffect } from "react";
import VillanoCard from "@/components/VillanoCard";
import { Dropdown, Modal, Button, Form } from "react-bootstrap";
import Head from "next/head";
import styles from "@/styles/Home.module.css";

export default function Home() {
  const [villanos, setVillanos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [tipoBusqueda, setTipoBusqueda] = useState("nombre");
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoVillano, setNuevoVillano] = useState({
    nombre: "",
    franquicia: "",
    poderes: "",
    derrotadoPor: "",
  });

  const backgroundImages = [
    "/images/villain-bg-1.jpg",
    "/images/villain-bg-2.jpg",
    "/images/villain-bg-3.jpg",
  ];

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/villanos`)
      .then((res) => res.json())
      .then((data) => setVillanos(data))
      .catch((err) => console.error("Error al obtener villanos:", err));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgIndex((prevIndex) =>
        prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleBusqueda = (e) => {
    setBusqueda(e.target.value);
  };

  const handleTipoBusqueda = (tipo) => {
    setTipoBusqueda(tipo);
  };

  const villanosFiltrados = villanos.filter((villano) => {
    if (tipoBusqueda === "nombre") {
      return villano.nombre.toLowerCase().includes(busqueda.toLowerCase());
    } else {
      return villano.franquicia.toLowerCase().includes(busqueda.toLowerCase());
    }
  });

  const mostrarResultados = busqueda.length > 0 && villanosFiltrados.length > 0;

  const abrirModal = () => {
    setMostrarModal(true);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNuevoVillano({
      ...nuevoVillano,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const villanoData = {
        ...nuevoVillano,
        derrotado_por: nuevoVillano.derrotadoPor,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/villanos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(villanoData),
        }
      );

      if (response.ok) {
        const nuevoVillanoCreado = await response.json();
        setVillanos([...villanos, nuevoVillanoCreado]);
        setNuevoVillano({
          nombre: "",
          franquicia: "",
          poderes: "",
          derrotadoPor: "",
        });
        cerrarModal();
        alert("¡Villano añadido con éxito!");
      } else {
        alert("Error al añadir el villano");
      }
    } catch (error) {
      console.error("Error al añadir villano:", error);
      alert("Error al añadir el villano");
    }
  };

  return (
    <>
      <Head>
        <title>VillainApp - Explora el mundo de los villanos</title>
        <meta
          name="description"
          content="Descubre y explora villanos de diferentes franquicias"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Creepster&family=Roboto:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div
        className={styles.mainContainer}
        style={{
          backgroundImage: `url(${
            backgroundImages[currentBgIndex] ||
            "/placeholder.svg?height=1080&width=1920"
          })`,
        }}
      >
        <div className={styles.overlay}>
          <div className="container position-relative">
            <div className="position-absolute top-0 end-0 mt-3">
              <Button
                variant="danger"
                size="lg"
                onClick={abrirModal}
                style={{
                  backgroundColor: "#ff0000",
                  borderColor: "#cc0000",
                  fontWeight: "bold",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                }}
              >
                Agregar Villano
              </Button>
            </div>

            <h1 className={styles.title}>VillainApp</h1>

            <div className={styles.searchContainer}>
              <div className={styles.searchWrapper}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder={`Buscar villano por ${tipoBusqueda}...`}
                    value={busqueda}
                    onChange={handleBusqueda}
                  />
                  <Dropdown autoClose="true">
                    <Dropdown.Toggle
                      variant="primary"
                      id="dropdown-basic"
                      className="btn-lg"
                      style={{
                        backgroundColor: "#ff0000",
                        borderColor: "#cc0000",
                        fontWeight: "bold",
                        minWidth: "120px",
                      }}
                    >
                      {tipoBusqueda === "nombre" ? "Nombre" : "Franquicia"}
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      className="dropdown-menu-dark"
                      style={{
                        backgroundColor: "#333",
                        borderColor: "#444",
                        boxShadow: "0 5px 15px rgba(0,0,0,0.5)",
                        padding: "8px 0",
                      }}
                    >
                      <Dropdown.Item
                        onClick={() => handleTipoBusqueda("nombre")}
                        active={tipoBusqueda === "nombre"}
                        className="py-2 px-4"
                      >
                        Nombre
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => handleTipoBusqueda("franquicia")}
                        active={tipoBusqueda === "franquicia"}
                        className="py-2 px-4"
                      >
                        Franquicia
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>

                {busqueda.length > 0 && (
                  <div className={styles.dropdownResults}>
                    {villanosFiltrados.length > 0 ? (
                      <div className="row g-3">
                        {villanosFiltrados.map((villano) => (
                          <VillanoCard key={villano.nombre} villano={villano} />
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noResults}>
                        No se encontraron villanos
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        show={mostrarModal}
        onHide={cerrarModal}
        backdrop="static"
        size="lg"
        centered
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#222", color: "white" }}
        >
          <Modal.Title>Agregar Nuevo Villano</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: "#333", color: "white" }}>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={nuevoVillano.nombre}
                onChange={handleInputChange}
                required
                placeholder="Ej: Joker"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Franquicia</Form.Label>
              <Form.Control
                type="text"
                name="franquicia"
                value={nuevoVillano.franquicia}
                onChange={handleInputChange}
                required
                placeholder="Ej: DC Comics"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Poderes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="poderes"
                value={nuevoVillano.poderes}
                onChange={handleInputChange}
                required
                placeholder="Ej: Inteligencia criminal, manipulación psicológica"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Derrotado por</Form.Label>
              <Form.Control
                type="text"
                name="derrotadoPor"
                value={nuevoVillano.derrotadoPor}
                onChange={handleInputChange}
                required
                placeholder="Ej: Batman"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: "#222", color: "white" }}>
          <Button variant="secondary" onClick={cerrarModal}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            style={{
              backgroundColor: "#ff0000",
              borderColor: "#cc0000",
            }}
          >
            Guardar Villano
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
