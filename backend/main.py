from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, File, UploadFile
import xmltodict
import os
import chardet
import traceback
from datetime import datetime


formas_de_pago = [
    {"codigo": "1", "descripcion": "Sin utilizacion del sistema financiero", "admitido": False},
    {"codigo": "15", "descripcion": "Compensacion de deudas", "admitido": False},
    {"codigo": "16", "descripcion": "Tarjeta de débito", "admitido": False},
    {"codigo": "17", "descripcion": "Dinero electrónico", "admitido": False},
    {"codigo": "18", "descripcion": "Tarjeta prepago", "admitido": False},
    {"codigo": "19", "descripcion": "Tarjeta de crédito", "admitido": True},
    {"codigo": "20", "descripcion": "Otros con utilización del sistema financiero", "admitido": True},
    {"codigo": "21", "descripcion": "Endoso de títulos", "admitido": False}
]
formas_de_impuestos = [
    {"codigo": "0", "descripcion": "0%", "admitido": True},
    {"codigo": "2", "descripcion": "12%", "admitido": True},
    {"codigo": "6", "descripcion": "No objeto de impuesto", "admitido": False},
    {"codigo": "7", "descripcion": "Exento de IVA", "admitido": False},
    {"codigo": "4", "descripcion": "15%", "admitido": True}
]
tipos_de_documento = [
    {"codigo": "1", "descripcion": "FACTURA"},
    {"codigo": "4", "descripcion": "NOTA DE CRÉDITO"},
    {"codigo": "5", "descripcion": "NOTA DE DÉBITO"},
    {"codigo": "6", "descripcion": "GUÍA DE REMISIÓN"},
    {"codigo": "7", "descripcion": "COMPROBANTE DE RETENCIÓN"}
]

docentes = [
    "1726716325001",
]

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

@app.post("/api/analizarComprobante/")
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

@app.post("/api/analizarComprobantes/")
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
            analisis['ruta'] = calcular_ruta(analisis)
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

        tipoInfoDocumento = "infoFactura" if "infoFactura" in contenidoComprobante else "infoNotaCredito" if "infoNotaCredito" in contenidoComprobante else None
        if not tipoInfoDocumento:
            raise ValueError("El tipo de información del documento no es válido o no se encuentra en el XML.")
        
        infoComprobante = contenidoComprobante[tipoInfoDocumento]

        # Datos necesario extraidos 

        fechaEmisionDocSustento = infoComprobante.get('fechaEmisionDocSustento', '-')
        numDocModificado = infoComprobante.get('numDocModificado', '-')
        tipoIdentificacionComprador = infoComprobante.get('tipoIdentificacionComprador', '-')
        razonSocial = contenidoComprobante.get('infoTributaria', {}).get('razonSocial', '-') if tipoDocumento == 'factura' else contenidoComprobante.get('infoTributaria', {}).get('razonSocial', '-')
        codDoc = contenidoComprobante.get('infoTributaria', {}).get('codDoc', '-')
        estab = contenidoComprobante.get('infoTributaria', {}).get('estab', '-')
        ptoEmi = contenidoComprobante.get('infoTributaria', {}).get('ptoEmi', '-')
        secuencial = contenidoComprobante.get('infoTributaria', {}).get('secuencial', '-')
        idComprobante = f"{estab}-{ptoEmi}-{secuencial}"
        ruc = contenidoComprobante.get('infoTributaria', {}).get('ruc', '-')
        isDocente = is_ruc_in_docentes_list(ruc) and contains_string(contenidoComprobante.get('infoAdicional', {}).get('campoAdicional', []))
        string_fecha = infoComprobante.get('fechaEmision', '-')
        formaPago = infoComprobante.get('pagos', {}).get('pago', {}).get('formaPago', '-')
        formaPagoAdmitida = any([forma['admitido'] for forma in formas_de_pago if forma['codigo'] == formaPago])

        # obten ya sea razon social comprador o razon social retenido, solo exite uno
        nombre = infoComprobante.get('razonSocialComprador', None) or \
                      infoComprobante.get('razonSocialComprador', None) or \
                      infoComprobante.get('razonSocialSujetoRetenido', '-')

        regimenRimpe = infoComprobante.get('regimenRimpe', '-')
        fechaEmision = infoComprobante.get('fechaEmision', '-')
        fecha_excel = data_dict['autorizacion'].get('fechaAutorizacion', '-')
        valor = infoComprobante.get('importeTotal', '-')
        infoAdicional = contenidoComprobante.get('infoAdicional', {}).get('campoAdicional', '-')
        tipo = infoComprobante.get('tipo', '-')
        codigoPorcentaje = infoComprobante.get('codigoPorcentaje', '-')
        codigoAdmitido = infoComprobante.get('codigoAdmitido', '-')
        numeroAutorizacion = data_dict['autorizacion'].get('numeroAutorizacion', '-')
        
        try:
            fecha_excel = datetime.fromisoformat(string_fecha).strftime('%d/%m/%Y')
            string_fecha = datetime.fromisoformat(string_fecha).strftime('%Y%m%d')
        except:
            string_fecha = string_fecha.split("/")[2] + string_fecha.split("/")[1] + string_fecha.split("/")[0]
            fecha_excel = string_fecha


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
            "raw": data_dict
        }
    except KeyError as e:
        raise ValueError(f"KeyError al procesar los datos: {str(e)}")
    

def calcular_ruta(analisis):
    try:
        if not analisis:
            return f"error_forma_pago/{analisis['razonSocial']}/{analisis['numeroAutorizacion']}"
        if analisis['isDocente']:
            if not analisis['formaPagoAdmitida']:
                return f"error_forma_pago/{analisis['razonSocial']}/{analisis['numeroAutorizacion']}"
            return f"docentes/{analisis['fecha']}/{analisis['estab']}{analisis['ptoEmi']}{analisis['secuencial']}"
        if analisis['tipoDocumento'] == "factura":
            if not analisis['formaPagoAdmitida']:
                return f"error_forma_pago/{analisis['razonSocial']}/{analisis['numeroAutorizacion']}"
            return f"proveedores/{analisis['razonSocial']}/{analisis['estab']}{analisis['ptoEmi']}{analisis['secuencial']}"
        return f"nota_credito/{analisis['razonSocial']}/{analisis['estab']}{analisis['ptoEmi']}{analisis['secuencial']}"
    except Exception as e:
        return str(e)



def contains_string(infoAdicional, search_string="202501"):
    for item in infoAdicional:
        if search_string in item.get('@nombre', '') or search_string in item.get('#text', ''):
            return True
    return False


def is_ruc_in_docentes_list(ruc):
    return ruc.strip() in docentes