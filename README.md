CompScope

Compensation Intelligence for Structured Salary Comparison

CompScope is a full-stack compensation intelligence platform designed to make salary data easier to search, compare, and analyze across companies, roles, career levels, and locations.

The core idea is simple:

Levels matter more than job titles.

Instead of treating a job title alone as a meaningful compensation benchmark, CompScope structures compensation around:

Company + Role + Level + Location + Experience + Base + Stock + Bonus

and calculates total compensation from those components.

Live Demo

Production: https://compscope-sable.vercel.app/

GitHub: https://github.com/satyamshh967/CompScope

What CompScope Does

CompScope provides a structured interface for exploring compensation data.

Compensation Explorer

Search by company or role

Filter by career level

Filter by location

Sort by total compensation

Sort by base salary

Sort by stock

Sort by bonus

Select records for comparison

Export the currently displayed records as CSV

View compensation breakdowns through charts

Company Intelligence

Company-level compensation rankings

Company search

Average total compensation

Number of compensation records

Highest represented career level

Individual company intelligence pages

Company compensation analytics

Compensation Comparison

Compare up to three compensation records across:

Base salary

Stock

Bonus

Total compensation

Role

Career level

Location

Years of experience

The comparison view also provides visual compensation breakdowns and comparison insights.

Why Levels Matter

Two employees can have the same job title but very different responsibilities and compensation.

For example:

Company A
Software Engineer
L3

Company A
Software Engineer
L5

The title is similar, but the scope, seniority, responsibility, and compensation can be significantly different.

CompScope therefore treats career level as a first-class compensation dimension rather than relying only on job titles.

Data Model

Compensation records are normalized into structured entities.

Company
   |
   +-- Role
   |
   +-- Level
   |
   +-- Location
          |
          v
   Compensation Record
          |
          +-- Base Salary
          +-- Stock
          +-- Bonus
          +-- Total Compensation

The database separates reusable company, role, level, and location entities from individual compensation records.

Total Compensation

CompScope calculates total compensation on the server.

Total Compensation
=
Base Salary
+
Stock
+
Bonus

The total compensation value supplied by a client is not trusted.

This keeps the calculated value consistent across ingestion and API operations.

Missing stock and bonus values are normalized to 0.

Data Validation & Normalization

The backend validates incoming compensation records before storing them.

The ingestion flow is:

Input
  |
  v
Validation
  |
  v
Company normalization
  |
  v
Role normalization
  |
  v
Level normalization
  |
  v
Location normalization
  |
  v
Duplicate detection
  |
  v
Total compensation calculation
  |
  v
PostgreSQL

The API rejects invalid compensation values and prevents duplicate compensation records.

Company and role names are normalized to improve consistency when records are ingested.

API

CompScope exposes a set of Next.js API routes for compensation and company intelligence.

Endpoint

Purpose

GET /api/compensation

Search and retrieve compensation records

POST /api/compensation

Validate and ingest a compensation record

GET /api/companies

Retrieve companies

GET /api/companies/[id]

Retrieve company information

GET /api/companies/[id]/analytics

Retrieve company compensation analytics

GET /api/companies/rankings

Rank companies by average compensation

GET /api/compare

Retrieve records for compensation comparison

Database

CompScope uses:

PostgreSQL

Neon

Prisma ORM

The application uses Prisma's PostgreSQL adapter and generated Prisma Client for database access.

The production application connects to the Neon database through the DATABASE_URL environment variable.

Tech Stack

Frontend

Next.js 16

React 19

TypeScript

Tailwind CSS

Recharts

Backend

Next.js API Route Handlers

TypeScript

Zod

Prisma

Database

PostgreSQL

Neon

Deployment

Vercel

Development

Git

GitHub

npm

Architecture

                    +---------------------+
                    |      Browser        |
                    |  Next.js / React UI |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    |   Next.js API       |
                    |  Route Handlers     |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    | Validation &        |
                    | Normalization       |
                    |       Zod           |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    |      Prisma         |
                    |   PostgreSQL ORM    |
                    +----------+----------+
                               |
                               v
                    +---------------------+
                    |   Neon PostgreSQL   |
                    +---------------------+

Data Source & Transparency

Important

The current production demo uses a synthetic compensation dataset.

The dataset is clearly identified in the application and is intended to demonstrate the platform's data model, ingestion, filtering, comparison, and analytics capabilities.

CompScope does not claim that these synthetic records are verified salary submissions from external salary websites.

