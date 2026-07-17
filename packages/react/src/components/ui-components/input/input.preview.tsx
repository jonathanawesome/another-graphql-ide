import { createPreview } from '@another-graphql-ide/shared'
import { useState } from 'react'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Input, type InputProps } from './input'

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

const preview = createPreview<InputProps>({
  title: 'Input',
  component: Input,
  category: 'UI Components',

  demos: [
    {
      name: 'All variants',
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
    },
    {
      name: 'default',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <Wrapper name="some-cool-input1" placeholder="placeholder..." />
          </DemoGridItem>
        </DemoGrid>
      ),
    },
    {
      name: 'withLeftIcon',
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
    },
    {
      name: 'withClearValue',
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
    },
    {
      name: 'withClearValue and leftIcon',
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
    },
  ],
})

export default preview
