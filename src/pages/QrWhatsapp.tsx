import React, { useEffect, useMemo, useState } from "react";
import { X, Smartphone, QrCode } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import config from "../config";

const fecha = new Date().toLocaleDateString();
const hora = new Date().toLocaleTimeString();


export type QrWhatsappProps = {
  open?: boolean;
  onClose?: () => void;
  value?: string;
  title?: string;
};

function randomToken(len = 32) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const Backdrop: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.18 }}

    onClick={onClick} // solo cierra modal
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 1300,
      backgroundColor: "rgba(0,0,0,0.4)",
      backdropFilter: "blur(4px)",
    }}
  />
);

const Card: React.FC<React.PropsWithChildren<{ onClose?: () => void; title?: string }>> = ({
  children,
  onClose,
  title,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: 10, scale: 0.98 }}
    transition={{ duration: 0.2 }}
    role="dialog"
    aria-modal="true"
    aria-labelledby="qrw-title"
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 1400,
      display: "grid",
      placeItems: "center",
      padding: 16,
    }}
  >
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        borderRadius: 16,
        background: "rgba(255,255,255,0.92)",
        boxShadow: "0 8px 28px rgba(0,0,0,0.25)",
        backdropFilter: "blur(8px)",
        padding: "32px 24px",
        textAlign: "center",
      }}
    >
      {/* Botón de cierre */}
      <button

        onClick={onClose} // solo cierra modal
        aria-label="Cerrar"
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          borderRadius: "50%",
          padding: 6,
          border: "none",
          background: "transparent",
          cursor: "pointer",
        }}
      >
        <X size={20} />
      </button>

      <h2
        id="qrw-title"
        style={{
          marginBottom: 24,
          fontSize: "1.5rem",
          fontWeight: 600,
          color: "#111",
        }}
      >
        Es necesario leer el QR para continuar
      </h2>

      <div
        style={{
          margin: "0 auto 16px",
          width: "100%",
          maxWidth: 280,
          borderRadius: 12,
          border: "1px solid #ccc",
          background: "#fff",
          padding: 16,
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        }}
      >
        {children}
      </div>

      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontSize: 14,
          color: "#555",
        }}
      >
        <QrCode size={16} />
        <span>¿Cómo se hace?</span>
      </div>

      <ol
        style={{
          margin: "12px auto 0",
          maxWidth: "80%",
          textAlign: "left",
          fontSize: 14,
          color: "#555",
          paddingLeft: 20,
        }}
      >
        <li>Abre WhatsApp en tu teléfono.</li>
        <li>
          Ve a <b>Dispositivos vinculados</b> → <b>Vincular un dispositivo</b>.
        </li>
        <li>Escanea el código QR que aparece en esta pantalla.</li>
      </ol>

      <div
        style={{
          marginTop: 16,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          borderRadius: 999,
          background: "#f3f4f6",
          padding: "4px 12px",
          fontSize: 12,
          color: "#555",
        }}
      >
        <Smartphone size={14} />
        <span>Tu sesión se mantendrá segura</span>
      </div>
    </div>
  </motion.div>
);

export const QrWhatsapp: React.FC<QrWhatsappProps> = ({ open = false, onClose, value, title }) => {
  const [seed] = useState(() => randomToken(16));
  const [qrValue, setqrValue] = React.useState("");
  React.useEffect(() => {
    if (!open) return;
    const payload = async () => {
      try {
        const response = await fetch(config.API_URL + '/session/create_qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + localStorage.getItem('token') },
          body: JSON.stringify({ 
          fecha: fecha + " " + hora,
          auth: localStorage.getItem("token"),
          accion: "POST",
          data: {
            title: 'Default', syncMax: false
          }
          }),
      });
        const data = await response.json();
        console.log(data);

        if (data.success) {
          localStorage.setItem("sessionId", data.sessionId);
          setqrValue(data.qr);
        }
        else {
          setqrValue("");
        }

      } catch (error) {
        setqrValue("");
      }
    }
    payload();

  }, [open]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <Backdrop onClick={onClose} />
          <Card onClose={onClose} title={title}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <img src={qrValue}/>
              <p style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
                Si el código expira, recarga la página.
              </p>
            </div>
          </Card>
        </>
      )}
    </AnimatePresence>
  );
};

export default QrWhatsapp;