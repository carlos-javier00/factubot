from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import xmltodict
import io

app = FastAPI()

# Configuración de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Cambia este valor si usas otro dominio para el frontend
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],  # Permite todos los encabezados
)

# Ruta para convertir XML a JSON
@app.post("/convertir/")
async def convertir_xml_a_json(file: UploadFile = File(...)):
    try:
        content = await file.read()
        data_dict = xmltodict.parse(content)

        comprobante_xml = data_dict['autorizacion']['comprobante']
        comprobante_dict = xmltodict.parse(comprobante_xml)
        data_dict['autorizacion']['comprobante'] = comprobante_dict

        return JSONResponse(content=data_dict, status_code=200)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)

@app.post("/convertirExample/")
async def convertir_xml_a_json_example(file: UploadFile = File(...)):

    example_dict = { 
        "fechaEmisionDocSustento": "2023-10-01",
        "numDocModificado": "001-001-000000001",
        "tipoIdentificacionComprador": "05",
        "razonSocial": "EMPRESA S.A.",
        "codDoc": "01",
        "estab": "001",
        "ptoEmi": "001",
        "secuencial": "000000001",
        "idComprobante": "1234567890",
        "ruc": "1234567890001",
        "isDocente": True,
        "fecha": "2023-10-01",
        "formaPago": "01",
        "formaPagoAdmitida": "01",
        "nombre": "Juan Perez",
        "contribuyenteRimpe": "RIMPE",
        "fechaEmision": "2023-10-01",
        "fechaAutorizacion": "2023-10-01T12:00:00",
        "valor": "100.00",
        "infoAdicional": "Información adicional",
        "tipo": "Factura",
        "codigoPorcentaje": "2",
        "codigoAdmitido": "2",
        "tipoDocumento": "01",
        "numeroAutorizacion": "1234567890",
        "xml_path": "/path/to/xml",
        "pdf_path": "/path/to/pdf"
    }
    return JSONResponse(content=example_dict, status_code=200)