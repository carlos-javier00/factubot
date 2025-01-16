import React, { useEffect } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

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

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                {comprobantes.filter(comprobante => comprobante.analizable).length} 
                comprobantes analizados
            </Typography>
        </Box>
    );
};

export default AnalyzeComponent;