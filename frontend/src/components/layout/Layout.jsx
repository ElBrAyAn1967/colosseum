import PropTypes from 'prop-types';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Main layout wrapper with Navbar and Footer
 */
export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-tipjar-dark">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
