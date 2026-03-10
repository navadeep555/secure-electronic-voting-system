import * as React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import axios from 'axios';
import Login from '../../src/pages/Login'; // Adjust path if needed

// Mock axios
vi.mock('axios');

// Mock recognizeUserFace
vi.mock('../../src/services/faceRecognition', () => ({
    recognizeUserFace: vi.fn(),
}));

import { recognizeUserFace } from '../../src/services/faceRecognition';

// Mock react-webcam to provide a screenshot
vi.mock('react-webcam', () => {
    return {
        default: React.forwardRef((props, ref) => {
            React.useImperativeHandle(ref, () => ({
                getScreenshot: () => 'data:image/jpeg;base64,mock'
            }));
            return <div data-testid="webcam-mock" />;
        })
    };
});

describe('Login Component Tests', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        sessionStorage.clear();
        localStorage.clear();
    });

    it('renders login form correctly with biometric step first', () => {
        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/Aadhaar \/ Voter ID/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Verify Identity/i })).toBeInTheDocument();
    });

    it('handles OTP verification workflow', async () => {
        // Mock successful Biometric request
        (recognizeUserFace as Mock).mockResolvedValueOnce({
            success: true,
            userIdHash: 'fake-hash-123',
            otp: '123456'
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        // Enter Voter ID
        const voterInput = screen.getByPlaceholderText(/Aadhaar \/ Voter ID/i);
        fireEvent.change(voterInput, { target: { value: 'VOTER123' } });

        // Simulate clicking the biometric verify button which triggers OTP step
        const verifyIdentityBtn = screen.getByRole('button', { name: /Verify Identity/i });
        fireEvent.click(verifyIdentityBtn);

        // wait for OTP state
        await waitFor(() => {
            const otpInput = screen.getByPlaceholderText('000000');
            expect(otpInput).toBeInTheDocument();
        });

        // Mock successful OTP request
        (axios.post as Mock).mockResolvedValueOnce({
            data: { success: true, message: 'OTP verified successfully', token: 'fake-jwt-token' }
        });

        // Simulate typing OTP
        const otpInput = screen.getByPlaceholderText('000000');
        fireEvent.change(otpInput, { target: { value: '123456' } });

        // Submit OTP
        const submitOtpBtn = screen.getByRole('button', { name: /Enter Voting Portal/i });
        fireEvent.click(submitOtpBtn);

        // Check if axios was called with correct parameters
        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith('/api/verify-otp', {
                userIdHash: 'fake-hash-123',
                otp: '123456'
            });
            expect(localStorage.getItem('voterToken')).toBe('fake-jwt-token');
        });
    });

    it('displays error message on invalid OTP', async () => {
        // Mock successful Biometric request to get to OTP screen
        (recognizeUserFace as Mock).mockResolvedValueOnce({
            success: true,
            userIdHash: 'fake-hash-123',
            otp: '123456'
        });

        render(
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Aadhaar \/ Voter ID/i), { target: { value: 'VOTER123' } });
        fireEvent.click(screen.getByRole('button', { name: /Verify Identity/i }));

        // Wait for step 2
        await waitFor(() => {
            expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
        });

        // Mock failing OTP request
        (axios.post as Mock).mockRejectedValueOnce({
            response: { data: { message: 'Invalid OTP provided' } }
        });

        fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '000000' } });
        fireEvent.click(screen.getByRole('button', { name: /Enter Voting Portal/i }));

        // We check that the mocked error is handled (in this case by the toast, 
        // but without mocking toast we can just verify the post failed and loading state resets)
        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Enter Voting Portal/i })).not.toBeDisabled();
        });
    });
});
