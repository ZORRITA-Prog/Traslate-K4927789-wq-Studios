<div align="center">

<img src="https://inmiku.infinityfreeapp.com/u/ImMiku_a01325e7.jpg" alt="Icono del Proyecto" width="120" style="border-radius: 50%;">

# TRASTALE V6

![Banner](https://inmiku.infinityfreeapp.com/u/ImMiku_8148991f.gif)

*Plataforma web modular con soporte multiidioma, autenticación de usuarios y administración de perfiles.*

---

</div>

## Descripción General

**Trastale-V6** es un sistema web optimizado que integra un backend ligero en PHP con una arquitectura de frontend basada en JavaScript modular. La plataforma permite la gestión de usuarios, personalización de perfiles, traducción dinámica y panel de administración en un entorno seguro y estructurado.

---

## Características Principales

* **Sistema de Autenticación (`auth.js`):** Control de acceso y sesiones de usuario.
* **Panel de Administración (`admin.js`):** Interfaz dedicada para la gestión del sistema.
* **Gestión de Perfiles (`profile.js`):** Edición y visualización de datos de usuario.
* **Motor de Traducción (`translate.js`):** Soporte multiidioma integrado en el cliente.
* **Capa de Interfaz (`ui.js` / `style.css`):** Diseño visual adaptativo y componentes interactivos.
* **API y Almacenamiento Local (`api.js` / `local.js`):** Sincronización de datos mediante endpoints en PHP y almacenamiento web local.

---

## Arquitectura del Proyecto

```text
Trastale-V6/
├── api/
│   ├── data/
│   │   └── .htaccess
│   └── api.php
├── css/
│   └── style.css
├── js/
│   ├── admin.js
│   ├── api.js
│   ├── auth.js
│   ├── config.js
│   ├── local.js
│   ├── main.js
│   ├── profile.js
│   ├── translate.js
│   ├── ui.js
│   └── utils.js
├── index.html
└── LEEME.txt
```

---

## Estructura de Módulos JavaScript

| Módulo | Función |
| :--- | :--- |
| `config.js` | Definición de constantes y parámetros globales del sistema. |
| `api.js` | Controlador de peticiones hacia el backend (`api.php`). |
| `auth.js` | Manejo de login, registro y persistencia de sesión. |
| `ui.js` | Renderizado dinámico y manipulación del DOM. |
| `translate.js` | Carga e intercambio de diccionarios de idioma. |
| `local.js` | Manejo de caché y `localStorage`. |
| `utils.js` | Funciones auxiliares y formateadores. |

---

## Instalación y Configuración

1. **Clonar o descargar el repositorio:**
   Asegúrate de colocar la carpeta `Trastale-V6` en el directorio raíz de tu servidor web (Apache, Nginx, XAMPP, etc.).

2. **Configuración del Servidor:**
   * Requiere un entorno que ejecute PHP para el directorio `/api/`.
   * Verifica que las directivas de seguridad en `/api/data/.htaccess` coincidan con el entorno de tu servidor.

3. **Acceso:**
   Navega a la ruta principal desde tu navegador web:
   ```text
   http://localhost/Trastale-V6/index.html
   ```

---

## Licencia y Créditos

Desarrollado para la gestión eficiente de servicios web. Todos los derechos reservados.