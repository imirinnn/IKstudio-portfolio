// Single source of truth for studio details. Edit here, not in components.
export const site = {
  name: 'Irin & Kaviya',
  shortName: 'i/k',
  tagline: 'Web development studio',
  description:
    'A frontend and backend development duo building modern, responsive, business-focused websites — from first call to final handover.',
  email: 'imirinnnb@gmail.com',
  phones: [
    { display: '86103 05196', tel: '+918610305196', whatsapp: '918610305196' },
    { display: '80720 07223', tel: '+918072007223', whatsapp: '918072007223' },
  ],
};

export const nav = [
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'work', label: 'Work' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'process', label: 'Process' },
  { id: 'faq', label: 'FAQ' },
  { id: 'contact', label: 'Contact' },
];

/*
 * Only publish numbers you can back up. The client/project counts are kept
 * here but switched off until confirmed — set `show: true` to display them.
 */
export const verifiedTrackRecord = { show: false, clients: 40, projects: 60 };

export const stats = verifiedTrackRecord.show
  ? [
      { value: verifiedTrackRecord.clients, suffix: '+', label: 'Clients' },
      { value: verifiedTrackRecord.projects, suffix: '+', label: 'Projects completed' },
      { value: 2, suffix: '', label: 'Developers, one team', note: 'Frontend + backend' },
      { value: 100, suffix: '%', label: 'Custom development', note: 'No page builders' },
    ]
  : [
      { value: 3, suffix: '+', label: 'Featured projects', note: 'Live demos below' },
      { value: 2, suffix: '', label: 'Developers, one team', note: 'Frontend + backend' },
      { value: 100, suffix: '%', label: 'Custom development', note: 'No page builders' },
      { value: 3, suffix: '', label: 'Clear packages', note: '₹8K to ₹25K' },
    ];
