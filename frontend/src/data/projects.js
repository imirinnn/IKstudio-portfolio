// liveUrl: deployed demo. githubUrl: add the repository link when it is public —
// the GitHub button stays hidden until then (no placeholder links).
export const projects = [
  {
    slug: 'brew-and-bite',
    tier: 1,
    tierName: 'Basic',
    title: 'Brew & Bite Café',
    category: 'Basic Business Website',
    price: '₹8,000 – ₹10,000',
    description:
      'A clean, responsive business website for cafés, restaurants and similar businesses. Our entry-level professional package: everything a customer needs to find you, see the menu and get in touch.',
    tech: ['React', 'Vite', 'Tailwind CSS'],
    features: ['Home', 'About', 'Menu / services', 'Gallery', 'Contact', 'Location / map', 'WhatsApp integration', 'Social links', 'Responsive design', 'Basic animations'],
    note: 'Frontend only. No backend or database needed for this package.',
    liveUrl: 'https://brewandbite-demo3.onrender.com/',
    githubUrl: '',
  },
  {
    slug: 'ironcore-fitness',
    tier: 2,
    tierName: 'Full-Stack',
    title: 'IronCore Fitness',
    category: 'Full-Stack Business Website',
    price: '₹12,000 – ₹15,000',
    description:
      'A fitness and gym website connected to a backend and database. Members can register and sign in, enquiries are stored, and the owner gets a simple admin dashboard.',
    tech: ['React', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'Mongoose'],
    features: ['Home', 'About', 'Programs', 'Trainers', 'Membership', 'Registration', 'Login', 'User dashboard', 'Contact / enquiry form', 'Backend APIs', 'MongoDB database', 'Basic authentication', 'Simple admin dashboard'],
    note: 'Sized for a single gym, not an enterprise system.',
    liveUrl: 'https://ironcore-demo2.onrender.com/',
    githubUrl: '',
  },
  {
    slug: 'lumora-interiors',
    tier: 3,
    tierName: 'Premium',
    title: 'Lumora Interiors',
    category: 'Premium Custom Website',
    price: '₹20,000 – ₹25,000',
    description:
      'A premium website for a business that needs a refined visual identity: editorial layouts, image reveals, page transitions and detailed project stories, with consultation requests managed from an admin panel.',
    tech: ['React', 'Tailwind CSS', 'Animation', 'Node.js', 'Express', 'MongoDB'],
    features: ['Premium UI/UX', 'Advanced animations', 'Project showcase', 'Project detail pages', 'Editorial layouts', 'Interactive sections', 'Smooth page transitions', 'Scroll animations', 'Image reveal animations', 'Hover interactions', 'Consultation form', 'Backend / database', 'Admin enquiry management'],
    note: 'Our most complete package.',
    liveUrl: 'https://lumora-demo3.onrender.com/',
    githubUrl: '',
  },
];
