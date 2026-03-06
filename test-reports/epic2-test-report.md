# Epic 2 – Secure Voting Process Test Report

## Modules Tested
- Vote Casting
- Vote Encryption
- Double Voting Prevention
- Session Validation

## Test Types
- Functional Testing
- Security Testing
- Validation Testing

## Test Cases Summary

### TC_VOTE_01
Scenario: Authenticated user casts a vote  
Expected Result: Vote recorded successfully  
Status: Pass  

### TC_VOTE_02
Scenario: User attempts to vote twice  
Expected Result: Second vote rejected  
Status: Pass  

### TC_VOTE_03
Scenario: Tampered vote payload  
Expected Result: Vote rejected  
Status: Pass  

## Result
Core voting functionality validated.
Vote integrity and double-voting prevention confirmed.

