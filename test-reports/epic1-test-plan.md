# Epic 1 – Secure Voter Identity Test Plan

## Objective
To define the testing strategy for secure voter identity registration,
including biometric capture, document verification, and OTP validation.

## Scope
This test plan covers:
- User registration
- Face capture and liveness detection
- Document (Voter ID / Aadhaar) verification
- OTP-based identity confirmation

## Test Approach
- Functional testing of registration workflow
- Security testing for identity validation
- Validation testing for age and Aadhaar rules

## Test Environment
- Frontend: Web browser (Chrome/Safari)
- Backend: Python-based server
- OCR Engine: EasyOCR
- Biometric Module: Face recognition library

## Planned Test Scenarios

### TP_EP1_01
Scenario: New user registration with valid data  
Expected Result: Registration successful  

### TP_EP1_02
Scenario: Face capture without liveness  
Expected Result: Registration blocked  

### TP_EP1_03
Scenario: Invalid document upload  
Expected Result: Verification failure  

### TP_EP1_04
Scenario: Invalid OTP submission  
Expected Result: Registration blocked  

## Entry Criteria
- Registration UI available
- Camera and OCR services operational

## Exit Criteria
- All planned tests executed
- No critical security defects open

## Risks
- OCR inaccuracies
- Poor lighting during face capture

## Responsibilities
- Tester: Execute test cases
- Developer: Resolve defects
- Scrum Master: Review test completion

