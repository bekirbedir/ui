import { Outlet } from 'react-router-dom';
import Sidebar from './sidebar';
import Header from './header';

const Layout = () => {
  return (
    <div className="d-flex">
      {/* Sidebar - sabit genişlik */}
      <Sidebar />
      
      {/* Main Content - kalan tüm alan */}
      <div className="flex-grow-1">
        <Header />
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;