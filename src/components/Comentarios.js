"use client";

import { useState, useEffect } from "react";
import { Form, Button, Card, Alert, Spinner } from "react-bootstrap";
import { X, Edit, Save, XCircle } from "lucide-react";
import styles from "@/styles/Comentarios.module.css";

const Comentarios = ({ villanoId }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [comentarioEditando, setComentarioEditando] = useState(null);
  const [comentarioEditado, setComentarioEditado] = useState({
    usuario: "",
    comentario: "",
  });
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (villanoId) {
      cargarComentarios();
    }
  }, [villanoId]);

  const cargarComentarios = async () => {
    setCargando(true);
    try {
      if (!villanoId) {
        console.warn("ID de villano no proporcionado");
        setCargando(false);
        return;
      }

      console.log(`Intentando cargar comentarios para villano: ${villanoId}`);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comentarios/${villanoId}`
      );

      console.log(
        `Respuesta de la API: ${response.status} ${response.statusText}`
      );

      if (response.status === 404) {
        console.log(
          `No se encontraron comentarios para el villano ${villanoId}`
        );
        setComentarios([]);
        return;
      }

      if (!response.ok) {
        const errorText = await response
          .text()
          .catch(() => "No se pudo leer el mensaje de error");
        console.error(`Error en la respuesta: ${errorText}`);
        throw new Error(
          `Error al cargar comentarios (${response.status}): ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log(`Comentarios cargados: ${data.length || 0}`);
      setComentarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error detallado al cargar comentarios:", err);
      if (!err.message.includes("404")) {
        setError(
          `No se pudieron cargar los comentarios: ${err.message}. Por favor, intente nuevamente más tarde.`
        );
      }
    } finally {
      setCargando(false);
    }
  };

  const agregarComentario = async () => {
    if (!nombreUsuario.trim() || !nuevoComentario.trim()) {
      setError("Por favor complete todos los campos");
      return;
    }

    setEnviando(true);
    setError("");

    const comentarioData = {
      villano: villanoId,
      usuario: nombreUsuario,
      comentario: nuevoComentario,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comentarios`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(comentarioData),
        }
      );

      if (!response.ok) {
        throw new Error("Error al agregar comentario");
      }

      setNombreUsuario("");
      setNuevoComentario("");

      await cargarComentarios();
    } catch (err) {
      console.error("Error al agregar comentario:", err);
      setError("No se pudo agregar el comentario. Intente nuevamente.");
    } finally {
      setEnviando(false);
    }
  };

  const eliminarComentario = async (id) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comentarios/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Error al eliminar comentario");
      }

      await cargarComentarios();

      if (comentarioEditando === id) {
        cancelarEdicion();
      }
    } catch (err) {
      console.error("Error al eliminar comentario:", err);
      setError("No se pudo eliminar el comentario. Intente nuevamente.");
    }
  };

  const iniciarEdicion = (comentario) => {
    setComentarioEditando(comentario._id);
    setComentarioEditado({
      usuario: comentario.usuario,
      comentario: comentario.comentario || comentario.mensaje || "",
    });
  };

  const guardarEdicion = async (id) => {
    if (
      !comentarioEditado.usuario.trim() ||
      !comentarioEditado.comentario.trim()
    ) {
      setError("Por favor complete todos los campos");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/comentarios/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            usuario: comentarioEditado.usuario,
            comentario: comentarioEditado.comentario,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al actualizar comentario");
      }

      await cargarComentarios();
      cancelarEdicion();
    } catch (err) {
      console.error("Error al actualizar comentario:", err);
      setError("No se pudo actualizar el comentario. Intente nuevamente.");
    }
  };

  const cancelarEdicion = () => {
    setComentarioEditando(null);
    setComentarioEditado({ usuario: "", comentario: "" });
    setError("");
  };

  const formatearFecha = (fechaStr) => {
    try {
      return new Date(fechaStr).toLocaleString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "Fecha desconocida";
    }
  };

  return (
    <div className={styles.comentariosContainer}>
      {error && <Alert variant="danger">{error}</Alert>}

      {/* Formulario para agregar comentario */}
      <Card className={styles.formCard}>
        <Card.Body>
          <h3 className={styles.formTitle}>Agregar comentario</h3>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de usuario</Form.Label>
              <Form.Control
                type="text"
                value={nombreUsuario}
                onChange={(e) => setNombreUsuario(e.target.value)}
                placeholder="Tu nombre"
                className={styles.formInput}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Comentario</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe tu comentario aquí"
                className={styles.formTextarea}
              />
            </Form.Group>

            <Button
              variant="danger"
              onClick={agregarComentario}
              className={styles.submitButton}
              disabled={enviando}
            >
              {enviando ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <span className="ms-2">Publicando...</span>
                </>
              ) : (
                "Publicar comentario"
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>

      {/* Lista de comentarios */}
      <div className={styles.comentariosList}>
        <h3 className={styles.comentariosTitle}>
          {cargando ? (
            <Spinner animation="border" variant="light" size="sm" />
          ) : comentarios.length > 0 ? (
            `${comentarios.length} comentario${
              comentarios.length !== 1 ? "s" : ""
            }`
          ) : (
            "No hay comentarios aún"
          )}
        </h3>

        {comentarios.map((comentario) => (
          <Card key={comentario._id} className={styles.comentarioCard}>
            <Card.Body>
              {comentarioEditando === comentario._id ? (
                <>
                  <div className={styles.editForm}>
                    <Form.Group className="mb-2">
                      <Form.Label>Nombre de usuario</Form.Label>
                      <Form.Control
                        type="text"
                        value={comentarioEditado.usuario}
                        onChange={(e) =>
                          setComentarioEditado({
                            ...comentarioEditado,
                            usuario: e.target.value,
                          })
                        }
                        className={styles.formInput}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Comentario</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={comentarioEditado.comentario}
                        onChange={(e) =>
                          setComentarioEditado({
                            ...comentarioEditado,
                            comentario: e.target.value,
                          })
                        }
                        className={styles.formTextarea}
                      />
                    </Form.Group>

                    <div className={styles.editButtons}>
                      <Button
                        variant="success"
                        onClick={() => guardarEdicion(comentario._id)}
                        className={styles.editButton}
                      >
                        <Save size={16} /> Guardar
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={cancelarEdicion}
                        className={styles.editButton}
                      >
                        <XCircle size={16} /> Cancelar
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.comentarioHeader}>
                    <div>
                      <h5 className={styles.comentarioUsuario}>
                        {comentario.usuario}
                      </h5>
                      <p className={styles.comentarioFecha}>
                        {formatearFecha(comentario.fecha)}
                        {comentario.editado && (
                          <span className={styles.editadoTag}> (editado)</span>
                        )}
                      </p>
                    </div>
                    <div className={styles.comentarioAcciones}>
                      <button
                        onClick={() => iniciarEdicion(comentario)}
                        className={styles.accionButton}
                        aria-label="Editar comentario"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => eliminarComentario(comentario._id)}
                        className={styles.accionButton}
                        aria-label="Eliminar comentario"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  <p className={styles.comentarioMensaje}>
                    {comentario.comentario || comentario.mensaje}
                  </p>
                </>
              )}
            </Card.Body>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Comentarios;
