import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Badge } from '@/components/ui/badge';

const DeviceIndicator = () => {
  const { type, orientation, width, height, isTouch } = useDeviceDetection();

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-1">
      <Badge variant="outline" className="text-xs">
        {type.toUpperCase()}
      </Badge>
      <Badge variant="outline" className="text-xs">
        {orientation}
      </Badge>
      {isTouch && (
        <Badge variant="outline" className="text-xs">
          TOUCH
        </Badge>
      )}
    </div>
  );
};

export default DeviceIndicator;