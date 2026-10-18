import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react'
import HeroPortrait from './HeroPortrait'

const NAV_ITEMS = [
  ['Work', 'work'],
  ['About', 'about'],
  ['Certificates', 'certifications'],
  ['Experience', 'experience'],
  ['Contact', 'contact'],
] as const

const skillGroups = [
  {
    index: 'A',
    title: 'Frontend & interfaces',
    skills: ['React', 'Next.js', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'D3.js'],
    note: 'Product interfaces, data-rich tools, and responsive systems.',
  },
  {
    index: 'B',
    title: 'Backend & data',
    skills: ['Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'MySQL', 'Prisma', 'Redis', 'REST APIs'],
    note: 'Service architecture, persistence, caching, and API design.',
  },
  {
    index: 'C',
    title: 'AI & intelligent systems',
    skills: ['Gemini API', 'AI workflows', 'Agentic AI', 'Workflow orchestration'],
    note: 'Exploring practical AI integrations and agentic system concepts.',
  },
  {
    index: 'D',
    title: 'Infrastructure & observability',
    skills: ['Docker', 'BullMQ', 'Prometheus', 'Grafana', 'Loki', 'Firebase'],
    note: 'Deployable systems with visibility into health and behavior.',
  },
  {
    index: 'E',
    title: 'Computer science',
    skills: ['C++', 'Python', 'SQL', 'Data structures', 'Graph algorithms', 'System design'],
    note: 'Strong foundations for reasoning about complex systems.',
  },
]

const certifications = [
  {
    title: 'Agentic AI Certified Foundations Associate',
    issuer: 'Oracle University',
    date: 'September 04, 2026',
    image: '/assets/certifications/oracle-agentic-ai-certificate.png',
    file: '/assets/certifications/oracle-agentic-ai-certificate.pdf',
    code: 'AI / FOUNDATIONS',
  },
  {
    title: 'The Data Scientist’s Toolbox',
    issuer: 'Johns Hopkins University / Coursera',
    date: 'April 01, 2025',
    image: '/assets/certifications/data-scientist-toolbox.png',
    file: '/assets/certifications/data-scientist-toolbox.png',
    code: 'DATA SCIENCE',
  },
  {
    title: 'HTML5 — The Language',
    issuer: 'Infosys Springboard',
    date: 'October 17, 2025',
    image: '/assets/certifications/html5-certificate.png',
    file: '/assets/certifications/html5-certificate.pdf',
    code: 'WEB / HTML5',
  },
  {
    title: 'CSS3',
    issuer: 'Infosys Springboard',
    date: 'October 31, 2025',
    image: '/assets/certifications/css3-certificate.png',
    file: '/assets/certifications/css3-certificate.pdf',
    code: 'WEB / CSS3',
  },
]

type IconName = 'arrow' | 'github' | 'linkedin' | 'leetcode' | 'download' | 'external' | 'close' | 'menu'

function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7 }
  if (name === 'arrow') return <svg {...common} aria-hidden="true"><path d="M5 12h14M14 7l5 5-5 5" /></svg>
  if (name === 'external') return <svg {...common} aria-hidden="true"><path d="M14 5h5v5M19 5l-9 9" /><path d="M19 14v5H5V5h5" /></svg>
  if (name === 'download') return <svg {...common} aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 20h14" /></svg>
  if (name === 'menu') return <svg {...common} aria-hidden="true"><path d="M4 8h16M4 16h16" /></svg>
  if (name === 'close') return <svg {...common} aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" /></svg>
  if (name === 'github') return <svg {...common} aria-hidden="true"><path d="M15 22v-3.9c.04-1-.36-1.96-1.1-2.63 3.6-.4 7.38-1.77 7.38-8A6.25 6.25 0 0 0 19.61 3c.16-.4.7-2.04-.16-4 0 0-1.36-.44-4.45 1.66a15.45 15.45 0 0 0-8.1 0C3.8-1.44 2.44-1 2.44-1c-.86 1.96-.32 3.6-.16 4A6.25 6.25 0 0 0 .6 7.47c0 6.22 3.78 7.6 7.38 8A3.47 3.47 0 0 0 6.9 18v4" transform="translate(1 1)" /></svg>
  if (name === 'linkedin') return <svg {...common} aria-hidden="true"><path d="M7 9v10M7 5v.01M11 19v-6a4 4 0 0 1 8 0v6M11 9v10M3 3h18v18H3z" /></svg>
  return <svg {...common} aria-hidden="true"><path d="M8 6h8M9 10l-2 8M15 10l2 8M6 14h12" /><circle cx="12" cy="12" r="9" /></svg>
}

