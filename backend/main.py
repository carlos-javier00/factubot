from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile
import xmltodict
import os
import chardet
import traceback

app = FastAPI()

# Configurar CORS
origins = [
    "*" # Origen permitido para cualquier cliente
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/analizarComprobante/")
async def analizar_comprobante(file: UploadFile = File(...)):
    try:
        # Intenta leer el archivo xml, si no se puede, utiliza chardet para detectar la codificación
        try:
            content = await file.read()
            content = content.decode('utf-8')

        except UnicodeDecodeError:
            content = await file.read()
            encoding = chardet.detect(content)
            content = content.decode(encoding).encode('utf-8')
        
        # Convierte el contenido del archivo xml a un diccionario
        data_dict = xmltodict.parse(content)
        #dentro de data dict tengo un string cuya clave es comprobante  y su valor es un xml con la informacion del comprobante
        #quiero convertir ese xml a un diccionario y colocarlo en la clave comprobante
        data_dict['autorizacion']['comprobante'] = xmltodict.parse(data_dict['autorizacion']['comprobante'])


        content = extract_data(data_dict)

    except Exception as e:
        print(5)
        return JSONResponse(content={"error": str(e), "traceback":
                                    traceback.format_exc()
                                     
                                     }, status_code=400)
    print(6)
    return content

@app.post("/analizarComprobantes/")
async def analizar_comprobantes(files: list[UploadFile] = File(...)):
    try:
        data = []
        for file in files:
            # Intenta leer el archivo xml, si no se puede, utiliza chardet para detectar la codificación
            try:
                content = await file.read()
                content = content.decode('utf-8')

            except UnicodeDecodeError:
                content = await file.read()
                encoding = chardet.detect(content)
                content = content.decode(encoding).encode('utf-8')
            
            # Obten el nombre del archivo
            filename = file.filename
            # Convierte el contenido del archivo xml a un diccionario
            data_dict = xmltodict.parse(content)
            #dentro de data dict tengo un string cuya clave es comprobante  y su valor es un xml con la informacion del comprobante
            #quiero convertir ese xml a un diccionario y colocarlo en la clave comprobante
            data_dict['autorizacion']['comprobante'] = xmltodict.parse(data_dict['autorizacion']['comprobante'])
            analisis = extract_data(data_dict)
            data.append({
                "filename": filename,
                "analisis": analisis
            })

    except Exception as e:
        return JSONResponse(content={"error": str(e), "traceback":
                                    traceback.format_exc()
                                     }, status_code=400)
    return data

    

def extract_data(data_dict):
    try:
        
        comprobante = data_dict['autorizacion']['comprobante']

        tipoDocumento = "factura" if "factura" in comprobante else "notaCredito" if "notaCredito" in comprobante else None
        if not tipoDocumento:
            raise ValueError("El tipo de documento no es válido o no se encuentra en el XML.")

        contenidoComprobante = comprobante[tipoDocumento]

        # Datos necesario extraidos 

        fechaEmisionDocSustento = contenidoComprobante.get('infoNotaCredito', {}).get('fechaEmisionDocSustento', '-')
        numDocModificado = contenidoComprobante.get('infoNotaCredito', {}).get('numDocModificado', '-')
        tipoIdentificacionComprador = contenidoComprobante.get('infoFactura', {}).get('tipoIdentificacionComprador', '-')
        razonSocial = contenidoComprobante.get('infoTributaria', {}).get('razonSocial', '-') if tipoDocumento == 'factura' else contenidoComprobante.get('infoTributaria', {}).get('razonSocial', '-')
        codDoc = contenidoComprobante.get('infoTributaria', {}).get('codDoc', '-')
        estab = contenidoComprobante.get('infoTributaria', {}).get('estab', '-')
        ptoEmi = contenidoComprobante.get('infoTributaria', {}).get('ptoEmi', '-')
        secuencial = contenidoComprobante.get('infoTributaria', {}).get('secuencial', '-')
        idComprobante = f"{estab}-{ptoEmi}-{secuencial}"
        ruc = contenidoComprobante.get('infoTributaria', {}).get('ruc', '-')
        isDocente = contenidoComprobante.get('infoAdicional', {}).get('isDocente', '-')
        string_fecha = contenidoComprobante.get('infoFactura', {}).get('fechaEmision', '-')
        formaPago = contenidoComprobante.get('infoFactura', {}).get('formaPago', '-')
        formaPagoAdmitida = contenidoComprobante.get('infoFactura', {}).get('formaPagoAdmitida', '-')

        # obten ya sea razon social comprador o razon social retenido, solo exite uno
        nombre = contenidoComprobante.get('infoFactura', {}).get('razonSocialComprador', None) or \
                      contenidoComprobante.get('infoNotaCredito', {}).get('razonSocialComprador', None) or \
                      contenidoComprobante.get('infoNotaCredito', {}).get('razonSocialSujetoRetenido', '-')

        regimenRimpe = contenidoComprobante.get('infoTributaria', {}).get('regimenRimpe', '-')
        fechaEmision = contenidoComprobante.get('infoFactura', {}).get('fechaEmision', '-')
        fecha_excel = data_dict['autorizacion'].get('fechaAutorizacion', '-')
        valor = contenidoComprobante.get('infoFactura', {}).get('valor', '-')
        infoAdicional = contenidoComprobante.get('infoAdicional', {}).get('campoAdicional', '-')
        tipo = contenidoComprobante.get('infoNotaCredito', {}).get('tipo', '-')
        codigoPorcentaje = contenidoComprobante.get('infoFactura', {}).get('codigoPorcentaje', '-')
        codigoAdmitido = contenidoComprobante.get('infoFactura', {}).get('codigoAdmitido', '-')
        numeroAutorizacion = data_dict['autorizacion'].get('numeroAutorizacion', '-')
        
        # si es factura /proveedores/{razonSocial}/{estab}{ptoEmi}{secuencial}.xml y si es nota de credito /nota_credito/{razonSocial}/{estab}{ptoEmi}{secuencial}.xml
        xml_path = f"/proveedores/{razonSocial}/{estab}{ptoEmi}{secuencial}.xml" if tipoDocumento == "factura" else f"/nota_credito/{razonSocial}/{estab}{ptoEmi}{secuencial}.xml"
        pdf_path = f"/proveedores/{razonSocial}/{estab}{ptoEmi}{secuencial}.pdf" if tipoDocumento == "factura" else f"/nota_credito/{razonSocial}/{estab}{ptoEmi}{secuencial}.pdf"

        return {
            "fechaEmisionDocSustento": fechaEmisionDocSustento,
            "numDocModificado": numDocModificado,
            "tipoIdentificacionComprador": tipoIdentificacionComprador,
            "razonSocial": razonSocial.strip().upper(),
            "codDoc": codDoc,
            "estab": estab,
            "ptoEmi": ptoEmi,
            "secuencial": secuencial,
            "idComprobante": idComprobante,
            "ruc": ruc,
            "isDocente": isDocente,
            "fecha": string_fecha,
            "formaPago": formaPago,
            "formaPagoAdmitida": formaPagoAdmitida,
            "nombre": nombre if nombre else "-",
            "contribuyenteRimpe": regimenRimpe,
            "fechaEmision": fechaEmision,
            "fechaAutorizacion": fecha_excel,
            "valor": valor if valor else "-",
            "infoAdicional": infoAdicional,
            "tipo": tipo,
            "codigoPorcentaje": codigoPorcentaje,
            "codigoAdmitido": codigoAdmitido,
            "tipoDocumento": tipoDocumento,
            "numeroAutorizacion": numeroAutorizacion,
            "xml_path": xml_path,
            "pdf_path": pdf_path,
            "raw": data_dict
        }
    except KeyError as e:
        raise ValueError(f"KeyError al procesar los datos: {str(e)}")