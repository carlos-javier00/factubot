# Usar una imagen base de Python
FROM python:3.11-slim

# Establecer el directorio de trabajo en el contenedor
WORKDIR /app

# Copiar los archivos de requerimientos
COPY requirements.txt .

# Instalar las dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación
COPY . .

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 8000

# Comando para ejecutar la aplicación en modo de desarrollo
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]