import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

function Layout({ children }) {
  const location = useLocation();

  // Define routes where Navbar should not be displayed
  const noNavbarRoutes = ['/videoCall/', '/room/'];

  // Check if the current path starts with any route in `noNavbarRoutes`
  const shouldShowNavbar = !noNavbarRoutes.some((route) => location.pathname.startsWith(route));

  return (
    <div>
      {shouldShowNavbar && <Navbar />}
      {children}
    </div>
  );
}

export default Layout;
