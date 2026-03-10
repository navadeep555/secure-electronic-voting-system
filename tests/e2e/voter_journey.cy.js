describe('Voter End-To-End Journey', () => {

    const voterDetails = {
        phone: '+1234567890',
        otp: '123456'
    };

    beforeEach(() => {
        // Navigate to the Nginx reverse proxy endpoint resolving to the React Frontend
        cy.visit('https://localhost');
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    it('Voter successfully completes Biometric Login and casts a vote', () => {
        /* ----------------------------------------------------
           Phase 1: Login & Authentication (Flask API Mocked or Real)
        ----------------------------------------------------- */
        cy.contains('Login').click();

        cy.get('button').contains('Start Facial Recognition').click();

        // Mocking the video stream / Biometric check logic
        // We assume the system simulates a successful match or uses a mock WebRTC feed in testing mode
        cy.intercept('POST', '/api/recognize-face', {
            statusCode: 200,
            body: { message: 'Face matched', success: true }
        }).as('biometricCheck');

        cy.wait('@biometricCheck').its('response.statusCode').should('equal', 200);

        /* ----------------------------------------------------
           Phase 2: Enter OTP
        ----------------------------------------------------- */
        cy.get('input[placeholder="Enter 6-digit OTP"]').type(voterDetails.otp);
        cy.get('button').contains('Verify OTP').click();

        // We assume an intercept for valid OTP triggering the JWT receipt
        cy.intercept('POST', '/api/verify-otp', {
            statusCode: 200,
            body: {
                token: 'eyJhbGciOiJIUzI1NiIsIn...',
                role: 'VOTER'
            }
        }).as('otpCheck');

        cy.wait('@otpCheck');
        cy.url().should('include', '/dashboard');

        /* ----------------------------------------------------
           Phase 3: Dashboard Navigation & Verify State
        ----------------------------------------------------- */
        // Ensure the system prevents navigation manually back to login after auth
        cy.visit('https://localhost/login');
        cy.url().should('include', '/dashboard');

        cy.contains('Active Elections').should('be.visible');
        cy.contains('Cast Vote').first().click(); // Select the first active election

        /* ----------------------------------------------------
           Phase 4: Casting Ballot (Node.js/Express Engine)
        ----------------------------------------------------- */
        // Ensure the vote interface is completely anonymous
        cy.get('.candidate-list').should('be.visible');

        // Check candidate Option A
        cy.contains('Candidate A').click();
        cy.get('button').contains('Submit Secure Ballot').click();

        // Confirm Modal
        cy.get('.modal').contains('Are you sure?').should('be.visible');
        cy.get('button').contains('Confirm & Sign Digitally').click();

        // API intercept to ensure 201 Created from voting-core
        cy.intercept('POST', '/voting/cast-vote', (req) => {
            expect(req.headers.authorization).to.include('Bearer eyJhbGciOi');
            req.reply({
                statusCode: 201,
                body: { message: 'Vote successfully recorded on ledger', receipt: 'tx-8091' }
            });
        }).as('castVote');

        cy.wait('@castVote');

        /* ----------------------------------------------------
           Phase 5: Receipt and Disabled Form
        ----------------------------------------------------- */
        // UI should display Success Graphic
        cy.contains('Ballot Accepted').should('be.visible');
        cy.contains('Transaction Receipt: tx-8091');

        // Trying to click "Cast Vote" again must be disabled or intercepted
        cy.get('button').contains('Submit Secure Ballot').should('be.disabled');
    });

    it('Voter is blocked via Rate Limiting during bulk attempts', () => {
        // Intercept to force 429 Status directly
        cy.intercept('POST', '/api/verify-otp', {
            statusCode: 429,
            body: { error: 'Too Many Requests' }
        });

        cy.visit('https://localhost/login');
        for (let i = 0; i < 6; i++) {
            cy.get('button').contains('Verify OTP').click();
        }

        // UI displays polite error instead of crashing
        cy.contains('Slow down. Try again later.').should('be.visible');
    });
});
