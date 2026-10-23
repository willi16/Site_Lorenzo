import type { RouteObject } from 'react-router-dom';

import { AppLayout } from './App';
import {
  aboutLoader,
  blogLoader,
  blogPostLoader,
  budgetLoader,
  compareLoader,
  contactLoader,
  homeLoader,
  methodologyLoader,
  projectsLoader,
  projectLoader,
  searchLoader,
  serviceLoader,
  servicesLoader,
} from './loaders';

import Home from '@/pages/Home';
import Services from '@/pages/Services';
import ServiceDetail from '@/pages/ServiceDetail';
import Projects from '@/pages/Projects';
import ProjectDetail from '@/pages/ProjectDetail';
import About from '@/pages/About';
import Methodology from '@/pages/Methodology';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Contact from '@/pages/Contact';
import Budget from '@/pages/Budget';
import Compare from '@/pages/Compare';
import Search from '@/pages/Search';
import NewsletterConfirm from '@/pages/NewsletterConfirm';
import Legal from '@/pages/Legal';
import NotFound from '@/pages/NotFound';
import RouteError from '@/pages/RouteError';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { ContentListRoute, ContentEditRoute } from '@/pages/admin/ContentRoute';

/**
 * Table de routage unique, partagée par le rendu serveur (createStaticHandler)
 * et le rendu navigateur (createBrowserRouter) : une seule source de vérité.
 */
export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Home />, loader: homeLoader },
      { path: 'services', element: <Services />, loader: servicesLoader },
      { path: 'services/:slug', element: <ServiceDetail />, loader: serviceLoader },
      { path: 'realisations', element: <Projects />, loader: projectsLoader },
      { path: 'realisations/:slug', element: <ProjectDetail />, loader: projectLoader },
      { path: 'le-cabinet', element: <About />, loader: aboutLoader },
      { path: 'methodologie', element: <Methodology />, loader: methodologyLoader },
      { path: 'actualites', element: <Blog />, loader: blogLoader },
      { path: 'actualites/:slug', element: <BlogPost />, loader: blogPostLoader },
      { path: 'contact', element: <Contact />, loader: contactLoader },
      { path: 'budget', element: <Budget />, loader: budgetLoader },
      { path: 'comparateur', element: <Compare />, loader: compareLoader },
      { path: 'rechercher', element: <Search />, loader: searchLoader },
      { path: 'newsletter/confirmer', element: <NewsletterConfirm /> },
      { path: 'mentions-legales', element: <Legal variant="mentions" /> },
      { path: 'confidentialite', element: <Legal variant="confidentialite" /> },
      { path: 'cookies', element: <Legal variant="cookies" /> },
    ],
  },
  { path: '/admin/login', element: <AdminLogin />, errorElement: <RouteError /> },
  {
    path: '/admin',
    element: <AdminLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: 'contenu/:entity', element: <ContentListRoute /> },
      { path: 'contenu/:entity/nouveau', element: <ContentEditRoute /> },
      { path: 'contenu/:entity/:id', element: <ContentEditRoute /> },
    ],
  },
  { path: '*', element: <NotFound /> },
];
