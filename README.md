CompScope

Compensation intelligence for comparing total compensation across companies, career levels, roles, and locations.

Live Demo: https://compscope-sable.vercel.app
GitHub: https://github.com/satyamshh967/CompScope

Overview

CompScope is a full-stack compensation intelligence platform built around one core idea:

Levels matter more than job titles.

Instead of treating salary as a single number, CompScope models compensation as:

Company + Role + Level + Location + Base + Stock + Bonus = Total Compensation

The application provides structured exploration, company analytics, rankings, comparisons, filtering, and compensation benchmarking.

The current application uses a clearly labeled synthetic dataset for demonstration purposes. Levels.fyi, 6figr, AmbitionBox, and Glassdoor were used for product research and feature benchmarking, not as a source of copied production data.

Features

Compensation Explorer

Search by company and role

Filter by career level and location

Sort by total compensation, base salary, stock, or bonus

Pagination

Responsive compensation table

CSV export of the current result set

Select records for comparison

Company Intelligence

Company compensation rankings

Company search

Average total compensation

Highest represented level

Record counts

Role-level analytics

Location-level analytics

Level-based compensation benchmarking

P25 / Median / P75 distribution

Compensation Comparison

Compare selected records across:

Total compensation

Base salary

Stock

Bonus

Role

Career level

Location

Years of experience

Includes compensation visualizations.

Backend Reliability

Zod request validation

Company, role, level, and location normalization

Server-side total compensation calculation

Duplicate detection

Invalid salary rejection

Missing stock/bonus defaults to zero

Structured REST API responses

Testing

Core business logic is covered with Vitest.

Current suite: 11 tests passing

Architecture

Next.js UI
  React + TypeScript + Tailwind CSS
          |
          v
REST API Layer
  Next.js Route Handlers
          |
     +----+----+
     |         |
     v         v
   Zod      Business Logic
Validation  Normalization
            Calculation
            Duplicate checks
                |
                v
           Prisma ORM
                |
                v
        PostgreSQL / Neon

API

Compensation

GET  /api/compensation
POST /api/compensation

Companies

GET /api/companies
GET /api/companies/[id]
GET /api/companies/rankings
GET /api/companies/[id]/analytics

Comparison

GET /api/compare?ids=<id1>,<id2>,<id3>

Data Model

CompScope separates major compensation dimensions into normalized entities:

Company
   |
   +-- Compensation
   |
   +-- Role
   +-- Level
   +-- Location

A compensation record contains company, role, career level, location, base salary, stock, bonus, total compensation, currency, years of experience, and source.

Total compensation is calculated on the server:

total compensation = base salary + stock + bonus

The client cannot override the calculated total.

Data Quality

Validation

Requests are validated using Zod. Invalid and negative salary values, missing required fields, infinite numeric values, and invalid currency lengths are rejected.

Normalization

Company and role names are normalized before storage to reduce inconsistent duplicates.

For example:

"  Google  "
"Google"
"GOOGLE"

are normalized into a consistent representation for matching.

Duplicate Detection

Before creating a compensation record, CompScope checks for an existing identical combination of:

Company
Role
Level
Location
Base
Stock
Bonus

Research

The product direction was informed by studying:

Levels.fyi

6figr

AmbitionBox

Glassdoor

Key product observation:

Compensation becomes more useful when structured by career level, location, role, and compensation components rather than represented as a single salary number.

The research influenced the decision to focus CompScope on compensation intelligence rather than attempting to reproduce complete job, review, community, or benefits platforms.

Technology Stack

Layer

Technology

Framework

Next.js 16

UI

React 19

Language

TypeScript

Styling

Tailwind CSS

Charts

Recharts

API

Next.js Route Handlers

Validation

Zod

ORM

Prisma

Database

PostgreSQL

Database Hosting

Neon

Deployment

Vercel

Testing

Vitest

Running Locally

1. Clone

git clone https://github.com/satyamshh967/CompScope.git
cd CompScope

2. Install

npm install

3. Environment

Create .env:

DATABASE_URL="your-postgresql-connection-string"

4. Generate Prisma Client

npx prisma generate

5. Run

npm run dev

Open http://localhost:3000.

Testing

Run automated tests:

npm test

Run the production build:

npm run build

Deployment

CompScope is deployed on Vercel with PostgreSQL hosted on Neon.

Production: https://compscope-sable.vercel.app

The database connection string is supplied through deployment environment variables and is not committed to the repository.

Engineering Decisions

Why levels instead of only titles?

Titles vary significantly between companies. A "Senior Software Engineer" at one organization can represent a different scope and compensation level at another.

CompScope therefore treats career level as a first-class dimension of compensation analysis.

Why calculate total compensation on the server?

Allowing clients to submit their own total compensation could make stored data inconsistent.

Base + Stock + Bonus
          |
          v
   Server calculation
          |
          v
 Total Compensation

Why synthetic data?

The project is a technical demonstration rather than a claim of verified market compensation. Synthetic data allows the architecture and analytics to be demonstrated without presenting copied or unverified figures as authoritative market data.

Why not implement every reference-platform feature?

The goal was to build a focused compensation intelligence system rather than a clone of a large salary/review/job platform.

Engineering effort was prioritized toward structured data, normalization, reliable ingestion, compensation calculation, level-based analysis, comparison, analytics, testing, and deployment.

Project Status

Production-ready demo

Full-stack application

PostgreSQL database

REST APIs

Data validation

Normalization

Duplicate detection

Analytics

Compensation benchmarking

Automated tests

Responsive UI

Production deployment

Disclaimer

CompScope's current compensation records are synthetic demonstration data.

They should not be interpreted as verified salary information, employment offers, or authoritative market compensation benchmarks.