import { render, screen } from '@testing-library/react';
import NetworkGraphView from './NetworkGraphView';

test('renders learn react link', () => {
  render(<NetworkGraphView />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
