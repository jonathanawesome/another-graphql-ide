import { useState } from 'react'
import { createPreview, type NavPath } from 'react-foundry'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Input, type InputProps } from './input'

export const nav: NavPath = 'UI Components/Input'

const Wrapper = ({
  leftIcon,
  name,
  placeholder,
  withClearValue,
}: Omit<InputProps, 'handleChange' | 'value'>) => {
  const [value, setValue] = useState<string>('')
  return (
    <Input
      handleChange={e => setValue(e.target.value)}
      leftIcon={leftIcon}
      name={name}
      placeholder={placeholder}
      value={value}
      withClearValue={withClearValue}
    />
  )
}

export const AllVariants = createPreview({
  label: 'All variants',
  render: () => (
    <DemoGrid>
      <DemoGridItem>
        <span>default</span>
        <Wrapper name="some-cool-input1" placeholder="placeholder..." />
      </DemoGridItem>
      <DemoGridItem>
        <span>leftIcon & withClearValue</span>
        <Wrapper
          name="some-cool-input1"
          placeholder="placeholder..."
          withClearValue
          leftIcon="BowArrow"
        />
      </DemoGridItem>
      <DemoGridItem>
        <span>withLeftIcon</span>
        <Wrapper
          name="some-cool-input1"
          placeholder="placeholder..."
          leftIcon="Search"
        />
      </DemoGridItem>
      <DemoGridItem>
        <span>withClearValue</span>
        <Wrapper
          name="some-cool-input1"
          placeholder="placeholder..."
          withClearValue={true}
        />
      </DemoGridItem>
    </DemoGrid>
  ),
})

export const Default = createPreview({
  label: 'default',
  render: () => (
    <DemoGrid>
      <DemoGridItem>
        <Wrapper name="some-cool-input1" placeholder="placeholder..." />
      </DemoGridItem>
    </DemoGrid>
  ),
})

export const WithLeftIcon = createPreview({
  label: 'withLeftIcon',
  render: () => (
    <DemoGrid>
      <DemoGridItem>
        <Wrapper
          name="some-cool-input1"
          placeholder="placeholder..."
          leftIcon="Settings2"
        />
      </DemoGridItem>
    </DemoGrid>
  ),
})

export const WithClearValue = createPreview({
  label: 'withClearValue',
  render: () => (
    <DemoGrid>
      <DemoGridItem>
        <Wrapper
          name="some-cool-input1"
          placeholder="placeholder..."
          withClearValue={true}
        />
      </DemoGridItem>
    </DemoGrid>
  ),
})

export const WithClearValueAndLeftIcon = createPreview({
  label: 'withClearValue and leftIcon',
  render: () => (
    <DemoGrid>
      <DemoGridItem>
        <Wrapper
          name="some-cool-input1"
          placeholder="placeholder..."
          withClearValue={true}
          leftIcon={'BookOpenText'}
        />
      </DemoGridItem>
    </DemoGrid>
  ),
})