Research References

The product design and compensation schema were informed by research into:

Levels.fyi

6figr

AmbitionBox

Glassdoor

These platforms were researched for their approaches to:

Salary search

Company filtering

Role/title filtering

Location

Experience

Career levels

Base salary

Stock/equity

Bonus

Total compensation

Company pages

Compensation comparison

Salary distributions and visualizations

The current demo does not scrape or directly reproduce live salary data from these platforms.

Product Decisions

Why synthetic data?

The project focuses on demonstrating a reliable compensation intelligence architecture rather than presenting unverified third-party data as factual market data.

This also allows the ingestion pipeline, validation rules, normalization logic, comparison system, and analytics to be tested consistently.

Why focus on compensation?

Salary platforms often combine compensation with reviews, jobs, interviews, benefits, and community content.

CompScope intentionally focuses on the compensation intelligence problem:

Search
  |
  v
Filter
  |
  v
Normalize
  |
  v
Compare
  |
  v
Analyze

This keeps the product focused while leaving room for future extensions.

Why PostgreSQL?

Compensation data contains relationships between companies, roles, levels, locations, and individual compensation records.

A relational database provides a natural structure for these relationships while allowing aggregation and analytical queries.

Key Engineering Decisions

Server-side total compensation

Total compensation is calculated by the backend instead of trusting the client.

baseSalary + stock + bonus

This prevents inconsistent totals.

Duplicate protection

The ingestion layer detects duplicate compensation records and returns a conflict response rather than inserting the same record repeatedly.

Input validation

Zod validates incoming compensation payloads before database operations.

Normalized entities

Company, role, level, and location are represented as separate entities to reduce duplication and make filtering and aggregation more reliable.

Responsive interface

The UI is designed to remain usable across desktop and smaller screens, including horizontally scrollable data tables where necessary.

Project Structure

CompScope/
|
+-- app/
|   +-- api/
|   |   +-- compensation/
|   |   +-- companies/
|   |   +-- compare/
|   |
|   +-- companies/
|   |   +-- [id]/
|   |   +-- page.tsx
|   |
|   +-- compare/
|   |   +-- page.tsx
|   |
|   +-- components/
|   |   +-- compensation-chart.tsx
|   |   +-- theme-toggle.tsx
|   |
|   +-- globals.css
|   +-- page.tsx
|
+-- lib/
|   +-- db.ts
|   +-- services/
|
+-- prisma/
|   +-- schema.prisma
|   +-- migrations/
|
+-- prisma.config.ts
+-- package.json
+-- README.md

Running Locally

1. Clone the repository

git clone https://github.com/satyamshh967/CompScope.git
cd CompScope

2. Install dependencies

npm install

3. Configure the database

Create a .env file:

DATABASE_URL="your-postgresql-connection-string"

Do not commit .env or expose database credentials publicly.

4. Generate Prisma Client

npx prisma generate

5. Start the development server

npm run dev

Open:

http://localhost:3000

Production Build

The project generates the Prisma Client before building Next.js:

npm run build

which runs:

prisma generate
|
v
next build

This ensures the generated Prisma client is available in fresh deployment environments.

Deployment

The production application is deployed using Vercel.

The deployment architecture is:

GitHub
   |
   v
Vercel
   |
   v
Next.js
   |
   v
Prisma
   |
   v
Neon PostgreSQL

The production environment requires:

DATABASE_URL

to point to the PostgreSQL database.

The application does not automatically seed the production database during deployment.

Current Scope

The current version focuses on:

Compensation exploration

Career-level aware comparison

Company intelligence

Company search

Compensation analytics

Data normalization

Data validation

Duplicate protection

Compensation visualization

The current demo does not include:

User authentication

Reviews

Job listings

Community discussions

Live scraping of third-party salary platforms

These areas are intentionally outside the current compensation-focused MVP.

Future Improvements

Potential future improvements include:

Percentile and salary distribution analysis

More advanced compensation trends

Time-based compensation changes

Larger verified datasets

Source-specific ingestion adapters

Automated data-quality monitoring

Authentication and saved comparisons

More advanced company and level benchmarking

Disclaimer

CompScope is a demonstration project.

The production demo currently uses synthetic compensation records. The compensation values should not be interpreted as verified market compensation data or as financial/career advice.

Author

Satyam Sharma

GitHub: satyamshh967

License

This project is currently provided as a portfolio and demonstration project.