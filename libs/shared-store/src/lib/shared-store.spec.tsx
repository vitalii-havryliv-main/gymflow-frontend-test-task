import { render } from '@testing-library/react';

import SharedStore from './shared-store';

describe('SharedStore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedStore />);
    expect(baseElement).toBeTruthy();
  });
});
