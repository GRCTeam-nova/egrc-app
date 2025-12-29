import { RouterProvider } from 'react-router-dom';

// project import
import router from './routes';
import ThemeCustomization from './themes';

import Locales from './components/Locales';
import ScrollTop from './components/ScrollTop';
import Snackbar from './components/@extended/Snackbar';
import Notistack from './components/third-party/Notistack';
import { SelectedUnitProvider } from './contexts/SelectedUnitContext';
import { JWTProvider as AuthProvider } from './contexts/JWTContext';

// Importe o PartesAdversasProvider
import { PartesAdversasProvider } from './pages/apps/tela2/PartesAdversasContext';
import { TokenProvider } from "./api/TokenContext";

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

const App = () => (
  <ThemeCustomization>
    <Locales>
      <ScrollTop>
        <AuthProvider>
          <SelectedUnitProvider>
          <TokenProvider>
            <PartesAdversasProvider>
              <Notistack>
                <RouterProvider router={router} />
                <Snackbar />
              </Notistack>
            </PartesAdversasProvider>
            </TokenProvider>
          </SelectedUnitProvider>
        </AuthProvider>
      </ScrollTop>
    </Locales>
  </ThemeCustomization>
);

export default App;
