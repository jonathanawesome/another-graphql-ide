import { createPreview } from '@another-graphql-ide/shared'
import { useState } from 'react'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Input, type InputProps } from './input'

const Wrapper = ({
  name,
  placeholder,
}: Pick<InputProps, 'name' | 'placeholder'>) => {
  const [value, setValue] = useState<string>('')
  return (
    <Input
      handleChange={e => setValue(e.target.value)}
      name={name}
      placeholder={placeholder}
      value={value}
    />
  )
}

const preview = createPreview<InputProps>({
  title: 'Input',
  component: Input,
  category: 'UI Components',
  demos: [
    {
      name: 'Examples',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <Wrapper name="some-cool-input1" placeholder="some-cool-input1" />
          </DemoGridItem>
          <DemoGridItem>
            <Wrapper name="some-cool-input2" placeholder="some-cool-input2" />
          </DemoGridItem>
          <DemoGridItem>
            <Wrapper name="some-cool-input3" placeholder="some-cool-input3" />
          </DemoGridItem>
          <DemoGridItem>
            <Wrapper name="some-cool-input4" placeholder="some-cool-input4" />
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
