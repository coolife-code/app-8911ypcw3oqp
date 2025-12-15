import HomePage from './pages/HomePage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: '碎念小栈',
    path: '/',
    element: <HomePage />
  }
];

export default routes;
