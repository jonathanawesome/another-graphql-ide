const previewModules = import.meta.glob<any>(
  '../../../../packages/*/src/**/*.preview.tsx',
  { eager: true }
);

export interface DiscoveredComponent {
  id: string;
  path: string;
  module: any;
  category: string;
  name: string;
}

export function discoverComponents(): DiscoveredComponent[] {
  const components: DiscoveredComponent[] = [];

  for (const [path, module] of Object.entries(previewModules)) {
    const pathParts = path.split('/');
    const packageName = pathParts[2];
    const fileName = pathParts[pathParts.length - 1].replace('.preview.tsx', '');
    
    const previewModule = module;
    
    components.push({
      id: `${packageName}-${fileName}`,
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