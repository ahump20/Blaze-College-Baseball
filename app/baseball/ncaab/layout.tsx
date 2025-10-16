import type { ReactNode } from 'react';
import { BaseballLayoutShell } from './components/BaseLayoutShell';

export default function BaseballLayout({ children }: { children: ReactNode }) {
  return <BaseballLayoutShell>{children}</BaseballLayoutShell>;
}
