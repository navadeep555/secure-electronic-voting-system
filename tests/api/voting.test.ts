import request from 'supertest';
import app from '../../voting-core/src/server'; // Adjust path based on actual Express app location
import { pool } from '../../voting-core/src/db'; // Adjust path for postgres DB pool
import { describe, it, expect, beforeAll, afterAll, vi, type Mock } from 'vitest';
import jwt from 'jsonwebtoken';

// Mock the Database connection so tests don't hit the real Postgres server
vi.mock('../../voting-core/src/db', () => ({
    pool: {
        query: vi.fn(),
        connect: vi.fn(() => ({
            query: vi.fn(),
            release: vi.fn(),
        })),
        on: vi.fn()
    },
    initDB: vi.fn()
}));

describe('Voting Core API: Ballot Testing', () => {

    const jwtSecret = 'your_shared_secret'; // this matches what the server fallback is using
    let mockToken = '';

    beforeAll(() => {
        process.env.JWT_SECRET = jwtSecret;
        mockToken = 'Bearer ' + jwt.sign({ userId: 'VOTER-555', role: 'VOTER' }, jwtSecret);
    });

    afterAll(async () => {
        vi.clearAllMocks();
    });

    describe('POST /api/votes/cast-vote', () => {

        it('should successfully cast a vote when valid JWT & payload provided', async () => {
             const mockClient = {
                query: vi.fn(),
                release: vi.fn(),
             };
             (pool.connect as Mock).mockResolvedValueOnce(mockClient);

             // 1. Check Election Status
             mockClient.query.mockResolvedValueOnce({
                 rows: [{ status: 'ACTIVE', start_time: 0, end_time: Math.floor(Date.now() / 1000) + 10000 }]
             });

             // 2. Check Voter Eligibility
             mockClient.query.mockResolvedValueOnce({
                 rows: [{ has_voted: 0 }]
             });

             // 3. BEGIN
             mockClient.query.mockResolvedValueOnce({});

             // 4. INSERT INTO votes
             mockClient.query.mockResolvedValueOnce({});

             // 5. UPDATE election_voters
             mockClient.query.mockResolvedValueOnce({});

             // 6. COMMIT
             mockClient.query.mockResolvedValueOnce({});

            const res = await request(app)
                .post('/api/votes/cast-vote')
                .set('Authorization', mockToken)
                .send({
                    electionId: 'ELECTION-100',
                    vote: 'CANDIDATE-01',
                    encryptionKey: 'test-key-123'
                });

            expect(res.status).toBe(200); // the app actually returns 200 json success
            expect(res.body).toHaveProperty('message', 'Your anonymous encrypted vote has been cast and sealed.');
            expect(res.body).toHaveProperty('receipt');
        });

        it('should return 401 if Authorization header is missing', async () => {
             // Mock connect just in case, though auth should block it early
             const mockClient = {
                query: vi.fn(),
                release: vi.fn(),
             };
             (pool.connect as Mock).mockResolvedValueOnce(mockClient);

            const res = await request(app)
                .post('/api/votes/cast-vote')
                .send({
                    electionId: 'ELECTION-100',
                    vote: 'CANDIDATE-01',
                    encryptionKey: 'test-key-123'
                });

            expect(res.status).toBe(401);
            expect(res.body).toHaveProperty('message', 'Access Denied');
        });
    });
});
