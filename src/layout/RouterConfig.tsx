// App
import PrivacyPolicy from 'components/UI/TOC/PrivaryPolicy';
import { Outlet, Route, Routes } from 'react-router-dom';
import { appRoutes } from '../lib/constants/appRoutes';

// Components
import Discover from './Discover/Discover';
import TermsOfService from 'components/UI/TOC/TermsOfService';
import Portfolio from './Portfolio/Portfolio';
import Studio from './Studio/Studio';
import Create from './Create/Create';

const RouterConfig = () => {
  return (
    <div>
      <Routes>
        <Route path={appRoutes.home_path} element={<Discover />} />
        <Route path={appRoutes.discover_path} element={<Discover />} />

        <Route path={appRoutes.privacy_path} element={<PrivacyPolicy />} />
        <Route path={appRoutes.portfolio_path} element={<Portfolio />} />
        <Route path={appRoutes.studio_path} element={<Studio />} />
        <Route path={appRoutes.create_path} element={<Create />} />
        <Route path={appRoutes.toc} element={<TermsOfService />} />
      </Routes>
      <Outlet />
    </div>
  );
};

export default RouterConfig;
