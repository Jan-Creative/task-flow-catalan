import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDeviceType } from '@/hooks/device/useDeviceType';
import { usePhoneDetection } from '@/hooks/device/usePhoneDetection';
import { useIOSDetection } from '@/hooks/useIOSDetection';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DeviceDebugPanelProps {
  onTestUltraSimple?: () => void;
  isUltraSimpleOpen?: boolean;
}

export const DeviceDebugPanel: React.FC<DeviceDebugPanelProps> = ({ 
  onTestUltraSimple,
  isUltraSimpleOpen 
}) => {
  // All detection hooks
  const deviceTypeInfo = useDeviceType();
  const phoneInfo = usePhoneDetection();
  const isIOS = useIOSDetection();
  const queryClient = useQueryClient();
  
  // Calculate final condition
  const shouldUseUltraSimple = deviceTypeInfo.type === 'iphone' && phoneInfo.isPhone && isIOS;
  
  // Force refresh cache handler
  const handleForceRefresh = () => {
    queryClient.invalidateQueries();
    toast.success("Cache invalidat", {
      description: "S'ha forçat l'actualització de totes les dades"
    });
    setTimeout(() => window.location.reload(), 500);
  };
  
  // Clear storage handler
  const handleClearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigator.serviceWorker?.getRegistrations().then(regs => {
      regs.forEach(reg => reg.unregister());
    });
    toast.success("Emmagatzematge netejat", {
      description: "localStorage, sessionStorage i Service Workers netejats"
    });
    setTimeout(() => window.location.reload(), 500);
  };
  
  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <Card className="fixed bottom-20 right-4 z-50 w-80 max-h-96 overflow-auto">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          🔍 Device Detection Debug
          <Badge variant={shouldUseUltraSimple ? "default" : "destructive"} className="text-xs">
            {shouldUseUltraSimple ? "ULTRA SIMPLE" : "COMPLEX FORM"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        {/* Device Type Hook */}
        <div className="border rounded p-2">
          <div className="font-semibold text-primary">useDeviceType:</div>
          <div>Type: <Badge variant="outline">{deviceTypeInfo.type}</Badge></div>
          <div>Touch: <Badge variant={deviceTypeInfo.isTouch ? "default" : "outline"}>{deviceTypeInfo.isTouch ? "YES" : "NO"}</Badge></div>
          <div>Mobile: <Badge variant={deviceTypeInfo.isMobile ? "default" : "outline"}>{deviceTypeInfo.isMobile ? "YES" : "NO"}</Badge></div>
          <div>OS: <Badge variant="outline">{deviceTypeInfo.os}</Badge></div>
        </div>

        {/* Phone Detection Hook */}
        <div className="border rounded p-2">
          <div className="font-semibold text-primary">usePhoneDetection:</div>
          <div>Is Phone: <Badge variant={phoneInfo.isPhone ? "default" : "outline"}>{phoneInfo.isPhone ? "YES" : "NO"}</Badge></div>
          <div>Size: <Badge variant="outline">{phoneInfo.size}</Badge></div>
          <div>Orientation: <Badge variant="outline">{phoneInfo.orientation}</Badge></div>
          <div>Width: <Badge variant="outline">{phoneInfo.availableWidth}px</Badge></div>
          <div>Can Fit Tabs: <Badge variant="outline">{phoneInfo.canFitTabs}</Badge></div>
        </div>

        {/* iOS Detection Hook */}
        <div className="border rounded p-2">
          <div className="font-semibold text-primary">useIOSDetection:</div>
          <div>Is iOS: <Badge variant={isIOS ? "default" : "outline"}>{isIOS ? "YES" : "NO"}</Badge></div>
        </div>

        {/* Final Condition */}
        <div className="border rounded p-2 bg-muted">
          <div className="font-semibold text-primary">Final Condition:</div>
          <div className="text-xs space-y-1">
            <div>deviceType === 'iphone': <Badge variant={deviceTypeInfo.type === 'iphone' ? "default" : "destructive"}>{deviceTypeInfo.type === 'iphone' ? "TRUE" : "FALSE"}</Badge></div>
            <div>isPhone: <Badge variant={phoneInfo.isPhone ? "default" : "destructive"}>{phoneInfo.isPhone ? "TRUE" : "FALSE"}</Badge></div>
            <div>isIOS: <Badge variant={isIOS ? "default" : "destructive"}>{isIOS ? "TRUE" : "FALSE"}</Badge></div>
          </div>
          <div className="mt-2 pt-2 border-t">
            <div className="font-semibold">Should use Ultra Simple: <Badge variant={shouldUseUltraSimple ? "default" : "destructive"}>{shouldUseUltraSimple ? "TRUE" : "FALSE"}</Badge></div>
          </div>
        </div>

        {/* Current State */}
        <div className="border rounded p-2">
          <div className="font-semibold text-primary">Current State:</div>
          <div>Ultra Simple Open: <Badge variant={isUltraSimpleOpen ? "default" : "outline"}>{isUltraSimpleOpen ? "YES" : "NO"}</Badge></div>
        </div>

        {/* Test Button */}
        {onTestUltraSimple && (
          <Button 
            onClick={onTestUltraSimple}
            size="sm" 
            className="w-full"
            variant={shouldUseUltraSimple ? "default" : "outline"}
          >
            🧪 Test Ultra Simple Form
          </Button>
        )}

        {/* Browser Info */}
        <div className="border rounded p-2 text-xs opacity-75">
          <div className="font-semibold">Browser Info:</div>
          <div>User Agent: {navigator.userAgent.substring(0, 50)}...</div>
          <div>Platform: {navigator.platform}</div>
          <div>Touch Points: {navigator.maxTouchPoints}</div>
          <div>Window: {window.innerWidth}x{window.innerHeight}</div>
        </div>

        {/* Cache & Storage Controls */}
        <div className="border rounded p-2 space-y-2">
          <div className="font-semibold text-primary">Cache Controls:</div>
          <Button 
            onClick={handleForceRefresh}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <RefreshCw className="w-3 h-3 mr-2" />
            Force Refresh Cache
          </Button>
          <Button 
            onClick={handleClearStorage}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            <Trash2 className="w-3 h-3 mr-2" />
            Clear Storage + SW
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};