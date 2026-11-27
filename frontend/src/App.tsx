import { useEffect, useRef, useState } from 'react';
import FlyingPosters from './effects/FlyingPosters.jsx';
import Particles from './effects/Particles.jsx';
import QuotePanel from './QuotePanel';

const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const photoBase = 'https://images.unsplash.com/';
const photos = [
  { image: 'photo-1599067821475-c47c29093bf7', alt: 'Luces y edificios en Paseo de la Reforma de noche', name: 'Marco Murakami', id: 'jMslJKj3IQY' },
  { image: 'photo-1759299613796-7dcadce51750', alt: 'Personas caminando por una calle de la Ciudad de México', name: 'Julio Lopez', id: 'TOYeI40c8Eo' },
  { image: 'photo-1682184507208-0893c2ccdd7c', alt: 'El Ángel de la Independencia visto desde el aire', name: 'Jordan Wischmann', id: 'hBbxgKNrFgo' },
  { image: 'photo-1759299613841-9569f843e01e', alt: 'Personas cruzando una calle mojada de noche', name: 'Julio Lopez', id: 'y7dz5So9oQY' },
];
const posters = photos.map(photo => photoBase + photo.image + '?auto=format&fit=crop&w=720&q=82');
const questions = ['¿Quién soy?', '¿Qué hago aquí?', '¿De qué se trata todo esto?', '¿Estoy bien o estoy mal?', '¿Cuál es la mejor decisión?'];

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  return reduced;
}

