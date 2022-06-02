# Flatgeobuf POC

Prueba de concepto en el uso de FlatGeobuf.

Para la prueba de concepto hemos descargado mediante la utilidad [cidownloader](https://github.com/geomatico/cidownloader) los datos del catastro de Oviedo. 

## Preparación del entorno

Para el uso del cidownloader necesitaremos crear un entorno virtual. Nosotros en geomatico usamos Conda. Encontraréis las instrucciones de instalación en su web. [Instalar Conda en Linux](https://docs.conda.io/projects/conda/en/latest/user-guide/install/linux.html)

Una vez instalada Conda, crearemos un entorno con Python 3.9 e instalaremos la versión 3.4 de GDAL.

```bash
conda create --name flatgeobuf python=3.9
``` 

activamos e instalamos GDAL

```bash
conda activate flatgeobuf

conda install -c conda-forge gdal
```

podemos comprobar que GDAL se encuentra instalado:

```bash
ogrinfo --version

GDAL 3.5.0, released 2022/05/10
```

Instalamos cidownloader y descargamos lo que nos interesa

```
pip install CatastroInspireDownloader

cidownloader -p 33 -m 900--tipo buildings
```

Una vez terminada la descarga tendremos un GeoPackage que podremos convertir a Flatgeobuf mediante OGR

```bash
ogr2ogr -f FlatGeoBuf buildings_Territorial_office_33_Oviedo.fgb buildings_Territorial_office_33_Oviedo.gpkg -sql "SELECT * FROM Building"
```

El resultado será un archivo `buildings_Territorial_office_33_Oviedo.fgb`que podréis publicar en vuestros CDNs y consumir directamente desde ahí


[https://cdn.geomatico.es/datasets/buildings_Territorial_office_33_Oviedo.fgb](https://cdn.geomatico.es/datasets/buildings_Territorial_office_33_Oviedo.fgb)