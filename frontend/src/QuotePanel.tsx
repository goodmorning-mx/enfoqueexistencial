import { useEffect, useRef, useState } from 'react';
import SessionMap from './SessionMap';
import {
  BASE, DISCOUNTS, HOURS, INCLUDED_RADIUS, LAST_MINUTE_DISCOUNT, MINIMUM, ORIGIN,
  hourLabel, localToday, minutesUntil, money, quoteSession, slotKey,
  type Hour, type PlaceType, type Plan, type Point,
} from './pricing';

const bookingPage = 'https://calendar.app.google/hfG1AN1KY7jpz1Qe7';

const dateForNextWindow = (now: Date) => {
  const today = localToday(now);
  return minutesUntil(today, HOURS[HOURS.length - 1], now) > 0 ? today : localToday(new Date(now.getTime() + 86_400_000));
};
const firstHour = (date: string, now: Date): Hour | null =>
  HOURS.find(hour => minutesUntil(date, hour, now) > 0) ?? null;

export default function QuotePanel({ reducedMotion }: { reducedMotion: boolean }) {
  const [now, setNow] = useState(() => new Date());
  const [date, setDate] = useState(() => dateForNextWindow(now));
  const [chosenHour, setChosenHour] = useState<Hour>(() => firstHour(date, now) ?? HOURS[0]);
  const [point, setPoint] = useState<Point>(ORIGIN);
  const [placeType, setPlaceType] = useState<PlaceType>('inside');
  const [plan, setPlan] = useState<Plan>('single');
  const [ticket, setTicket] = useState('');
  const [openSlots, setOpenSlots] = useState<ReadonlySet<string>>(new Set());
  const tariff = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const abort = new AbortController();
    const refresh = async () => {
      setNow(new Date());
      try {
        const result = await fetch(`${import.meta.env.BASE_URL}availability.json`, {
          cache: 'no-store', signal: abort.signal,
        });
        if (!result.ok) throw new Error('Availability unavailable');
        const data = await result.json() as { openSlots?: unknown };
        const slots = Array.isArray(data.openSlots) ? data.openSlots : [];
        if (!abort.signal.aborted) {
          setOpenSlots(new Set(slots.filter((value): value is string => typeof value === 'string')));
        }
      } catch {
        if (!abort.signal.aborted) setOpenSlots(new Set());
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60_000);
    return () => { window.clearInterval(timer); abort.abort(); };
  }, []);

  const today = localToday(now);
  const selectedDate = date < today ? dateForNextWindow(now) : date;
  const hour = minutesUntil(selectedDate, chosenHour, now) > 0 ? chosenHour : firstHour(selectedDate, now);
  const minutes = hour === null ? NaN : minutesUntil(selectedDate, hour, now);
  const lastMinute = hour !== null && minutes > 0 && minutes <= 24 * 60 && openSlots.has(slotKey(selectedDate, hour));
  const ticketAmount = Number(ticket);
  const validTicket = placeType !== 'event' || (Number.isFinite(ticketAmount) && ticketAmount >= 0 && ticketAmount <= 100_000);
  const quote = hour === null || !validTicket ? null : quoteSession({ point, hour, placeType, plan, ticket: ticketAmount, lastMinute });

  return (
    <section className="quote-pane pane" aria-labelledby="quote-title">
      <div className="quote-heading">
        <div><p className="kicker"><span className="signal-dot" /> COTIZADOR</p><h2 id="quote-title">Tu vida, <span className="quote-highlight">tu elección.</span></h2></div>
        <p>Toca el mapa o arrastra el pin.<br />Elige fecha, hora y modalidad.</p>
      </div>
      <SessionMap point={point} price={quote ? money(quote.perSession) + ' / h' : 'Elige un horario'}
        onPoint={setPoint} reducedMotion={reducedMotion} />

      <div className="quote-config">
        <div className="fields">
          <label>Fecha<input type="date" min={today} value={selectedDate} onChange={event => {
            if (event.target.value && event.target.value >= today) setDate(event.target.value);
          }} /></label>
          <label>Hora<select value={hour ?? ''} onChange={event => setChosenHour(Number(event.target.value) as Hour)}>
            {hour === null && <option value="">Sin horarios</option>}
            {HOURS.map(item => <option key={item} value={item} disabled={minutesUntil(selectedDate, item, now) <= 0}>{hourLabel(item)}</option>)}
          </select></label>
          <label>Modalidad<select value={placeType} onChange={event => setPlaceType(event.target.value as PlaceType)}>
            <option value="inside">Establecimiento</option><option value="outside">Al aire libre</option><option value="event">Evento de paga</option>
          </select></label>
          <label>Tipo de sesión<select value={plan} onChange={event => setPlan(event.target.value as Plan)}>
            <option value="single">Sesión única</option><option value="first">Primera valoración</option><option value="monthly">Paquete de 4</option>
          </select></label>
        </div>
        {placeType === 'event' && <label className="ticket">
          Entrada del terapeuta por sesión (MXN) <input type="number" min="0" max="100000" step="0.01" placeholder="0" value={ticket}
            aria-invalid={!validTicket} onChange={event => setTicket(event.target.value)} />
        </label>}
        <div className="quote-summary">
          <div className="quote-total">
            <div className="amount">
              <span className="price" aria-live="polite">{quote ? money(quote.perSession) : '—'}</span>
              <span>MXN / {plan === 'monthly' ? 'sesión · promedio' : 'hora'}{quote && plan === 'monthly' && <><br />{money(quote.total)} por 4 sesiones</>}</span>
            </div>
            <button type="button" className="plain-button breakdown-toggle" onClick={() => tariff.current?.showModal()}>
              Ver desglose <span aria-hidden="true">↗</span>
            </button>
          </div>
          <a className="book-appointment" href={bookingPage} target="_blank" rel="noreferrer">
            Agendar cita <span aria-hidden="true">↗</span>
            <span className="sr-only"> en Google Calendar (abre en otra pestaña)</span>
          </a>
        </div>
        <p className="quote-note">{!validTicket ? 'Ingresa un costo de entrada entre $0 y $100,000.' : hour === null ? 'Elige otra fecha para cotizar.' : lastMinute && quote && quote.discount > DISCOUNTS[plan] ? 'Incluye beneficio de última hora. Cotización sin reserva.' : 'Estimación en hora de CDMX. Confirma disponibilidad al agendar.'}</p>
      </div>

      <dialog ref={tariff} className="modal tariff-modal" aria-labelledby="tariff-title">
        <form method="dialog"><button className="icon-button modal-close" aria-label="Cerrar desglose">×</button></form>
        <p className="kicker">TU COTIZACIÓN</p>
        <h2 id="tariff-title">Cómo se calcula.</h2>
        {quote && <dl className="rates">
          <div><dt>Tarifa base por hora</dt><dd>{money(BASE)}</dd></div>
          <div><dt>Traslado · {quote.distance.toFixed(1)} km</dt><dd>+{money(quote.travel)}</dd></div>
          <div><dt>Ajuste por horario</dt><dd>+{money(quote.hour)}</dd></div>
          <div><dt>Ajuste por modalidad</dt><dd>+{money(quote.place)}</dd></div>
          {placeType === 'event' && <div><dt>Entrada del terapeuta por sesión</dt><dd>+{money(quote.ticket)}</dd></div>}
          <div><dt>{plan === 'monthly' ? 'Descuentos en la primera de las 4 sesiones' : 'Descuentos aplicados'}</dt><dd>−{money(quote.discount)}</dd></div>
          {plan === 'monthly' && <div><dt>Descuento en cada sesión restante</dt><dd>−{money(DISCOUNTS.monthly)}</dd></div>}
          <div className="rates-total"><dt>{plan === 'monthly' ? 'Total por 4 sesiones' : 'Total por hora'}</dt><dd>{money(quote.total)} MXN</dd></div>
        </dl>}
        <p>El traslado está incluido hasta {INCLUDED_RADIUS} km en línea recta desde Nomaddicts Hostal (Av. Chapultepec 79). Fuera de ese radio, se estiman $22 MXN por km adicional.</p>
        <p>La primera valoración reduce hasta {money(DISCOUNTS.first)}. El paquete reduce {money(DISCOUNTS.monthly)} por sesión. Las horas confirmadas como libres en las próximas 24 horas reciben hasta {money(LAST_MINUTE_DISCOUNT)} adicionales de descuento en esa sesión. La tarifa de sesión tiene un mínimo de {money(MINIMUM)} MXN.</p>
        <p>Las sesiones duran una hora. Puedes cotizar a las {HOURS.map(hourLabel).join(', ')}. Los espacios libres se confirman en Google Calendar. En un evento de paga, tu propia entrada se cubre por separado.</p>
      </dialog>
    </section>
  );
}