export default function App() {
  const [panel, setPanel] = useState<'home' | 'quote'>('home');
  const [question, setQuestion] = useState(0);
  const [photo, setPhoto] = useState(0);
  const [webgl, setWebgl] = useState(false);
  const about = useRef<HTMLDialogElement>(null);
  const gallery = useRef<HTMLDialogElement>(null);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    setWebgl(Boolean(gl));
    gl?.getExtension('WEBGL_lose_context')?.loseContext();
  }, []);

  const showPhoto = (index: number) => {
    setPhoto(index);
    gallery.current?.showModal();
  };

  return (
    <div className="site" data-api-url={apiUrl}>
      <div className="starfield" aria-hidden="true">
        {webgl && !reducedMotion && (
          <Particles particleColors={['#dedee6', '#b8e56b']} particleCount={190} particleSpread={12}
            speed={0.075} particleBaseSize={75} glow={0.45} twinkle={0.3} intro={false}
            moveParticlesOnHover={false} clickBurst={false} opacity={0.75} pixelRatio={1} />
        )}
      </div>
      <header className="site-header">
        <button className="brand" type="button" onClick={() => setPanel('home')} aria-label="yoexistoCDMX, inicio">
          <svg className="brand-symbol" viewBox="0 0 32 38" aria-hidden="true" focusable="false">
            <path
              d="M25.3 4.4A15 15 0 1 0 28.2 7.7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M5.7 27.2c3.6 3.2 6.3 6.2 9.5 10.4a1 1 0 0 0 1.6 0c3.2-4.2 5.9-7.2 9.5-10.4-3.5 2.8-7.2 4.5-10.3 4.5S9.2 30 5.7 27.2Z"
              fill="currentColor"
            />
            <path
              d="M16 4.5c2.2 5.9 1.8 9.3 12.5 11.3.3.1.3.4 0 .5C18 18.5 18.2 22.6 16 33.2c-2.2-10.6-2-14.7-12.5-16.9-.3-.1-.3-.4 0-.5C14.2 13.8 13.8 10.4 16 4.5Zm0 9.6a2 2 0 1 0 0 4 2 2 0 1 0 0-4Z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg> yo<span className="brand-existo">existo</span><span className="brand-city">CDMX</span>
        </button>
        <button className="plain-button" type="button" onClick={() => about.current?.showModal()}>Cómo funciona <span aria-hidden="true">↗</span></button>
      </header>

      <main className="workspace" data-panel={panel}>
        <section className="intro-pane pane" aria-labelledby="intro-title">
          <div className="intro-copy">
            <p className="kicker">PSICOTERAPIA EXISTENCIAL · CDMX</p>
            <h1 id="intro-title">La terapia <br />donde <em>tú elijas.</em></h1>
            <p className="intro-body">En un café, debajo de un puente, en el parque o caminando por la calle. El lugar que eliges dice algo de cómo habitas el mundo. Podemos empezar por ahí.</p>
          </div>

          <div className="gallery" aria-label="Galería de escenas de Ciudad de México">
            {webgl && !reducedMotion ? (
              <FlyingPosters items={posters} planeWidth={320} planeHeight={320} distortion={3} scrollEase={0.01}
                cameraFov={45} cameraZ={20} axis="horizontal" gap={38} radius={10} fade={0.17}
                onItemClick={(_item: unknown, index: number) => showPhoto(index)} />
            ) : (
              <button className="poster-fallback" type="button" onClick={() => showPhoto(0)} aria-label="Ver fotografía de Paseo de la Reforma">
                <img src={posters[0]} alt={photos[0].alt} />
              </button>
            )}
            <button className="gallery-open" type="button" onClick={() => showPhoto(0)}>Ver fotos <span aria-hidden="true">↗</span></button>
          </div>

          <div className="question-bar" aria-label="Preguntas existenciales">
            <button type="button" className="icon-button" aria-label="Pregunta anterior" onClick={() => setQuestion((question + questions.length - 1) % questions.length)}>←</button>
            <p aria-live="polite">{questions[question]}</p>
            <button type="button" className="icon-button" aria-label="Siguiente pregunta" onClick={() => setQuestion((question + 1) % questions.length)}>→</button>
          </div>
        </section>

        <QuotePanel reducedMotion={reducedMotion} />
      </main>

      <footer className="site-footer">
        <span>Ciudad de México</span>
        <nav aria-label="Secciones en móvil" className="mobile-nav">
          <button type="button" aria-pressed={panel === 'home'} onClick={() => setPanel('home')}>Inicio</button>
          <button type="button" aria-pressed={panel === 'quote'} onClick={() => setPanel('quote')}>Cotizar <span aria-hidden="true">↗</span></button>
        </nav>
        <a
          className="footer-instagram"
          href="https://www.instagram.com/yoexistocdmx/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="@yoexistoCDMX en Instagram (abre en otra pestaña)"
        >
          @yoExistoCDMX
        </a>
      </footer>

      <dialog ref={about} className="modal" aria-labelledby="about-title">
        <form method="dialog"><button className="icon-button modal-close" aria-label="Cerrar">×</button></form>
        <p className="kicker">CÓMO FUNCIONA</p>
        <h2 id="about-title">Tú eliges el lugar.</h2>
        <p>La psicoterapia existencial es un espacio para explorar cómo vives lo que te pasa, qué te importa y qué posibilidades tienes. Puedes empezar con una decisión, un cambio o una pregunta que todavía no sabes cómo formular.</p>
        <p>Elegir el lugar es una forma de tener libertad desde el inicio. Conversamos de igual a igual y acordamos contigo cómo cuidar tu privacidad en el espacio que prefieras.</p>
        <p>Si hay ruido, podemos usar audífonos. Si prefieres escribir en un sitio público, podemos comunicarnos por texto mientras estamos ahí, en persona.</p>
      </dialog>

      <dialog ref={gallery} className="modal photo-modal" aria-label="Galería de Ciudad de México">
        <form method="dialog"><button className="icon-button modal-close" aria-label="Cerrar galería">×</button></form>
        <img src={posters[photo]} alt={photos[photo].alt} />
        <div className="photo-controls">
          <button className="icon-button" type="button" aria-label="Foto anterior" onClick={() => setPhoto((photo + photos.length - 1) % photos.length)}>←</button>
          <a href={'https://unsplash.com/photos/' + photos[photo].id} target="_blank" rel="noreferrer">Foto de {photos[photo].name}</a>
          <button className="icon-button" type="button" aria-label="Siguiente foto" onClick={() => setPhoto((photo + 1) % photos.length)}>→</button>
        </div>
      </dialog>
    </div>
  );
}
