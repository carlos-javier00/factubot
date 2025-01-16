import React, { useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Paper } from '@mui/material';

const ANALYZER_WORKER_URL = import.meta.env.VITE_ANALYZER_WORKER_URL;

const AnalyzeComponent = ({   
    loading,
    setLoading,
    comprobantes,
    setComprobantes,
}) => {
    const analyzeWithWorker = async (comprobantes) => {
        try {
            let data = new FormData();
            comprobantes.forEach(comprobante => {
                if (comprobante.xml) {
                    data.append('files', new Blob([comprobante.xml], { type: 'application/xml' }), `${comprobante.nombre}.xml`);
                }
            });

            let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${ANALYZER_WORKER_URL}/analizarComprobantes/`,
                headers: { 
                    'accept': 'application/json',
                },
                data : data
            };

            const response = await axios.request(config);
            const analyzedData = response.data;

            const _comprobantes = comprobantes.map(comprobante => {
                const analysisResult = analyzedData.find(result => result.filename === `${comprobante.nombre}.xml`);
                return {
                    ...comprobante,
                    analisis: analysisResult ? analysisResult.analisis : null,
                    analizable: analysisResult ? true : false,
                };
            });

            setComprobantes(_comprobantes);
        } catch (error) {
            console.error("Error al analizar los comprobantes:", error);
        }
    };

    const handleAnalyze = async () => {
        setLoading(true);
        await analyzeWithWorker(comprobantes);
        setLoading(false);
    };

    useEffect(() => {
        handleAnalyze();
    }, []);

    const renderFlatTable = (comprobantes) => {
        if (!comprobantes || !comprobantes.length) return null;

        return (
          <TableContainer component={Paper} style={{ marginTop: "20px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>fechaEmisionDocSustento</TableCell>
                  <TableCell>numDocModificado</TableCell>
                  <TableCell>tipoIdentificacionComprador</TableCell>
                  <TableCell>razonSocial</TableCell>
                  <TableCell>codDoc</TableCell>
                  <TableCell>estab</TableCell>
                  <TableCell>ptoEmi</TableCell>
                  <TableCell>secuencial</TableCell>
                  <TableCell>idComprobante</TableCell>
                  <TableCell>ruc</TableCell>
                  <TableCell>isDocente</TableCell>
                  <TableCell>fecha</TableCell>
                  <TableCell>formaPago</TableCell>
                  <TableCell>formaPagoAdmitida</TableCell>
                  <TableCell>nombre</TableCell>
                  <TableCell>contribuyenteRimpe</TableCell>
                  <TableCell>fechaEmision</TableCell>
                  <TableCell>fechaAutorizacion</TableCell>
                  <TableCell>valor</TableCell>
                  <TableCell>infoAdicional</TableCell>
                  <TableCell>tipo</TableCell>
                  <TableCell>codigoPorcentaje</TableCell>
                  <TableCell>codigoAdmitido</TableCell>
                  <TableCell>tipoDocumento</TableCell>
                  <TableCell>numeroAutorizacion</TableCell>
                  <TableCell>xml_path</TableCell>
                  <TableCell>pdf_path</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comprobantes.map((comprobante, index) => (
                  <TableRow key={index}>
                    <TableCell>{comprobante.analisis?.fechaEmisionDocSustento}</TableCell>
                    <TableCell>{comprobante.analisis?.numDocModificado}</TableCell>
                    <TableCell>{comprobante.analisis?.tipoIdentificacionComprador}</TableCell>
                    <TableCell>{comprobante.analisis?.razonSocial}</TableCell>
                    <TableCell>{comprobante.analisis?.codDoc}</TableCell>
                    <TableCell>{comprobante.analisis?.estab}</TableCell>
                    <TableCell>{comprobante.analisis?.ptoEmi}</TableCell>
                    <TableCell>{comprobante.analisis?.secuencial}</TableCell>
                    <TableCell>{comprobante.analisis?.idComprobante}</TableCell>
                    <TableCell>{comprobante.analisis?.ruc}</TableCell>
                    <TableCell>{comprobante.analisis?.isDocente ? "Sí" : "No"}</TableCell>
                    <TableCell>{comprobante.analisis?.fecha}</TableCell>
                    <TableCell>{comprobante.analisis?.formaPago}</TableCell>
                    <TableCell>{comprobante.analisis?.formaPagoAdmitida}</TableCell>
                    <TableCell>{comprobante.analisis?.nombre}</TableCell>
                    <TableCell>{comprobante.analisis?.contribuyenteRimpe}</TableCell>
                    <TableCell>{comprobante.analisis?.fechaEmision}</TableCell>
                    <TableCell>{comprobante.analisis?.fechaAutorizacion}</TableCell>
                    <TableCell>{comprobante.analisis?.valor}</TableCell>
                    <TableCell>{JSON.stringify(comprobante.analisis?.infoAdicional)}</TableCell>
                    <TableCell>{comprobante.analisis?.tipo}</TableCell>
                    <TableCell>{comprobante.analisis?.codigoPorcentaje}</TableCell>
                    <TableCell>{comprobante.analisis?.codigoAdmitido}</TableCell>
                    <TableCell>{comprobante.analisis?.tipoDocumento}</TableCell>
                    <TableCell>{comprobante.analisis?.numeroAutorizacion}</TableCell>
                    <TableCell>{comprobante.analisis?.xml_path}</TableCell>
                    <TableCell>{comprobante.analisis?.pdf_path}</TableCell>
                </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );
    };
    return (
        <Box>
            <Typography variant="h6">Análisis de comprobantes</Typography>
            {renderFlatTable(comprobantes)}
        </Box>
    );
};

export default AnalyzeComponent;