# FOXREN

FOXREN es una plataforma digital diseñada para organizar, administrar y centralizar la actividad deportiva de los circuitos de pádel.  
Su propósito es profesionalizar la organización de torneos, construir un historial deportivo único para cada jugador y mantener un ranking transparente y actualizado.

## 🚀 Objetivos principales
- Profesionalizar la organización de torneos de pádel.
- Centralizar el registro oficial de jugadores.
- Evitar registros duplicados.
- Construir un historial deportivo permanente.
- Implementar un ranking transparente y actualizado.
- Facilitar el trabajo de los organizadores.
- Escalar hacia múltiples circuitos deportivos.

## 🏗️ Arquitectura
- **Frontend:** React + TypeScript + Vite  
- **Backend / Infraestructura:** Firebase  
- **Organización del código:**  
  - `src/domain` → entidades deportivas (jugador, torneo, ranking, etc.)  
  - `src/features` → casos de uso y componentes específicos  
  - `src/infrastructure` → conexión con servicios externos  
  - `src/shared` → utilidades y constantes comunes  

## 📊 Sistema de puntuación (versión inicial)
- Victoria: +5 puntos  
- Derrota: 0 puntos  
- Bonus por instancia:  
  - Cuartos: +5  
  - Semifinal: +10  
  - Finalista: +20  
  - Campeón: +30  
- Fórmula provisional:  
  

\[(5 × victorias + bonus) × multiplicador\]



## 🔑 Filosofía
- Un jugador, una identidad.  
- El mérito deportivo se gana.  
- El ranking representa el presente.  
- FOXREN administra el ecosistema.

---

⚡ Proyecto en desarrollo — etapa actual: diseño de arquitectura y cierre del sistema de puntuación.
