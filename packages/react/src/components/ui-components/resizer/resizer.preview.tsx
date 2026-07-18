import { createPreview } from '@another-graphql-ide/shared'

import {
  DemoGrid,
  DemoGridItem,
} from '../../utility-components/previews/components'

import { Resizer, type ResizerProps } from './resizer'

const preview = createPreview<ResizerProps>({
  title: 'Resizer',
  component: Resizer,
  category: 'UI Components',
  demos: [
    {
      name: 'Horizontal Resizer',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <div style={{ height: '400px' }}>
              <Resizer
                orientation="horizontal"
                firstPane={
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f0f0f0',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    First Pane (Horizontal)
                  </div>
                }
                secondPane={
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#e0e0e0',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Second Pane (Horizontal)
                  </div>
                }
              />
            </div>
          </DemoGridItem>
        </DemoGrid>
      ),
    },
    {
      name: 'Vertical Resizer',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <div style={{ height: '400px' }}>
              <Resizer
                orientation="vertical"
                firstPane={
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f0f0f0',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    First Pane (Vertical)
                  </div>
                }
                secondPane={
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#e0e0e0',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Second Pane (Vertical)
                  </div>
                }
              />
            </div>
          </DemoGridItem>
        </DemoGrid>
      ),
    },
    {
      name: 'Custom Size Limits',
      render: () => (
        <DemoGrid>
          <DemoGridItem>
            <div style={{ height: '400px' }}>
              <Resizer
                orientation="horizontal"
                defaultSizePercent={30}
                minSizePercent={20}
                maxSizePercent={60}
                firstPane={
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#f0f0f0',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                    }}
                  >
                    <div>First Pane</div>
                    <div
                      style={{
                        fontSize: '12px',
                        marginTop: '10px',
                        opacity: 0.7,
                      }}
                    >
                      Min: 20%, Max: 60%
                    </div>
                  </div>
                }
                secondPane={
                  <div
                    style={{
                      padding: '20px',
                      backgroundColor: '#e0e0e0',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    Second Pane
                  </div>
                }
              />
            </div>
          </DemoGridItem>
        </DemoGrid>
      ),
    },
  ],
})

export default preview
