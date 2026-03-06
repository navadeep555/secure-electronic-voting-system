# Epic 2 – Secure Voting Process Test Plan

## Objective
To plan and define the testing strategy for the secure voting process,
ensuring vote integrity, authentication enforcement, and prevention of
multiple voting attempts.

## Scope
This test plan covers:
- Secure vote casting
- Vote encryption and integrity
- Double voting prevention
- Session validation during voting

## Test Approach
- Functional testing of voting workflows
- Security testing for vote tampering and replay attempts
- Validation testing for session expiry and authentication checks

## Test Environment
- Frontend: Web browser (Chrome/Safari)
- Backend: Python-based server
- Database: Vote records storage
- Authentication: Session-based login

## Planned Test Scenarios

### TP_EP2_01
Scenario: Authenticated user casts a vote  
Expected Result: Vote accepted and recorded  

### TP_EP2_02
Scenario: User attempts to vote more than once  
Expected Result: Second attempt rejected  

### TP_EP2_03
Scenario: Vote payload tampering  
Expected Result: Vote rejected by system  

### TP_EP2_04
Scenario: Session expires during voting  
Expected Result: User redirected to login  

## Entry Criteria
- User authentication module functional
- Election data available

## Exit Criteria
- All planned test cases executed
- No critical defects open

## Risks
- Network interruption during vote submission
- Session timeout edge cases

## Responsibilities
- Tester: Execute planned test cases
- Developer: Fix identified defects
- Scrum Master: Review test completion

