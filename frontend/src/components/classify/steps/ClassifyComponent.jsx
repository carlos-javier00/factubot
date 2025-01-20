import React, { useState } from "react";
import {
    Container,
    Typography,
    Button,
    TextField,
    Alert,
} from "@mui/material";

export default function ClassifyComponent({
    loading,
    setLoading,
    comprobantes,
    setComprobantes,
}) {
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const sanitizeName = (name) => {
        return name.replace(/[^a-z0-9\s]/gi, '');
    };

    const handleCreate = async () => {
        setLoading({
            loading: true,
            title: "Clasificando comprobantes",
            progress: 0,
            total: comprobantes.length
        });
    
        try {
            setError(null);
            setSuccess(null);
    
            // Solicitar al usuario que seleccione un directorio padre
            const directoryHandle = await window.showDirectoryPicker();
    
            let localProgress = 0;
    
            for (const comprobante of comprobantes) {
                const path = comprobante.analisis.ruta;
                const parts = path.split("/");
                const fileName = sanitizeName(parts.pop());
                let currentDirectory = directoryHandle;
    
                // Crear la estructura de carpetas
                for (const part of parts) {
                    currentDirectory = await currentDirectory.getDirectoryHandle(sanitizeName(part), { create: true });
                }
    
                // Crear el archivo PDF si existe
                if (comprobante.pdf) {
                    const pdfHandle = await currentDirectory.getFileHandle(`${fileName}.pdf`, { create: true });
                    const pdfWritable = await pdfHandle.createWritable();
                    await pdfWritable.write(comprobante.pdf);
                    await pdfWritable.close();
                }
    
                // Crear el archivo XML si existe
                if (comprobante.xml) {
                    const xmlHandle = await currentDirectory.getFileHandle(`${fileName}.xml`, { create: true });
                    const xmlWritable = await xmlHandle.createWritable();
                    await xmlWritable.write(comprobante.xml);
                    await xmlWritable.close();
                }
    
                localProgress += 1;
                setLoading({
                    loading: true,
                    title: "Clasificando comprobantes",
                    progress: localProgress,
                    total: comprobantes.length
                });
            }
    
            setSuccess("Estructura de carpetas y archivos creada exitosamente.");
        } catch (err) {
            setError(`Error al crear la estructura: ${err.message}`);
        }
    
        setLoading({
            loading: false,
            title: "",
            progress: 0,
            total: 0
        });
    };

    return (
        <Container>
            <Typography variant="h6">Crear Estructura de Carpetas y Archivos</Typography>
            <Button variant="contained" color="primary" onClick={handleCreate}>
                Crear
            </Button>
            {error && <Alert severity="error" style={{ marginTop: "20px" }}>{error}</Alert>}
            {success && <Alert severity="success" style={{ marginTop: "20px" }}>{success}</Alert>}
        </Container>
    );
}