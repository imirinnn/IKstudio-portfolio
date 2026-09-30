import irin from '../assets/team/irin.webp';
import irinSm from '../assets/team/irin-sm.webp';
import kaviya from '../assets/team/kaviya.webp';
import kaviyaSm from '../assets/team/kaviya-sm.webp';

export const team = {
  irin: {
    id: 'irin',
    name: 'Irin',
    role: 'Frontend Developer',
    tag: '<Frontend />',
    tone: 'sky',
    photo: irin,
    photoSm: irinSm,
    alt: 'Irin, frontend developer, standing with arms folded in a black-and-white checked shirt',
    summary:
      'Irin turns the plan into the interface your customers use: layouts, interactions and animation that feel fast on every screen.',
    skills: [
      'HTML', 'CSS', 'JavaScript', 'React', 'Vite', 'Tailwind CSS',
      'Responsive design', 'UI/UX implementation', 'Frontend animation',
      'Interactive interfaces', 'Performance optimisation',
    ],
  },
  kaviya: {
    id: 'kaviya',
    name: 'Kaviya',
    role: 'Backend Developer',
    tag: 'server.listen()',
    tone: 'rose',
    photo: kaviya,
    photoSm: kaviyaSm,
    alt: 'Kaviya, backend developer, smiling in a pink printed kurta and grey dupatta',
    summary:
      'Kaviya builds what runs behind the page: APIs, databases, authentication and the server setup that keeps forms and dashboards working.',
    skills: [
      'Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'REST APIs',
      'Backend architecture', 'Database integration', 'Authentication',
      'API development', 'Server-side logic', 'Deployment & config',
    ],
  },
};
