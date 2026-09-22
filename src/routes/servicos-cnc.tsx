import { createFileRoute } from '@tanstack/react-router';
import { FieldServicesPage } from '@/components/services/FieldServicesPage';

export const Route = createFileRoute('/servicos-cnc')({
  component: FieldServicesPage,
});
