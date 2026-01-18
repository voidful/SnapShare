import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the usePeer hook directly
jest.mock('./hooks/usePeer', () => ({
  usePeer: () => ({
    peerId: 'mock-peer-id',
    connected: false,
    error: null,
    sendData: jest.fn(),
    onData: jest.fn(),
  }),
}));

describe('App', () => {
  test('renders SnapShare app in host mode (no token)', () => {
    render(<App />);
    const headingElement = screen.getByText(/SnapShare/i);
    expect(headingElement).toBeInTheDocument();
  });
});
