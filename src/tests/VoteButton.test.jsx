import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';

const VotingButton = () => {
  const [loading, setLoading] = React.useState(false);
  return (
    <button disabled={loading} onClick={() => setLoading(true)}>
      {loading ? "Processing..." : "Cast Vote"}
    </button>
  );
};

describe('FE-02: Double-Submission Prevention', () => {
  it('prevents multiple clicks by disabling the button', () => {
    render(<VotingButton />);
    const btn = screen.getByRole('button', { name: /cast vote/i });

    fireEvent.click(btn);

    expect(btn).toBeDisabled();
    expect(btn).toHaveTextContent(/processing/i);
  });
});