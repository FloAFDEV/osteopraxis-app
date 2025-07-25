/**
 * Page de diagnostic SQLite pour tester l'architecture hybride
 */

import React from 'react';
import { Layout } from "@/components/ui/layout";
import { SQLiteDiagnostic } from "@/components/debug/SQLiteDiagnostic";

const SQLiteDebugPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SQLiteDiagnostic />
      </div>
    </Layout>
  );
};

export default SQLiteDebugPage;