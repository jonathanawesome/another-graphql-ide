import { createPreview } from '@another-graphql-ide/shared'
import { useState } from 'react'

import { Search, type SearchProps } from './search'

const Wrapper = ({ placeholder }: Pick<SearchProps, 'placeholder'>) => {
  const [value, setValue] = useState<string>('')
  return <Search onChange={setValue} placeholder={placeholder} value={value} />
}

const preview = createPreview<SearchProps>({
  title: 'Search',
  component: Search,
  category: 'UI Components',
  demos: [
    {
      name: 'Schema search',
      render: () => <Wrapper placeholder="Search schema..." />,
    },
  ],
})

export default preview
