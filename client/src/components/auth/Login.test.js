// filepath: /Users/aayushkumar/Intern/Vertx_Assignment/client/src/components/auth/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Login from './Login';

// Mock axios
jest.mock('axios', () => ({
  create: () => ({
    post: jest.fn(() => Promise.resolve({ 
      data: { token: 'fake-token', user: { username: 'testuser' } } 
    }))
  })
}));

const renderWithContext = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <AuthContext.Provider value={providerProps}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </AuthContext.Provider>,
    renderOptions
  );
};

describe('Login Component', () => {
  it('renders login form', () => {
    renderWithContext(<Login />, { 
      providerProps: { isAuthenticated: false, loading: false, login: jest.fn() } 
    });
    
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    const mockLogin = jest.fn();
    
    renderWithContext(<Login />, { 
      providerProps: { isAuthenticated: false, loading: false, login: mockLogin } 
    });
    
    fireEvent.change(screen.getByLabelText(/email/i), { 
      target: { value: 'test@example.com' } 
    });
    
    fireEvent.change(screen.getByLabelText(/password/i), { 
      target: { value: 'password123' } 
    });
    
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
});