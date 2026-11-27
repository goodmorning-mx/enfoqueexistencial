# Cotizador yoExistoCDMX

La marca pública es yoExistoCDMX y el dominio previsto es `www.yoexisto.mx`.

La landing calcula importes orientativos de una hora en el navegador. El pin no se envía al backend y elegir un horario no crea una reserva. El horario se interpreta en Ciudad de México. El origen del cálculo es un punto público cercano al Ángel de la Independencia, en la zona del CP 06600.

## Reglas iniciales en DEV

| Variable | Regla |
| --- | --- |
| Precio base y mínimo | $410 MXN de base y $350 MXN de mínimo para la sesión, antes de la entrada de un evento |
| Traslado | Incluido en 2.5 km en línea recta. $22 MXN por km adicional, redondeados al peso |
| Inicios a las 15, 17, 19 y 21 h | Ajustes de $0, $15, $30 y $25, respectivamente |
| Establecimiento, aire libre, evento | Ajustes de $0, $30 y $60. En eventos se suma el costo introducido de la entrada del terapeuta por sesión |
| Primera valoración | Hasta $60 de descuento en una sesión |
| Paquete mensual | $40 de descuento por cada una de las cuatro sesiones. La cotización usa el mismo lugar, modalidad y horario para las cuatro |
| Última hora | Hasta $25 de descuento adicional en la sesión de inicio, si es un espacio confirmado y faltan hasta 24 h |

Los ajustes se editan en `frontend/src/pricing.ts`. El traslado es una aproximación, no un precio en vivo de Uber. Comparar recorridos reales de ida y vuelta alrededor de las horas de atención antes de definir la tarifa definitiva.

## Espacios libres

`frontend/public/availability.json` se publica como dato público y admite un arreglo `openSlots` con fechas en formato `AAAA-MM-DDTHH:00`, en hora de CDMX. Publicar solo horas que el operador confirmó libres; retirar una hora cuando deje de estar disponible. Este archivo se mantiene manualmente para el beneficio de última hora. «Agendar cita» abre Google Calendar, que muestra los espacios disponibles para reservar. El cotizador omite el beneficio si el archivo no está disponible o no lista la fecha y hora exactas. El archivo no lleva datos de consultantes.

## Dependencias y reversión

La cartografía usa [OpenFreeMap](https://openfreemap.org/) y MapLibre GL JS, con puntos de referencia como alternativa. La galería usa fotos de CDMX con créditos y los efectos de React Bits vendorizados en `frontend/src/effects/`. Para revertir la versión de DEV, abrir un PR que revierta el commit de integración y verificar `/version.json` después del despliegue.
