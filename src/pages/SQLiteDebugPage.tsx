/**
 * Page de diagnostic SQLite pour tester l'architecture hybride
 */

import React from 'react';
import { Layout } from "@/components/ui/layout";
import { HybridStorageDiagnostic } from "@/components/debug/HybridStorageDiagnostic";
import { SQLiteDiagnostic } from "@/components/debug/SQLiteDiagnostic";
import { OPFSTestComponent } from "@/components/debug/OPFSTestComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, TestTube, Wrench } from "lucide-react";

const SQLiteDebugPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-6 h-6" />
              Architecture Hybride - Phase 1
            </CardTitle>
            <CardDescription>
              Tests et diagnostic de l'infrastructure SQLite + OPFS pour le stockage local sécurisé
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="opfs-test" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="opfs-test" className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              Test OPFS Complet
            </TabsTrigger>
            <TabsTrigger value="hybrid" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Diagnostic Hybride
            </TabsTrigger>
            <TabsTrigger value="sqlite" className="flex items-center gap-2">
              <TestTube className="w-4 h-4" />
              Test SQLite Détaillé
            </TabsTrigger>
          </TabsList>

          <TabsContent value="opfs-test">
            <OPFSTestComponent />
          </TabsContent>

          <TabsContent value="hybrid">
            <HybridStorageDiagnostic />
          </TabsContent>

          <TabsContent value="sqlite">
            <SQLiteDiagnostic />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default SQLiteDebugPage;