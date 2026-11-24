import { useState } from 'react';

const images = {
  hero: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1900&q=88',
  walk: 'https://images.unsplash.com/photo-1472396961693-142e6e269027?auto=format&fit=crop&w=1000&q=85',
  forest: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85',
};
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function ArrowIcon() {
  return <svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><path d="M4 10h11M10 5l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <main data-api-url={apiUrl}>
      <header className="site-header">
        <a className="wordmark" href="#inicio" aria-label="Enfoque Existencial, inicio">
          <span className="wordmark-mark" aria-hidden="true"><span /></span>
          <span>enfoque<span className="wordmark-light">existencial</span></span>
        </a>
        <button className="menu-toggle" type="button" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span />
        </button>
        <nav className={menuOpen ? 'main-nav main-nav--open' : 'main-nav'} aria-label="Navegación principal">
          <a href="#experiencia" onClick={closeMenu}>La experiencia</a>
          <a href="#mirada" onClick={closeMenu}>Una mirada distinta</a>
          <a className="nav-cta" href="#contacto" onClick={closeMenu}>Conversemos <ArrowIcon /></a>
        </nav>
      </header>

      <section className="hero" id="inicio" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-line" />Terapia existencial al aire libre</p>
          <h1 id="hero-title">A veces, el siguiente paso aparece <em>cuando te detienes.</em></h1>
          <p className="hero-lede">Un espacio para caminar, conversar y hacer lugar a lo que de verdad importa. Sin prisa. Sin tener que llegar con todas las respuestas.</p>
          <a className="button button-dark" href="#experiencia">Conoce la experiencia <ArrowIcon /></a>
          <div className="hero-note"><span className="note-sun" aria-hidden="true">✳</span><span>Una conversación honesta.<br />Un camino abierto.</span></div>
        </div>
        <div className="hero-visual">
          <img src={images.hero} alt="Montañas y agua en calma al amanecer" />
          <div className="image-caption"><span>Respirar · Mirar · Elegir</span><span className="caption-dot" /></div>
          <div className="hero-stamp" aria-label="Un espacio para estar presente"><span>un espacio</span><strong>para estar<br />presente</strong><i aria-hidden="true">✳</i></div>
        </div>
        <div className="hero-index" aria-hidden="true">01 <span /> 03</div>
      </section>

      <div className="marquee" aria-label="Terapia, naturaleza, presencia">
        <span>Terapia</span><i>✳</i><span>Naturaleza</span><i>✳</i><span>Presencia</span><i>✳</i><span>Sentido</span><i>✳</i><span>Elección</span>
      </div>

      <section className="intro section-wrap" id="mirada">
        <div className="section-kicker"><span>01</span><span className="kicker-rule" />Una pausa con intención</div>
        <div className="intro-grid">
          <h2>No tienes que resolverlo todo <em>hoy.</em></h2>
          <div className="intro-text"><p>Hay momentos en que seguir en automático ya no alcanza. Algo pide atención: una decisión, una pérdida, un cambio, una pregunta que vuelve.</p><p>La terapia existencial outdoor abre un espacio distinto para escucharlo. Caminamos y conversamos en un entorno natural, con presencia y curiosidad, para mirar tu experiencia desde otro lugar.</p><a className="text-link" href="#experiencia">Así puede ser el encuentro <ArrowIcon /></a></div>
        </div>
      </section>

      <section className="experience" id="experiencia">
        <div className="experience-inner">
          <div className="experience-heading">
            <div className="section-kicker section-kicker--light"><span>02</span><span className="kicker-rule" />El encuentro</div>
            <h2>Un camino para volver <em>a ti.</em></h2>
            <p>No se trata de caminar para escapar de lo que pasa, sino de encontrar espacio para acercarte a ello con más calma.</p>
          </div>
          <div className="experience-photo"><img src={images.walk} alt="Sendero natural rodeado de árboles" /><span className="photo-label">A tu ritmo, paso a paso</span></div>
          <div className="experience-cards">
            <article className="experience-card"><span className="card-number">01</span><h3>Hacer espacio</h3><p>Dejamos atrás por un momento el ruido y llegamos al presente, tal como estás.</p></article>
            <article className="experience-card"><span className="card-number">02</span><h3>Mirar con honestidad</h3><p>Conversamos sobre lo que vives, lo que pesa y lo que te gustaría cuidar.</p></article>
            <article className="experience-card"><span className="card-number">03</span><h3>Elegir tu siguiente paso</h3><p>No hay respuestas prefabricadas. Buscamos claridad para avanzar a tu manera.</p></article>
          </div>
          <div className="experience-footnote"><span>✳</span> La naturaleza no da respuestas por nosotros.<br />A veces ayuda a hacer mejores preguntas.</div>
        </div>
      </section>

      <section className="reflection section-wrap">
        <div className="reflection-image"><img src={images.forest} alt="Luz atravesando un bosque" /><span className="reflection-mark">de vuelta<br />a lo esencial <i>↗</i></span></div>
        <div className="reflection-copy">
          <div className="section-kicker"><span>03</span><span className="kicker-rule" />Una invitación</div>
          <h2>La vida no siempre pide una respuesta. A veces pide <em>presencia.</em></h2>
          <p>Este espacio es para ti si estás atravesando un cambio, buscas orientación o simplemente sientes que llegó el momento de escucharte con más atención.</p>
          <p>No necesitas saber exactamente qué decir. Podemos empezar por ahí.</p>
          <a className="button button-outline" href="#contacto">Dar el primer paso <ArrowIcon /></a>
        </div>
      </section>

      <section className="contact" id="contacto">
        <div className="contact-orbit" aria-hidden="true">✳</div>
        <p className="eyebrow eyebrow--light">Una conversación puede ser el comienzo</p>
        <h2>¿Qué te gustaría<br /><em>mirar con más calma?</em></h2>
        <p className="contact-lede">Si esta forma de encontrarte contigo resuena, podemos conversar sobre lo que estás buscando y cómo sería un primer encuentro.</p>
        <a className="button button-light" href="#inicio">Volver al inicio <ArrowIcon /></a>
        <span className="contact-note">El contacto directo estará disponible pronto.</span>
      </section>

      <footer className="site-footer"><a className="wordmark wordmark--footer" href="#inicio"><span className="wordmark-mark" aria-hidden="true"><span /></span><span>enfoque<span className="wordmark-light">existencial</span></span></a><span>Terapia existencial outdoor</span><a href="#inicio" className="back-top">Volver arriba ↑</a></footer>
    </main>
  );
}

export default App;
