// Single source of truth for engineering project metadata.
// Consumed by: engineering-grid.js (grid), navbar.js (nav highlighting), project-banner.js (per-page banner).
// Adding a project = adding one entry here — no other file needs to change.
const PROJECTS = [
  {
    slug: 'pulse-oximeter',
    href: 'pulse-oximeter.html',
    title: 'MATLAB Pulse Oximeter',
    tagline: 'DIY pulse oximeter that turns raw light signals into heartbeats and oxygen levels.',
    categories: ['project'],
    keywords: ['matlab', 'sensors'],
    thumbnail: { webp: 'assets/engineering/pulse-oximeter/thumbnail.webp', fallback: 'assets/engineering/pulse-oximeter/thumbnail.png' },
    hoverPreview: { type: 'video', src: 'assets/engineering/pulse-oximeter/thumbnail.mp4' },
    banner: {
      title: 'MATLAB Pulse Oximeter',
      subtitle: 'Laboratory project for Medical Instrumentation and Devices course.',
      backgroundImage: { webp: 'assets/engineering/pulse-oximeter/banner.webp', fallback: 'assets/engineering/pulse-oximeter/banner.png' },
      logo: null
    }
  },
  {
    slug: 'stryker',
    href: 'stryker.html',
    title: 'Stryker Product Development',
    tagline: 'Medical device design, testing, and automation.',
    categories: ['internship'],
    keywords: ['medical', 'automation'],
    thumbnail: { webp: 'assets/engineering/stryker/thumbnail.webp', fallback: 'assets/engineering/stryker/thumbnail.png' },
    hoverPreview: { type: 'gif', src: 'assets/engineering/stryker/thumbnail.gif' },
    banner: {
      title: 'Product Development,\nStryker Corporation',
      subtitle: 'Hands-on experience in medical device design, testing, and automation.',
      backgroundImage: { webp: 'assets/engineering/stryker/stryker_banner.webp', fallback: 'assets/engineering/stryker/stryker_banner.png' },
      logo: 'assets/engineering/stryker/logo.png'
    }
  },
  {
    slug: 'self-balancing-robot',
    href: 'self-balancing-robot.html',
    title: 'Arduino Self-Balancing Robot',
    tagline: 'Who needs extra wheels when you have PID?',
    categories: ['project'],
    keywords: ['robotics', 'arduino', 'pid'],
    thumbnail: { webp: 'assets/engineering/self-balancing-robot/thumbnail.webp', fallback: null },
    hoverPreview: { type: 'video', src: 'assets/engineering/self-balancing-robot/thumbnail.mov' },
    banner: {
      title: 'Arduino Self-Balancing Robot',
      subtitle: 'Senior capstone project at Bergen County Academies.',
      backgroundImage: { webp: 'assets/engineering/self-balancing-robot/banner.webp', fallback: 'assets/engineering/self-balancing-robot/banner.png' },
      logo: null
    }
  },
  {
    slug: 'steel-ball-dispenser',
    href: 'steel-ball-dispenser.html',
    title: 'Steel Ball Dispenser',
    tagline: 'Color-approved anti-jamming dispenser for industrial applications.',
    categories: ['project'],
    keywords: ['mechanical', 'manufacturing'],
    thumbnail: { webp: 'assets/engineering/steel-ball-dispenser/thumbnail.webp', fallback: null },
    hoverPreview: { type: 'video', src: 'assets/engineering/steel-ball-dispenser/thumbnail.mov' },
    banner: {
      title: 'Steel Ball Dispenser',
      subheading: 'for UL Solutions',
      subtitle: 'EGR101L at Duke University, semester-long design course.',
      backgroundImage: { webp: 'assets/engineering/steel-ball-dispenser/ulsolutions-banner.webp', fallback: 'assets/engineering/steel-ball-dispenser/ulsolutions-banner.png' },
      logo: 'assets/engineering/steel-ball-dispenser/logo.svg'
    }
  },
  {
    slug: 'bsel-projects',
    href: 'bsel-projects.html',
    title: 'BSEL Projects',
    tagline: 'Where neuroscience meets MATLAB! Simulating transcranial magnetic stimulation in virtual brains.',
    categories: ['project', 'internship'],
    keywords: ['computational', 'simulation', 'neuroscience'],
    thumbnail: { webp: 'assets/engineering/bsel-projects/thumbnail.webp', fallback: 'assets/engineering/bsel-projects/thumbnail.png' },
    hoverPreview: { type: 'gif', src: 'assets/engineering/bsel-projects/thumbnail.gif' },
    banner: {
      title: 'Computational\nNeuroscience Projects',
      subtitle: 'Brain Stimulation Engineering Lab (BSEL) at Duke Hospital.',
      backgroundImage: { webp: 'assets/engineering/bsel-projects/banner.webp', fallback: 'assets/engineering/bsel-projects/banner.png' },
      logo: 'assets/engineering/bsel-projects/dukehealth.png'
    }
  },
  {
    slug: 'pacemaker',
    href: 'pacemaker.html',
    title: 'Benchtop VVI Pacemaker',
    tagline: 'Built a VVI pacemaker from scratch and tested it on a live frog heart.',
    categories: ['project'],
    keywords: ['biomedical', 'arduino', 'sensors'],
    thumbnail: { webp: 'assets/engineering/pacemaker/thumbnail.webp', fallback: 'assets/engineering/pacemaker/thumbnail.png' },
    hoverPreview: { type: 'video', src: 'assets/engineering/pacemaker/thumbnail.mp4' },
    banner: {
      title: 'Benchtop VVI Cardiac Pacemaker',
      subtitle: 'Laboratory project for Medical Instrumentation and Devices course.',
      backgroundImage: { webp: 'assets/engineering/pacemaker/banner.webp', fallback: 'assets/engineering/pacemaker/banner.png' },
      logo: null
    }
  },
  {
    slug: 'cpu',
    href: 'cpu.html',
    title: '16-bit CPU in Logisim',
    tagline: 'A single-cycle RISC processor that can run real assembly programs!',
    categories: ['project'],
    keywords: ['digital', 'architecture', 'embedded'],
    thumbnail: { webp: 'assets/engineering/cpu/thumbnail.webp', fallback: 'assets/engineering/cpu/thumbnail.png' },
    hoverPreview: { type: 'gif', src: 'assets/engineering/cpu/thumbnail.gif' },
    banner: {
      title: '16-bit CPU in Logisim',
      subtitle: 'Final Project for Computer Architecture course.',
      backgroundImage: { webp: 'assets/engineering/cpu/banner.webp', fallback: 'assets/engineering/cpu/banner.png' },
      logo: null
    }
  },
  {
    slug: 'sims-pump',
    href: 'sims-pump.html',
    title: 'SIMS Pump Valve Company',
    tagline: 'Mechanical engineering internship focused on repair and design of centrifugal pumps.',
    categories: ['internship'],
    keywords: ['mechanical', 'manufacturing'],
    thumbnail: { webp: 'assets/engineering/sims-pump/thumbnail.webp', fallback: null },
    // No dedicated hover asset exists — reuses the thumbnail itself as the "video" layer.
    // This isn't decorative filler: .project-card:hover always fades .project-img to 0 opacity,
    // so an identical image crossfades in underneath to avoid a hover blackout. See css/styles.css.
    hoverPreview: { type: 'image', src: 'assets/engineering/sims-pump/thumbnail.webp' },
    banner: {
      title: 'SIMS Pump\nValve Company',
      subtitle: 'Mechanical engineering internship focused on repair and design of centrifugal pumps.',
      backgroundImage: { webp: 'assets/engineering/sims-pump/sims_banner.webp', fallback: 'assets/engineering/sims-pump/sims_banner.png' },
      logo: 'assets/engineering/sims-pump/logo.png'
    }
  },
  {
    slug: 'stevens',
    href: 'stevens.html',
    title: 'Stevens Institute of Technology',
    tagline: 'Biomedical R&D: robotics applied to mechanical thrombectomy.',
    categories: ['internship'],
    keywords: ['biomedical', 'robotics'],
    thumbnail: { webp: 'assets/engineering/stevens/thumbnail.webp', fallback: 'assets/engineering/stevens/thumbnail.jpg' },
    // Same no-dedicated-hover-asset case as sims-pump above.
    hoverPreview: { type: 'image', src: 'assets/engineering/stevens/thumbnail.webp' },
    banner: {
      title: 'Stevens Institute of Technology',
      subtitle: 'Biomedical R&D internship focused on applications of robotics to mechanical thrombectomy.',
      backgroundImage: { webp: 'assets/engineering/stevens/stevens_banner.webp', fallback: 'assets/engineering/stevens/stevens_banner.png' },
      logo: 'assets/engineering/stevens/logo.png'
    }
  }
];
