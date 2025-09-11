import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { HandleChangeSignature, Input, type InputProps } from './input'

const handleChangeStub: HandleChangeSignature = ({ name, value }) => {
  // eslint-disable-next-line no-console
  console.log('input change', { name, value })
}

const preview = createPreview<InputProps>({
  title: 'Input',
  component: Input,
  category: 'UI Components',
  variants: [
    {
      name: 'default with placeholder',
      props: {
        placeholder: '213',
        handleChange: handleChangeStub,
        name: 'some-cool-input',
        value: '',
      },
    },
    {
      name: 'with value',
      props: {
        placeholder: '213',
        handleChange: handleChangeStub,
        name: 'some-cool-input',
        value: '12324312',
      },
    },
  ],
  demos: [
    {
      name: 'Examples',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <Input
              placeholder="213"
              handleChange={handleChangeStub}
              name="some-cool-input"
              value={'12324312'}
            />
          </DemoGridItem>
          <DemoGridItem>
            <Input
              placeholder="243637"
              handleChange={handleChangeStub}
              name="some-cool-input"
              value={''}
            />
          </DemoGridItem>
          <DemoGridItem>
            <Input
              placeholder="Some Cool Input"
              handleChange={handleChangeStub}
              name="some-cool-input"
              value={''}
            />
          </DemoGridItem>
          <DemoGridItem>
            <Input
              placeholder="987"
              handleChange={handleChangeStub}
              name="some-cool-input"
              value={''}
            />
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