function SectionTitle({ index, label, title, intro }: { index: string; label: string; title: ReactNode; intro?: string }) {
  return (
    <header className="section-title">
      <div className="section-kicker"><span>{index}</span><span>/</span><span>{label}</span></div>
      <div>
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </div>
    </header>
  )
}

function ButtonLink({ href, children, variant = 'primary', icon, disabled = false, download = false }: {
  href: string
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'text'
  icon?: IconName
  disabled?: boolean
  download?: boolean
}) {
  if (disabled) return <span className={`button button-${variant} is-disabled`} aria-disabled="true">{children}{icon && <Icon name={icon} />}</span>
  return <a className={`button button-${variant}`} href={href} download={download}>{children}{icon && <Icon name={icon} />}</a>
}

function ImageSequence({ images, label, className = '' }: { images: string[]; label: string; className?: string }) {
  return (
    <figure className={`image-sequence sequence-${images.length} ${className}`}>
      <div className="sequence-chrome">
        <span><i /><i /><i /></span>
        <small>LIVE PRODUCT / {String(images.length).padStart(2, '0')} VIEWS</small>
      </div>
      <div className="sequence-stage">
        {images.map((src, index) => (
          <img
            key={src}
            src={src}
            alt={`${label}, view ${index + 1} of ${images.length}`}
            loading="lazy"
            style={{ '--image-index': index } as React.CSSProperties}
          />
        ))}
        <div className="sequence-count">{images.map((_, index) => <span key={index}>0{index + 1}</span>)}</div>
      </div>
      <figcaption>{label}<span>Hover to pause / sequence plays automatically</span></figcaption>
    </figure>
  )
}

