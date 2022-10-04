# mnt-monitor

Una aplicación que monitorea el montaje de unidades y carpetas compartidas.

## Implementación

- Clone el repositorio y y haga `cd` a la carpeta recién clonada:
    ```bash
    git clone git@github.com:Dr-NULL/mnt-monitor.git
    cd mnt-monitor
    ```

- Instale las dependencias y tranpile el proyecto:
    ```bash
    npm i
    npm run build
    ```

## Cómo usar

- Ejecute el programa, éste generará un nuevo archivo `"./appconfig.yml"`:
    ```bash
    node ./dist
    ```

- Configure el archivo generado recién generado. Por ejemplo:
    ```yml
    # Tiempo de espera en ms entre cada comprobación
    interval: 5000

    # Lista de carpetas que deben de ser montadas
    targets:
        - "/mnt/shared-folder-01"
        - "/mnt/shared-folder-02"
        - "/mnt/shared-folder-03"
    ```

- Cuando tenga el archivo listo, vuelva a ejecutar el programa:
    ```bash
    node ./dist
    ```

## Cómo funciona

- La aplicación al iniciar, revisa el archivo "./appconfig.yml":
    - Si el archivo no existe, lo crea con datos de ejemplo.
    - Si lo encuentras pero es inválido, lo reemplaza por uno válido de ejemplo.

- En caso de que el archivo es válido, empieza el ciclo de lectura:
    - Lee el archivo `"./appconfig.yml"`.
    - Revisa si todas las carpetas declaradas en el archivo están montadas.
    - Intenta montar todas las carpetas que no estén montadas.
    - Inicia un tiempo de espera (declarado en el archivo de configuración) antes de iniciar la siguiente vuelta.