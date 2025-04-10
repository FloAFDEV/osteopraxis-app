
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import { Button } from '@/components/ui/button';

const NotFoundPage = () => {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-700">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-2">Page non trouvée</h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          La page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <Button asChild>
          <Link to="/">Retour à l'accueil</Link>
        </Button>
      </div>
    </Layout>
  );
};

export default NotFoundPage;
