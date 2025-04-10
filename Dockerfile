# Imagen base
FROM python:3.10-slim

# Establecer el directorio de trabajo
WORKDIR /app

COPY requirements.txt .

# Copiar los archivos al contenedor
COPY . /app

# Instalar dependencias
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Exponer el puerto
EXPOSE 5000

# Comando para ejecutar la app
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
CMD ["python", "app.py"]
