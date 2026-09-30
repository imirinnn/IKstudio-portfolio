import Navbar from './layout/Navbar';
import Footer from './layout/Footer';
import Intro from './components/Intro';
import Home from './pages/Home';
import { EnquiryProvider } from './context/EnquiryContext';

export default function App() {
  return (
    <EnquiryProvider>
      <Intro />
      <Navbar />
      <main id="main">
        <Home />
      </main>
      <Footer />
    </EnquiryProvider>
  );
}
