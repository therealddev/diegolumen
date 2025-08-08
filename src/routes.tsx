import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import Home from './pages/Home';
import AllProjects from './pages/AllProjects';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'all-projects',
        element: <AllProjects />,
      },
    ],
  },
]); 