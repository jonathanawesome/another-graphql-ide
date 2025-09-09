import { ComponentType, ReactElement } from 'react';

interface PreviewModule {
  default: {
    title: string;
    component: ComponentType<Record<string, unknown>>;
    category?: string;
    variants?: Array<{
      name: string;
      props: Record<string, unknown>;
    }>;
    demos?: Array<{
      name: string;
      render: () => ReactElement;
    }>;
  };
}

const previewModules = import.meta.glob<PreviewModule>(
  '../../../../packages/*/src/**/*.preview.tsx',
  { eager: true }
);

export interface DiscoveredComponent {
  id: string;
  path: string;
  module: PreviewModule;
  category: string;
  name: string;
}

export function discoverComponents(): DiscoveredComponent[] {
  const components: DiscoveredComponent[] = [];

  for (const [path, previewModule] of Object.entries(previewModules)) {
    const pathParts = path.split('/');
    // Find the index of 'packages' in the path and get the next part as package name
    const packagesIndex = pathParts.indexOf('packages');
    const packageName = packagesIndex !== -1 ? pathParts[packagesIndex + 1] : 'unknown';
    const fileName = pathParts[pathParts.length - 1].replace('.preview.tsx', '');
    
    components.push({
      id: fileName,
      path,
      module: previewModule,
      category: previewModule.default.category || packageName,
      name: previewModule.default.title || fileName,
    });
  }

  return components.sort((a, b) => {
    if (a.category !== b.category) {
      return a.category.localeCompare(b.category);
    }
    return a.name.localeCompare(b.name);
  });
}