import { useState, useMemo } from 'react';
import { Layout } from './components/layout';
import { Sidebar } from './components/sidebar';
import { Preview } from './components/preview';
import { discoverComponents } from './utils/discovery';

export function App() {
  const components = useMemo(() => discoverComponents(), []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  const selectedComponent = components.find((c) => c.id === selectedId);
  const preview = selectedComponent?.module.default || null;

  const handleSelect = (id: string, variantName?: string) => {
    setSelectedId(id);
    setSelectedVariant(variantName || null);
  };

  const handleVariantSelect = (variantName: string) => {
    setSelectedVariant(variantName);
  };

  return (
    <Layout
      sidebar={
        <Sidebar
          components={components}
          selectedId={selectedId}
          selectedVariant={selectedVariant}
          onSelect={handleSelect}
        />
      }
      preview={
        <Preview 
          preview={preview} 
          selectedVariant={selectedVariant}
          onVariantSelect={handleVariantSelect}
        />
      }
    />
  );
}