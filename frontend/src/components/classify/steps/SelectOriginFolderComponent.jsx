import React, { useState } from "react";
import {
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    Box,
} from "@mui/material";
import * as XLSX from "xlsx";
import MoveNotCompleteComponent from "./MoveNotCompleteComponent";

export default function SelectOriginFolderComponent({
    loading,
    setLoading,
    comprobantes,
    setComprobantes,
}) {

    const [error, setError] = useState(null);

    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleFolderChange = (event) => {

        const _selectedFiles = Array.from(event.target.files);

        setSelectedFiles(_selectedFiles);

        if (!_selectedFiles.length > 0) {
            setError("No se seleccionaron archivos.");
            return;
        }

        // Filtra solo los archivos XML y PDF
        const validFiles = _selectedFiles.filter((file) =>
            file.name.endsWith(".xml") || file.name.endsWith(".pdf")
        );

        const _comprobantes = [];

        for (const file of validFiles) {
            const nombre = file.name.split(".")[0];
            const extension = file.name.split(".")[1];
            const comprobante = _comprobantes.find((comprobante) => comprobante.nombre === nombre);
            if (comprobante) {
                comprobante[extension] = file;
            } else {
                _comprobantes.push({
                    nombre,
                    [extension]: file,
                });
            }
        }


        setComprobantes(_comprobantes.map((comprobante) => {
            comprobante.completo = comprobante.pdf && comprobante.xml ? true : false;
            return comprobante;
        }));

    };

    return <>
        <input
            accept=".xml,.pdf"
            style={{ display: "none" }}
            id="folder-input"
            type="file"
            webkitdirectory="true"
            onChange={handleFolderChange}
        />
        <label htmlFor="folder-input">
            <Button variant="contained" component="span">
                Seleccionar Carpeta
            </Button>
        </label>
        {selectedFiles.length > 0 &&
            <>
                <Paper style={{ padding: "20px", marginTop: "20px" }} >
                    <Typography variant="h6">Archivos seleccionados: {
                        selectedFiles.length > 0 ? selectedFiles.length : 0
                    }
                    </Typography>
                    <Typography variant="h6">Comprobantes procesables: {
                        comprobantes.filter(comprobante => comprobante.completo).length
                    }
                    </Typography>
                    {
                        comprobantes.filter(comprobante => !comprobante.completo).length > 0 &&
                        <>
                            <Alert severity="warning" style={{ marginTop: "20px" }}>
                                Hay comprobantes que no se pueden procesar, muevelos a otra carpeta.
                            </Alert>
                            <Box style={{ marginTop: "20px" }}>
                                <MoveNotCompleteComponent
                                    setComprobantes={setComprobantes}
                                    comprobantes={comprobantes}
                                    loading={loading}
                                    setLoading={setLoading}

                                />
                            </Box>
                        </>
                    }
                </Paper>
                <TableContainer component={Paper} style={{ marginTop: "20px" }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>PDF</TableCell>
                                <TableCell>XML</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {comprobantes.map((comprobante, index) => (
                                <TableRow key={index}>
                                    <TableCell>{comprobante.nombre}</TableCell>
                                    <TableCell>{comprobante.pdf ? "Si" : "No"}</TableCell>
                                    <TableCell>{comprobante.xml ? "Si" : "No"}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </>
        }
    </>;

};  