function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('work')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sections = NAV_ITEMS.map(([, id]) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(entries => {
      const current = entries.filter(e => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (current) setActiveSection(current.target.id)
    }, { rootMargin: '-20% 0px -65%', threshold: [0, 0.25, 0.6] })
    sections.forEach(section => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen)
    return () => document.body.classList.remove('menu-open')
  }, [menuOpen])

  useEffect(() => {
    const targets = document.querySelectorAll<HTMLElement>(
      '.section-title, .project, .about-copy, .portrait-card, .skill-group, .certificate-card, .timeline-entry, .metric, .profile-links, .resume-panel, .contact-main',
    )
    targets.forEach((target, index) => {
      target.classList.add('motion-reveal')
      target.style.setProperty('--reveal-order', String(index % 5))
    })

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach(target => target.classList.add('is-visible'))
      return
    }

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px 0px -10%', threshold: 0.12 })

    targets.forEach(target => observer.observe(target))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight
        progressRef.current?.style.setProperty('--scroll-progress', String(max > 0 ? window.scrollY / max : 0))
        setScrolled(window.scrollY > 48)
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
    }
  }, [])

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    const move = (event: MouseEvent) => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        cursorRef.current?.style.setProperty('--cursor-x', `${event.clientX}px`)
        cursorRef.current?.style.setProperty('--cursor-y', `${event.clientY}px`)
      })
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', move)
    }
  }, [])

  const tiltPreview = (event: ReactMouseEvent<HTMLElement>) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width - 0.5
    const y = (event.clientY - rect.top) / rect.height - 0.5
    event.currentTarget.style.setProperty('--tilt-x', `${-y * 2.5}deg`)
    event.currentTarget.style.setProperty('--tilt-y', `${x * 3}deg`)
  }

  const resetPreview = (event: ReactMouseEvent<HTMLElement>) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg')
    event.currentTarget.style.setProperty('--tilt-y', '0deg')
  }

  const toggleDetails = (id: string) => setExpanded(expanded === id ? null : id)

  return (
    <div className="site-shell">
      <div className="cursor-light" ref={cursorRef} aria-hidden="true" />
      <div className="scroll-progress" ref={progressRef} aria-hidden="true"><span /></div>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <nav className={`navigation ${scrolled ? 'is-scrolled' : ''}`} aria-label="Primary navigation">
        <a className="wordmark" href="#top" aria-label="Mridul Srivastava, home"><span>MRIDUL SRIVASTAVA</span><i /></a>
        <div className="nav-links">
          {NAV_ITEMS.map(([label, id]) => <a href={`#${id}`} className={activeSection === id ? 'active' : ''} key={id}>{label}</a>)}
        </div>
        <div className="nav-actions">
          <a className="resume-download" href="/assets/mridul-srivastava-resume.pdf" download>Resume <Icon name="download" size={14} /></a>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? 'Close menu' : 'Open menu'}>
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </nav>

      <div id="mobile-menu" className={`mobile-menu ${menuOpen ? 'open' : ''}`} aria-hidden={!menuOpen}>
        {NAV_ITEMS.map(([label, id], i) => <a href={`#${id}`} onClick={() => setMenuOpen(false)} key={id}><span>0{i + 1}</span>{label}</a>)}
        <a className="mobile-resume" href="/assets/mridul-srivastava-resume.pdf" download onClick={() => setMenuOpen(false)}>Download resume <Icon name="download" /></a>
      </div>

      <main id="main-content">
        <section className="hero" id="top">
          <div className="hero-meta top-meta">PORTFOLIO / 2026</div>
          <div className="hero-copy">
            <p className="eyebrow">FULL-STACK DEVELOPMENT / AI / CREATIVE ENGINEERING</p>
            <h1>Building systems.<br />Exploring intelligence.<br /><em>Designing what’s next.</em></h1>
            <p className="hero-intro">I’m Mridul — a developer exploring the intersection of full-stack engineering, AI, and interactive digital experiences.</p>
            <div className="hero-actions">
              <ButtonLink href="#work" icon="arrow">Explore my work</ButtonLink>
              <ButtonLink href="#contact" variant="secondary">Get in touch</ButtonLink>
            </div>
          </div>
          <div className="hero-art"><HeroPortrait /></div>
          <div className="hero-bottom">
            <span className="coordinate">26.4499° N / 80.3319° E</span>
            <a href="#work" className="scroll-cue"><i /> Scroll to explore</a>
            <span className="chapter">CHAPTER 01 — WORK</span>
          </div>
        </section>

        <section className="work section" id="work">
          <SectionTitle index="01" label="SELECTED WORK" title={<>Things I’ve built.<br /><em>Problems I’ve explored.</em></>} intro="Three explorations across operational software, applied AI, and algorithmic thinking." />

          <article className="project featured-project">
            <div className="project-heading">
              <div><span className="project-number">PROJECT 01</span><h3>IR Assist</h3></div>
              <p>AI-powered incident response platform</p>
            </div>
            <div className="project-visual real-preview interactive-preview" onMouseMove={tiltPreview} onMouseLeave={resetPreview}>
              <ImageSequence images={['/assets/ir-assist-dashboard.png', '/assets/ir-assist-analytics.png']} label="IR Assist / Operational dashboard" className="sequence-dark" />
            </div>
            <div className="project-info">
              <p>A monitoring and incident-management application bringing service health, incident tracking, logs, and operational analytics into one focused interface.</p>
              <div className="tags">{['Next.js', 'React', 'TypeScript', 'PostgreSQL', 'Prisma', 'Redis', 'BullMQ', 'Docker', 'Gemini API', 'Prometheus', 'Grafana', 'Loki'].map(x => <span key={x}>{x}</span>)}</div>
              <div className="project-links"><a href="https://github.com/mridul2507/AI-Powered-INCIDENT-RESPONSE-PLATFORM" target="_blank" rel="noreferrer">GitHub <Icon name="external" size={14} /></a><a href="https://ir-assist.vercel.app/" target="_blank" rel="noreferrer">Live demo <Icon name="external" size={14} /></a></div>
              <button className="details-button" onClick={() => toggleDetails('ir')} aria-expanded={expanded === 'ir'}>Project context <span>{expanded === 'ir' ? '−' : '+'}</span></button>
              {expanded === 'ir' && <p className="project-detail">A multi-tenant SaaS platform with RBAC, organization-level data isolation, asynchronous processing through Redis and BullMQ, AI-assisted root-cause analysis, audit logging, and production-oriented observability.</p>}
            </div>
          </article>

          <article className="project split-project">
            <div className="split-copy">
              <span className="project-number">PROJECT 02 / APPLIED AI</span>
              <h3>YouTube Video<br />Summarizer</h3>
              <p>A web application designed to transform long-form video content into concise, useful summaries using a generative AI API.</p>
              <div className="tags">{['React', 'TypeScript', 'Gemini API', 'Netlify'].map(x => <span key={x}>{x}</span>)}</div>
              <div className="project-links"><a href="https://github.com/mridul2507/Youtube-Video-Summarizer" target="_blank" rel="noreferrer">GitHub <Icon name="external" size={14} /></a><a href="https://utubesummarizer.netlify.app/" target="_blank" rel="noreferrer">Live demo <Icon name="external" size={14} /></a></div>
              <button className="details-button" onClick={() => toggleDetails('summary')} aria-expanded={expanded === 'summary'}>Project context <span>{expanded === 'summary' ? '−' : '+'}</span></button>
              {expanded === 'summary' && <p className="project-detail">Built with context-aware Gemini summaries, persistent state, timestamp navigation, multiple summary formats, and one-click export.</p>}
            </div>
            <div className="split-visual real-preview interactive-preview" onMouseMove={tiltPreview} onMouseLeave={resetPreview}>
              <ImageSequence images={['/assets/summarizer-input.png', '/assets/summarizer-features.png']} label="YouTube Summarizer / Input and feature views" />
            </div>
          </article>

          <article className="project wide-project">
            <div className="wide-heading">
              <div><span className="project-number">PROJECT 03 / COMPUTER SCIENCE</span><h3>Algorithm Visualizer</h3></div>
              <p>An interactive engine for exploring sorting, pathfinding, tree, hash-table, linked-list, stack, and queue algorithms step by step.</p>
            </div>
            <div className="algorithm-motion interactive-preview" onMouseMove={tiltPreview} onMouseLeave={resetPreview}>
              <ImageSequence images={['/assets/algorithm-sort.png', '/assets/algorithm-hash.png', '/assets/algorithm-hash-menu.png', '/assets/algorithm-linked-list.png']} label="Algorithm Visualizer / Sorting, hash table, and linked-list states" />
            </div>
            <div className="wide-footer">
              <div className="tags"><span>D3.js</span><span>Graph theory</span><span>Pathfinding</span></div>
              <div className="project-links"><a href="https://github.com/mridul2507/Algorithm_Visualizer" target="_blank" rel="noreferrer">GitHub <Icon name="external" size={14} /></a><a href="https://algostudio.netlify.app/" target="_blank" rel="noreferrer">Live demo <Icon name="external" size={14} /></a></div>
              <button className="details-button" onClick={() => toggleDetails('algo')} aria-expanded={expanded === 'algo'}>Project context <span>{expanded === 'algo' ? '−' : '+'}</span></button>
            </div>
            {expanded === 'algo' && <p className="project-detail">The visualization makes algorithm state legible through explored nodes, frontier state, and the final path—turning an abstract process into a spatial narrative.</p>}
          </article>
        </section>

        <section className="about section" id="about">
          <SectionTitle index="02" label="THE PERSON BEHIND THE CODE" title={<>Curiosity drives<br /><em>the build.</em></>} />
          <div className="about-grid">
            <div className="about-copy">
              <p>I’m Mridul Srivastava, a Computer Science and Engineering student at Pranveer Singh Institute of Technology, Kanpur. I enjoy turning complex technical ideas into useful products, from full-stack applications and AI-powered workflows to algorithmic visualizations.</p>
              <p>My interests span software architecture, developer tooling, intelligent systems, and the craft of building interfaces that feel as good as they function.</p>
              <div className="education"><span>EDUCATION</span><strong>B.Tech, Computer Science & Engineering</strong><small>PSIT, Kanpur / 2024–2028 / CGPA 8.08</small></div>
            </div>
            <div className="portrait-card">
              <div className="portrait-frame"><img src="/assets/mridul-srivastava.png" alt="Mridul Srivastava in a black suit and white shirt" loading="lazy" /></div>
              <div className="portrait-meta"><span>MRIDUL SRIVASTAVA</span><span>CSE / PSIT</span><span>KANPUR, INDIA</span></div>
              <div className="portrait-orbit" aria-hidden="true"><i /><span>ENGINEER<br />THE IDEA</span></div>
            </div>
          </div>
        </section>

        <section className="toolkit section" id="toolkit">
          <SectionTitle index="03" label="THE TOOLKIT" title={<>From interface<br /><em>to infrastructure.</em></>} intro="A connected toolkit for taking ideas from first principles to working software." />
          <div className="skill-map">
            {skillGroups.map(group => (
              <article className="skill-group" key={group.index}>
                <span className="skill-index">{group.index}</span>
                <div><h3>{group.title}</h3><p>{group.note}</p></div>
                <div className="skill-list">{group.skills.map(skill => <span key={skill}>{skill}</span>)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="certifications section" id="certifications">
          <SectionTitle index="04" label="CERTIFICATIONS" title={<>Proof of learning.<br /><em>Built into practice.</em></>} intro="Selected credentials across artificial intelligence, data science, and web foundations." />
          <div className="certificate-grid">
            {certifications.map((certificate, index) => (
              <a
                className="certificate-card"
                href={certificate.file}
                target="_blank"
                rel="noreferrer"
                key={certificate.title}
                onMouseMove={tiltPreview}
                onMouseLeave={resetPreview}
                aria-label={`View ${certificate.title} certificate`}
              >
                <div className="certificate-visual">
                  <img src={certificate.image} alt={`${certificate.title} certificate issued to Mridul Srivastava`} loading="lazy" />
                  <span className="certificate-order">0{index + 1}</span>
                  <span className="certificate-view">VIEW CREDENTIAL <Icon name="external" size={13} /></span>
                </div>
                <div className="certificate-meta">
                  <span>{certificate.code}</span>
                  <h3>{certificate.title}</h3>
                  <div><p>{certificate.issuer}</p><time>{certificate.date}</time></div>
                </div>
              </a>
            ))}
          </div>
        </section>

        <section className="journey section" id="experience">
          <SectionTitle index="05" label="THE JOURNEY" title={<>Learning<br /><em>by building.</em></>} intro="A chronology of education, project work, and continued technical exploration, based on the supplied resume." />
          <div className="timeline">
            {[
              ['2024—2028', 'B.Tech in Computer Science & Engineering', 'Pranveer Singh Institute of Technology, Kanpur', 'EDUCATION'],
              ['2025', 'YouTube Video Summarizer', 'Applied generative AI to transform long-form video into structured, concise output.', 'PROJECT'],
              ['2026', 'IR Assist', 'Continued full-stack and AI exploration through an incident response and observability platform.', 'PROJECT'],
            ].map(([year, title, copy, type], i) => (
              <article className="timeline-entry" key={year}>
                <span className="timeline-number">0{i + 1}</span><time>{year}</time><div><small>{type}</small><h3>{title}</h3><p>{copy}</p></div>
              </article>
            ))}
          </div>
        </section>

        <section className="achievements section">
          <SectionTitle index="06" label="PROGRESS & PROBLEM-SOLVING" title={<>Consistency<br /><em>compounds.</em></>} intro="Static values verified from the supplied resume; these are not connected to live profile data." />
          <div className="metrics">
            {[
              ['450+', 'DSA problems solved'],
              ['1738', 'LeetCode contest rating'],
              ['Top 11.5%', 'LeetCode contest standing'],
              ['#94', 'International Mathematics Championship 2022', '750+ participants / 20+ countries'],
            ].map(([value, label, note]) => (
              <article className="metric" key={value}><strong>{value}</strong><span>{label}</span>{note && <small>{note}</small>}<i /></article>
            ))}
          </div>
          <div className="profile-links">
            <a href="https://github.com/mridul2507" target="_blank" rel="noreferrer"><Icon name="github" /><span>GitHub</span><Icon name="external" size={15} /></a>
            <a href="https://leetcode.com/u/Mridul_Srivastava/" target="_blank" rel="noreferrer"><Icon name="leetcode" /><span>LeetCode</span><Icon name="external" size={15} /></a>
            <a href="https://www.linkedin.com/in/thissidemridul/" target="_blank" rel="noreferrer"><Icon name="linkedin" /><span>LinkedIn</span><Icon name="external" size={15} /></a>
          </div>
        </section>

        <section className="resume section">
          <div className="resume-panel">
            <span className="panel-index">RESUME / PROFILE</span>
            <h2>Want the<br /><em>complete picture?</em></h2>
            <p>Explore my technical background, projects, and experience in more detail.</p>
            <div className="resume-actions">
              <ButtonLink href="/assets/mridul-srivastava-resume.pdf" icon="download" download>Download resume</ButtonLink>
              <ButtonLink href="https://github.com/mridul2507" variant="secondary" icon="external">View GitHub</ButtonLink>
            </div>
            <div className="resume-orbit" aria-hidden="true"><i /><i /><i /><span>MS</span></div>
          </div>
        </section>

        <section className="contact section" id="contact">
          <div className="contact-top">
            <div className="section-kicker"><span>07</span><span>/</span><span>LET’S CONNECT</span></div>
            <span>KANPUR, INDIA / GMT +5:30</span>
          </div>
          <div className="contact-main">
            <h2>Have an interesting<br /><em>problem?</em></h2>
            <p>I’m interested in building useful software, exploring new technical ideas, and collaborating on challenging projects.</p>
            <div className="contact-actions">
              <ButtonLink href="mailto:mridulsrivastava777@gmail.com" icon="arrow">Get in touch</ButtonLink>
              <small>mridulsrivastava777@gmail.com</small>
            </div>
          </div>
          <div className="contact-sculpture" aria-hidden="true"><div /><span>IDEAS</span><span>BUILD</span><span>ITERATE</span></div>
          <footer>
            <a className="footer-wordmark" href="#top">MRIDUL SRIVASTAVA</a>
            <p>© {new Date().getFullYear()} Mridul Srivastava</p>
            <div><a href="https://github.com/mridul2507" target="_blank" rel="noreferrer">GitHub</a><a href="https://www.linkedin.com/in/thissidemridul/" target="_blank" rel="noreferrer">LinkedIn</a><a href="#top">Back to top ↑</a></div>
          </footer>
        </section>
      </main>
    </div>
  )
}

export default App
