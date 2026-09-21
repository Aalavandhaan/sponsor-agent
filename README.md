# Sponsor Agent

Sponsor Agent is an AI-powered sponsorship outreach platform that helps event organizers discover relevant sponsors, verify outreach-ready business emails, generate personalized sponsorship emails, and send them through Gmail.

Built for the WeMakeDevs First Commit Hackathon using AWS.

## What it does

Sponsor Agent turns event details into verified sponsorship outreach.

--Key Features

- AI-powered sponsor discovery based on event requirements
- Professional email verification before outreach
- Human approval before sending to keep the organizer in control
- Gmail integration for approved sponsorship outreach

Users provide:

- Event name
- Location
- Expected footfall
- Audience type
- Event category
- Sponsorship requirement

The system then:

1. Researches similar real-world events
2. Discovers companies that have sponsored comparable events
3. Verifies publicly available professional email contacts
4. Removes sponsors without verified email addresses
5. Generates personalized sponsorship outreach emails
6. Allows the organizer to review and edit each email
7. Sends approved emails through Gmail

Only sponsors with verified outreach-ready email addresses are presented to the user.

## Architecture

Frontend  
↓  
Amazon API Gateway  
↓  
AWS Lambda  
↓  
Amazon Bedrock with live web grounding  
↓  
Sponsor discovery and email verification  
↓  
Gmail API for approved outreach

## AWS Services Used

- Amazon Bedrock
  - Sponsor research
  - Live web grounding
  - Contact research
  - Personalized email generation

- AWS Lambda
  - Backend orchestration
  - Sponsor discovery workflow
  - Contact verification logic
  - Response processing

- Amazon API Gateway
  - REST API between the frontend and backend

- AWS Amplify
  - Frontend hosting and deployment

## Core API Routes

### POST /analyze

Researches similar events and returns evidence-backed sponsor candidates.

### POST /find-contact

Searches for a publicly verified sponsorship-relevant professional email for a candidate company.

A sponsor is considered outreach-ready only when:

{
  "email_found": true,
  "email_ready": true
}

Outreach Flow

Event details
      ↓
Discover sponsor candidates
      ↓
Research verified contacts
      ↓
Verified email?
   YES → Keep
   NO  → Discard
      ↓
Generate personalized email
      ↓
Organizer reviews
      ↓
Approve & Send
      ↓
Gmail API



Why Sponsor Agent
Finding sponsors is usually a manual process involving:

searching previous events
identifying relevant companies
finding the correct contact person
searching for professional email addresses
writing individual outreach messages
manually sending emails

Sponsor Agent combines these steps into one workflow while keeping the organizer in control of the final outreach.

Trust and Verification

Sponsor Agent does not guess email addresses.

An email is considered usable only when the exact address is publicly verifiable through live web research.

Company websites, contact forms, LinkedIn pages, and partnership pages are not treated as email substitutes.

Sponsor Agent solves the biggest bottleneck in event organizing by replacing hours of manual LinkedIn stalking and cold emailing with a highly scalable, automated pipeline. 

By leveraging serverless AWS architecture, the platform guarantees lightning-fast processing speeds and ironclad data security, ensuring organizer data remains private and protected. 

The unique combination of live web grounding and strict verification eliminates the "hallucination problem" common in other AI tools, delivering unparalleled accuracy. 

Ultimately, this platform empowers organizers to scale their outreach effortlessly, securing higher-tier sponsorships in a fraction of the time.

View our project: https://main.d22t4r50t07nj0.amplifyapp.com/
~By
Team Doppenheimer
Built during the WeMakeDevs First Commit Hackathon.
