import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { Point } from './pricing';
import { searchAddresses, type AddressMatch } from './mapSearch';

const messages = {
  idle: '',
  loading: 'Buscando direcciones…',
  empty: 'No encontramos direcciones en el área del mapa. Prueba con otra calle o mueve el pin.',
  error: 'La búsqueda no está disponible por el momento. Puedes mover el pin.',
  ready: '',
  selected: 'Pin actualizado.',
};

export default function AddressSearch({ onSelect }: { onSelect: (point: Point) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AddressMatch[]>([]);
  const [status, setStatus] = useState<keyof typeof messages>('idle');
  const input = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);

  useEffect(() => () => request.current?.abort(), []);

  const clearSearch = () => {
    request.current?.abort();
    setResults([]);
    setStatus('idle');
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 3 || status === 'loading') return;

    clearSearch();
    const controller = new AbortController();
    request.current = controller;
    setStatus('loading');
    const timeout = window.setTimeout(() => {
      if (controller.signal.aborted) return;
      controller.abort();
      setStatus('error');
    }, 8_000);
    try {
      const matches = await searchAddresses(term, controller.signal);
      if (controller.signal.aborted) return;
      setResults(matches);
      setStatus(matches.length ? 'ready' : 'empty');
    } catch {
      if (!controller.signal.aborted) setStatus('error');
    } finally {
      window.clearTimeout(timeout);
      if (request.current === controller) request.current = null;
    }
  };

  return (
    <form className="map-search" role="search" aria-label="Direcciones en el mapa" onSubmit={submit}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          clearSearch();
          input.current?.focus();
        }
      }}>
      <div className="map-search-row">
        <label className="sr-only" htmlFor="map-address">Buscar dirección</label>
        <input id="map-address" ref={input} type="search" placeholder="Buscar dirección"
          autoComplete="off" minLength={3} maxLength={160} required
          aria-describedby="map-search-privacy" value={query} onChange={event => {
            clearSearch();
            setQuery(event.target.value);
          }} />
        <button type="submit" disabled={status === 'loading' || query.trim().length < 3}>Buscar</button>
      </div>
      <p id="map-search-privacy" className="map-search-hint">Photon recibe la búsqueda. Evita datos personales.</p>
      <p className={status === 'ready' ? 'sr-only' : 'map-search-status'} role="status">
        {status === 'ready' ? `Coincidencias: ${results.length}.` : messages[status]}
      </p>
      {results.length > 0 && (
        <ul className="map-search-results" aria-label="Direcciones encontradas">
          {results.map(result => (
            <li key={result.label}>
              <button type="button" onClick={() => {
                onSelect(result.point);
                setQuery('');
                setResults([]);
                setStatus('selected');
              }}>
                {result.label}
                {result.approximate && <small>Ubicación aproximada de la calle</small>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
