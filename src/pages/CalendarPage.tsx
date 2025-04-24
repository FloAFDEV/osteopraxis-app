
import React from 'react';
import { Layout } from '@/components/ui/layout';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const CalendarPage = () => {
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Calendar className="h-8 w-8 text-blue-500" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
            Calendrier
          </span>
        </h1>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <div className="text-center">
            <h2 className="text-xl font-medium mb-2">Planning des rendez-vous</h2>
            <p className="text-muted-foreground">
              Cette fonctionnalité est en cours de développement. Vous pourrez bientôt voir et gérer votre planning depuis cette page.
            </p>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
};

export default CalendarPage;
