import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import React from 'react';

// 1. A Mock Protected Route logic
const ProtectedRoute = ({ isAuth, children }) => {
  return isAuth ? children : <Navigate to="/login" />;
};

describe('FE-01: Authentication Guard Logic', () => {
  it('should redirect to login when isAuthenticated is false', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/dashboard" element={
            <ProtectedRoute isAuth={false}>
              <div>Private Dashboard</div>
            </ProtectedRoute>
          } />
          <Route path="/login" element={<div>Please Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // If the guard works, we should see the login page, not the dashboard
    expect(screen.getByText(/please login page/i)).toBeInTheDocument();
    expect(screen.queryByText(/private dashboard/i)).not.toBeInTheDocument();
  });
});