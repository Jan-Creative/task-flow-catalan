/**
 * Offline Demo Page
 * Page to test and demonstrate offline functionality
 */

import React from 'react';
import { OfflineDemo } from '@/components/OfflineDemo';
import { BackgroundRenderer } from '@/components/backgrounds/BackgroundRenderer';

export default function OfflineDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <BackgroundRenderer />
      <div className="relative z-10">
        <OfflineDemo />
      </div>
    </div>
  );
}