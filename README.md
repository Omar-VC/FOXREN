# FOXREN

**Plataforma digital para la gestión de torneos de pádel amateur y la centralización del historial deportivo de jugadores.**

FOXREN es un proyecto en desarrollo orientado a profesionalizar la organización de torneos de pádel, simplificar la gestión de competencias y construir una base de datos deportiva que permita centralizar los resultados, el historial y los futuros rankings de jugadores a través de distintos complejos y organizadores.

El objetivo es construir un ecosistema deportivo escalable, confiable y eficiente, capaz de acompañar el crecimiento de los circuitos de pádel amateur.

## Objetivos principales

- Digitalizar y simplificar la gestión de torneos.
- Centralizar el registro de jugadores y parejas.
- Organizar competencias, categorías, zonas y partidos.
- Registrar resultados de manera consistente y verificable.
- Construir un historial deportivo asociado a cada jugador.
- Desarrollar rankings basados en reglas de puntuación definidas.
- Facilitar la gestión de múltiples torneos, complejos y circuitos.
- Mantener una arquitectura preparada para incorporar nuevas funcionalidades.

## Tecnologías

- **Frontend:** React, TypeScript y Vite.
- **Backend e infraestructura:** Firebase.
- **Base de datos:**  Firestore.
- **Autenticación:** Firebase Authentication.
- **Control de versiones:** Git y GitHub.

## Arquitectura del proyecto

FOXREN organiza su código en capas para separar las reglas de negocio, los casos de uso, el acceso a datos y la interfaz de usuario.

```text
src/
├── app/              # Interfaz y módulos de la aplicación
├── domain/           # Entidades, tipos y reglas de negocio
├── application/      # Casos de uso y coordinación de operaciones
└── infrastructure/   # Repositorios e integración con Firebase
```

### Principios de arquitectura

- Separación de responsabilidades.
- Reglas de negocio independientes de la interfaz.
- Acceso a datos centralizado mediante repositorios.
- Validación de operaciones antes de persistir información.
- Consistencia de los resultados y del historial deportivo.
- Diseño orientado al mantenimiento y la evolución del sistema.

## Funcionalidades desarrolladas

El proyecto cuenta con una base funcional para la administración de competencias de pádel.

- Gestión del estado de las inscripciones.
- Registro de parejas participantes.
- Generación de zonas y distribución de parejas.
- Generación automática de partidos por zona.
- Visualización de partidos y sus estados.
- Registro de resultados, incluyendo resultados normales, walkover, abandono y suspensión.
- Validaciones de marcadores y sets.
- Actualización del estado del partido al registrar un resultado.
- Preparación del registro de historial deportivo a partir de resultados oficiales.

Las funcionalidades deben seguir verificándose mediante pruebas funcionales y de integración antes de considerarse completamente validadas.

## Próximas etapas

- Verificar la persistencia de resultados oficiales y del historial de jugadores.
- Implementar tablas de posiciones por zona.
- Automatizar la clasificación de parejas.
- Generar cuadros de eliminación directa.
- Desarrollar perfiles e historiales públicos de jugadores.
- Implementar un sistema de ranking configurable.
- Ampliar la gestión hacia múltiples complejos, organizadores y circuitos.

## Rendimiento y escalabilidad

FOXREN busca aprovechar eficientemente los recursos de Firebase, especialmente dentro de las cuotas del plan Spark.

Para ello, el desarrollo contempla:

- Consultas específicas y reducción de lecturas innecesarias.
- Escrituras agrupadas cuando corresponda.
- Operaciones atómicas para mantener la consistencia de los datos.
- Validaciones para prevenir resultados duplicados o inconsistentes.
- Reglas de seguridad y control de acceso.
- Índices y estructura de datos adecuados para las consultas reales.
- Pruebas de rendimiento y seguimiento del consumo de recursos.

Estos criterios deberán validarse a medida que crezcan el volumen de torneos, partidos y jugadores.

## Filosofía del proyecto

- **Una identidad por jugador:** evitar duplicados y mantener la continuidad del historial deportivo.
- **Integridad deportiva:** los resultados deben respetar las reglas definidas para cada competencia.
- **Transparencia:** los rankings deben responder a criterios claros y verificables.
- **Centralización:** cada torneo puede contribuir al historial deportivo del jugador.
- **Escalabilidad:** la arquitectura debe acompañar el crecimiento sin complejidad innecesaria.
- **Eficiencia:** utilizar los recursos técnicos de forma responsable.

## Estado del proyecto

FOXREN se encuentra en etapa de desarrollo funcional y consolidación de su arquitectura.

La prioridad actual es asegurar la integridad del registro de resultados, verificar la generación del historial deportivo y avanzar hacia las tablas de posiciones y la clasificación automática.

El sistema de puntuación y las reglas definitivas del ranking deberán establecerse y documentarse antes de su implementación como criterios oficiales.

---

**FOXREN — Gestión deportiva, historial y evolución del pádel amateur.**
