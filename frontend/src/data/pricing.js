export const packages = [
  {
    id: 'basic',
    name: 'Basic',
    price: '₹8,000 – ₹10,000',
    min: 8000,
    max: 10000,
    audience: 'For businesses that need a professional online presence.',
    example: 'Brew & Bite Café',
    includes: ['Responsive website', 'Business pages', 'Contact / WhatsApp integration', 'Gallery', 'Basic animations', 'Mobile optimisation'],
  },
  {
    id: 'full-stack',
    name: 'Full-Stack',
    price: '₹12,000 – ₹15,000',
    min: 12000,
    max: 15000,
    audience: 'For businesses that need a backend and a database.',
    example: 'IronCore Fitness',
    includes: ['Everything a professional business website needs', 'Backend', 'API integration', 'MongoDB', 'Forms and data storage', 'Authentication where required', 'Basic admin functionality'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹20,000 – ₹25,000',
    min: 20000,
    max: 25000,
    audience: 'For businesses that want a premium custom website.',
    example: 'Lumora Interiors',
    includes: ['Premium UI/UX', 'Advanced animations', 'Custom layouts', 'Interactive sections', 'Backend functionality', 'Database', 'Consultation / enquiry functionality', 'Premium responsive experience'],
    featured: true,
  },
];

export const clientPaid = ['Domain', 'Hosting', 'Cloud server', 'Database', 'Paid APIs', 'Email / SMS services', 'Other third-party services'];

export const paymentStages = [
  { pct: 30, name: 'Project start', when: 'Proposal accepted', body: 'Advance after proposal acceptance and project confirmation.' },
  { pct: 30, name: 'Project approval', when: 'Build approved', body: 'After development review and your approval of the project model and design.' },
  { pct: 40, name: 'Final handover', when: 'Live and handed over', body: 'After final completion, deployment and handover.' },
];
