import { render } from '@testing-library/vue'
import Component from '@/components/IndexStopProtection.vue'
import { Base } from '@/utils/tests/core'
const base = new Base(Component)

jest.mock('vue-cli-plugin-electron-builder/lib', () => ({
  createProtocol: () => {},
}))

describe('components/IndexStopProtection.vue', () => {
  test('disable button by prop', () => {
    const { getByTestId } = render(Component, {
      props: {
        disabled: true,
      },
    })
    const Button = getByTestId('pause-button')
    expect(Button).toBeDisabled()
  })
})
