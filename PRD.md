# Product Requirements Document (PRD)

## Timed Trivia Challenge

**Version:** 2.0
**Last Updated:** November 17, 2025
**Document Owner:** Product Team
**Status:** Active Development

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Overview](#product-overview)
3. [Goals and Objectives](#goals-and-objectives)
4. [Target Audience](#target-audience)
5. [User Roles](#user-roles)
6. [Core Features](#core-features)
7. [Technical Architecture](#technical-architecture)
8. [User Flows](#user-flows)
9. [Functional Requirements](#functional-requirements)
10. [Non-Functional Requirements](#non-functional-requirements)
11. [Success Metrics](#success-metrics)
12. [Future Enhancements](#future-enhancements)

---

## Executive Summary

**Timed Trivia Challenge** is a comprehensive, real-time competitive trivia platform that enables users to participate in various game modes including scheduled public games, daily/weekly challenges, and one-on-one player battles. The platform features category-based questions with difficulty levels, AI-powered question generation, time-based scoring with speed bonuses, demographic-aware leaderboards, and an integrated chat system for player interaction.

The application is designed to create an engaging, competitive environment where knowledge and quick thinking are rewarded across multiple game formats, fostering both individual achievement, head-to-head competition, and community engagement with personalized experiences based on player preferences and demographics.

---

## Product Overview

### Vision

To create the premier platform for competitive, time-based trivia challenges that combines knowledge testing with multiple game modes, personalized experiences, AI-powered content generation, and real-time social engagement.

### Mission

Deliver an accessible, fair, and exciting trivia gaming experience across daily challenges, weekly tournaments, and one-on-one battles that rewards both accuracy and speed while building an active community of trivia enthusiasts with diverse interests and skill levels.

### Problem Statement

Traditional trivia platforms lack:

-   Multiple game modes (public, daily, weekly, one-on-one)
-   Category-based question selection and difficulty levels
-   Demographic-aware experiences and leaderboards
-   One-on-one competitive challenges between players
-   AI-powered content generation for unlimited questions
-   Recurring daily and weekly challenges with dedicated leaderboards
-   Real-time competitive elements and social features

Users want scheduled games they can plan to attend, spontaneous head-to-head challenges with friends, daily/weekly recurring competitions, questions tailored to their interests and skill level, and a platform that understands their demographics for better personalization.

---

## Goals and Objectives

### Primary Goals

1. **Engagement**: Create compelling, scheduled trivia events that users return to regularly
2. **Competition**: Implement fair, skill-based scoring with real-time rankings
3. **Community**: Build social features that foster player interaction and community
4. **Scalability**: Support multiple concurrent games and hundreds of players
5. **Administration**: Provide robust tools for game and content management

### Success Criteria

-   Users participate in multiple games per week
-   Average game completion rate > 70%
-   Real-time response time < 2 seconds
-   User retention rate > 60% month-over-month
-   Admin can create and manage games in < 5 minutes

---

## Target Audience

### Primary Users

-   **Trivia Enthusiasts** (Ages 18-45)

    -   Regular participants in quiz nights and trivia events
    -   Competitive individuals who enjoy testing their knowledge
    -   Value both accuracy and speed

-   **Casual Players** (Ages 16-60)
    -   Occasional participants looking for entertainment
    -   Social users who enjoy community aspects
    -   Interested in learning while having fun

### Secondary Users

-   **Game Administrators**
    -   Event organizers and content managers
    -   Need efficient tools for question management
    -   Require oversight of game scheduling and settings

---

## User Roles

### 1. Player (Standard User)

**Capabilities:**

-   Authenticate via Google OAuth
-   Complete user profile (phone number, profession, date of birth, sex)
-   View and join scheduled public games
-   Participate in daily and weekly challenges
-   Challenge other players to one-on-one games
-   Accept or decline one-on-one challenges
-   Select preferred question categories
-   Choose game difficulty levels
-   Participate in active games
-   Answer timed questions
-   View real-time scores and leaderboards (overall, daily, weekly, age-group, gender-based)
-   Chat with other players during games
-   View personal game history and statistics
-   Access past game results
-   Track win/loss record in one-on-one games

**Restrictions:**

-   Cannot create or modify games
-   Cannot manage questions or settings
-   Cannot access admin dashboard

### 2. Admin (Administrator)

**Capabilities:**

-   All Player capabilities, plus:
-   Create, edit, and delete games
-   Manage game schedules and settings
-   Create, edit, and delete questions
-   Bulk upload questions via Excel
-   View comprehensive user statistics
-   Configure global game settings
-   Monitor active games and participants
-   Manage user accounts and roles

**Access:**

-   Full admin dashboard
-   All administrative panels
-   System configuration settings

---

## Core Features

### 1. Authentication & Authorization

-   **Google OAuth Integration**

    -   Secure single sign-on
    -   Profile data import (name, email, image)
    -   Session management with JWT

-   **Profile Management**

    -   Required profile completion (phone, profession)
    -   Profile editing capabilities
    -   Avatar display from Google account

-   **Role-Based Access Control**
    -   Player vs Admin roles
    -   Protected routes and API endpoints
    -   Middleware-based authorization

### 2. Game Management

#### Game Lifecycle

-   **Scheduled**: Game created, not yet started
-   **Active**: Game in progress, accepting responses
-   **Completed**: Game ended, results available
-   **Cancelled**: Game cancelled by admin

#### Game Configuration

-   **Start Time**: When game begins
-   **End Time**: When game concludes
-   **Answer Time**: Duration for answering questions (default: 5 min)
-   **Result Time**: Duration for displaying results (default: 5 min)
-   **Interval Time**: Time between questions (default: 5 min)

#### Admin Game Features

-   Create new games with custom settings
-   Assign questions to games
-   Schedule question display times
-   Edit game configurations
-   Cancel scheduled games
-   View game participation statistics
-   Monitor active games in real-time

### 3. Question Management

#### Question Structure

-   **Question Text**: The trivia question
-   **Options**: Array of possible answers (minimum 2)
-   **Correct Answer**: Must be one of the options
-   **Metadata**: Creation/update timestamps

#### Admin Question Features

-   Create individual questions via form
-   Bulk upload via Excel spreadsheet
-   Edit existing questions
-   Delete unused questions (protection for in-game questions)
-   View question details
-   Search and filter questions
-   Pagination for question lists

#### Question Assignment

-   Link questions to specific games
-   Set display times for each question
-   Configure question-specific durations
-   Automatic scheduling based on intervals

### 4. Gameplay Experience

#### Game Discovery

-   Dashboard showing:
    -   Current active game (if any)
    -   Upcoming scheduled games
    -   Past completed games
-   Game details: start time, end time, participant count

#### Active Game Interface

-   **Real-time Question Display**

    -   Question appears at scheduled time
    -   Multiple choice options
    -   Visual countdown timer

-   **Answer Submission**

    -   Single-click answer selection
    -   Immediate submission
    -   Time-to-answer tracking

-   **Results Display**
    -   Correct answer reveal
    -   Personal score breakdown
    -   Time taken to answer
    -   Points earned (base + speed bonus)

#### Scoring System

```
Base Score (Correct Answer): 10 points
Speed Bonus: (Time Left / Total Time) × 10 points
Maximum Score per Question: 20 points
Incorrect Answer: 0 points
```

**Example:**

-   Question duration: 300 seconds (5 minutes)
-   User answers in 60 seconds
-   Time remaining: 240 seconds
-   Speed bonus: (240/300) × 10 = 8 points
-   Total score: 10 + 8 = 18 points

### 5. Leaderboard System

#### Game-Specific Leaderboard

-   Real-time ranking during active games
-   Shows all participants' scores
-   Updates after each question
-   Displays:
    -   Rank position
    -   Player name and avatar
    -   Total score
    -   Number of questions answered

#### Global Leaderboard

-   All-time top performers
-   Filters by time period (weekly, monthly, all-time)
-   Statistics:
    -   Total games played
    -   Total points earned
    -   Average score per game
    -   Win rate

### 6. Chat System

#### Game Chat

-   Real-time messaging during active games
-   All participants in the game can participate
-   Display sender name and avatar
-   Timestamp for each message
-   Auto-scroll to latest messages

#### Features

-   Send text messages
-   View message history
-   Real-time updates using WebSocket/polling
-   Message persistence in database

### 7. Question Categories & Difficulty

#### Question Categories

-   **Sports**: Athletics, football, basketball, Olympics, etc.
-   **Science**: Biology, chemistry, physics, astronomy, etc.
-   **History**: World history, American history, ancient civilizations, etc.
-   **Geography**: Countries, capitals, landmarks, rivers, etc.
-   **Entertainment**: Movies, music, TV shows, celebrities, etc.
-   **Literature**: Books, authors, poetry, classics, etc.
-   **Technology**: Computing, software, innovations, gadgets, etc.
-   **Arts**: Painting, sculpture, architecture, artists, etc.
-   **General Knowledge**: Mixed topics, current events, etc.

#### Category Selection

-   Players can choose preferred categories when joining games
-   Mixed category option for random questions
-   Games can be category-specific (e.g., "Sports Only")
-   Questions tagged with one or more categories
-   Category-based leaderboards

#### Difficulty Levels

-   **Easy**: Basic knowledge, straightforward questions
-   **Medium**: Moderate complexity, requires good knowledge
-   **Hard**: Advanced knowledge, challenging questions
-   **Expert**: Specialized knowledge, very difficult

#### Difficulty Configuration

-   Players can filter games by difficulty
-   Each question assigned a difficulty level
-   Games can have mixed difficulty or single difficulty
-   Scoring adjustments based on difficulty:
    -   Easy: Base score × 1.0
    -   Medium: Base score × 1.5
    -   Hard: Base score × 2.0
    -   Expert: Base score × 2.5

### 8. One-on-One Challenge Mode

#### Challenge System

-   **Send Challenge**

    -   Select opponent from player list
    -   Choose category and difficulty
    -   Set number of questions (5, 10, 15, 20)
    -   Set time limit per question
    -   Add optional wager/stakes

-   **Challenge Invitation**
    -   Receive notification of challenge
    -   View challenge details
    -   Accept or decline within time limit (24 hours)
    -   Declining too many challenges affects reputation score

#### One-on-One Gameplay

-   **Synchronized Start**: Both players start simultaneously
-   **Same Questions**: Both players answer identical questions in same order
-   **Real-time Comparison**: See opponent's progress (not answers)
-   **Private Chat**: Chat with opponent during game
-   **Live Score Tracker**: Side-by-side score comparison

#### Match Results

-   Winner determined by:
    1. Higher total score
    2. If tied, faster average response time
    3. If still tied, fewer incorrect answers
-   Match statistics:
    -   Final scores
    -   Question-by-question breakdown
    -   Time comparison per question
    -   Head-to-head record update

#### Challenge History

-   Win/loss record vs each opponent
-   Personal best scores in 1v1
-   Most challenging opponents
-   Winning streaks
-   Challenge statistics (sent, received, accepted, declined)

### 9. Daily & Weekly Challenges

#### Daily Challenge

-   **Schedule**: New challenge every day at midnight UTC
-   **Duration**: 24 hours to complete
-   **Format**: 10 questions, mixed categories (or category of the day)
-   **Difficulty**: Rotates (Easy Monday, Medium Tuesday, etc.)
-   **Participation**: One attempt per day per player
-   **Rewards**: Daily challenge points + bonus for top performers

#### Daily Leaderboard

-   Resets every midnight UTC
-   Top 10 players displayed prominently
-   Perfect score bonus (100 extra points)
-   Streak bonuses for consecutive days
-   Rankings by:
    -   Total score
    -   Completion time
    -   Age group
    -   Gender

#### Weekly Challenge

-   **Schedule**: New challenge every Monday at 00:00 UTC
-   **Duration**: 7 days to complete
-   **Format**: 50 questions, comprehensive coverage
-   **Difficulty**: Mixed (progressive difficulty)
-   **Participation**: One attempt per week per player
-   **Rewards**: Weekly championship points + prizes for top 3

#### Weekly Leaderboard

-   Resets every Monday
-   Top 50 players displayed
-   Grand prizes for:
    -   1st place: Champion badge + bonus points
    -   2nd place: Runner-up badge + bonus points
    -   3rd place: Bronze badge + bonus points
-   Rankings by:
    -   Total score
    -   Overall ranking
    -   Category-specific performance
    -   Age bracket
    -   Gender

#### Challenge Features

-   **Streaks**: Track consecutive daily/weekly participation
-   **Achievements**: Unlock badges for milestones
-   **Notifications**: Reminders for daily/weekly challenges
-   **Preview**: View upcoming challenge themes
-   **Practice Mode**: Replay past daily/weekly challenges (no leaderboard)

### 10. Enhanced User Demographics

#### Required Profile Fields

-   **Date of Birth**

    -   Required for age verification
    -   Used for age-group leaderboards
    -   Privacy-protected (only age displayed)

-   **Sex/Gender**
    -   Male
    -   Female
    -   Other
    -   Prefer not to say
    -   Used for demographic analytics
    -   Optional gender-based leaderboards

#### Age Groups

-   **Youth**: 13-17 years
-   **Young Adult**: 18-25 years
-   **Adult**: 26-40 years
-   **Senior**: 41-60 years
-   **Veteran**: 60+ years

#### Demographic Features

-   **Age-Specific Leaderboards**: Rankings within age groups
-   **Gender-Based Rankings**: Optional segmented leaderboards
-   **Demographic Analytics**: Admin insights on player distribution
-   **Targeted Content**: Age-appropriate question recommendations
-   **Privacy Controls**: Users can opt out of demographic leaderboards

### 11. AI-Powered Question Generation

#### AI Integration Overview

The platform leverages artificial intelligence to generate unlimited, high-quality trivia questions across all categories and difficulty levels, ensuring fresh content and scalability.

#### AI Capabilities

##### 1. Question Generation

-   **Category-Specific Questions**

    -   AI trained on vast knowledge bases per category
    -   Generates contextually relevant questions
    -   Ensures factual accuracy through validation

-   **Difficulty Calibration**

    -   AI analyzes question complexity
    -   Assigns appropriate difficulty levels
    -   Generates questions matching target difficulty

-   **Format Variety**
    -   Multiple choice (4 options)
    -   True/False
    -   Fill in the blank (auto-generated options)
    -   Number-based questions

##### 2. Quality Assurance

-   **Fact Checking**

    -   Cross-reference with reliable sources
    -   Wikipedia, encyclopedia APIs
    -   Academic databases
    -   Real-time fact verification

-   **Duplicate Detection**

    -   Check against existing question database
    -   Semantic similarity analysis
    -   Prevent near-duplicate questions

-   **Difficulty Validation**
    -   Test questions with sample player base
    -   Adjust difficulty based on answer patterns
    -   Machine learning for accuracy improvement

##### 3. AI Question Workflow

```
1. Admin selects category + difficulty
2. AI generates 10-20 question candidates
3. System performs fact-checking
4. Admin reviews and approves questions
5. Approved questions added to database
6. AI learns from approval patterns
```

##### 4. Bulk Generation

-   Generate hundreds of questions at once
-   Category-balanced generation
-   Difficulty-stratified generation
-   Automatic scheduling for games
-   Review queue for admin approval

##### 5. Adaptive Learning

-   **Player Performance Analysis**

    -   Track which AI questions are answered correctly
    -   Identify questions that are too easy/hard
    -   Refine generation algorithms

-   **Continuous Improvement**
    -   Learn from admin edits
    -   Improve question quality over time
    -   Adapt to player preferences

#### AI Models & APIs

-   **Primary Model**: OpenAI GPT-4 / Claude 3
-   **Fact-Checking**: Google Fact Check API, Wikipedia API
-   **Validation**: Custom ML models for quality scoring
-   **Backup**: Multiple AI providers for redundancy

#### Admin AI Tools

-   **AI Question Generator Dashboard**

    -   Set category, difficulty, quantity
    -   Preview generated questions
    -   Batch approve/reject
    -   Edit before approval

-   **AI Suggestions**

    -   Suggest improvements to existing questions
    -   Identify outdated questions
    -   Recommend question variations

-   **Auto-Scheduling**
    -   AI suggests optimal question distribution
    -   Balanced category mix for games
    -   Difficulty progression algorithms

#### Safety & Accuracy

-   **Content Filters**

    -   Remove inappropriate content
    -   Cultural sensitivity checks
    -   Bias detection and mitigation

-   **Human Oversight**

    -   Admin approval required for AI questions
    -   Flagging system for poor quality
    -   Regular quality audits

-   **Version Control**
    -   Track AI-generated vs human-created questions
    -   Performance metrics per source
    -   Rollback capabilities

### 12. User Dashboard

#### Player Dashboard

-   **Active Game Section**

    -   Join active game button
    -   Current question countdown
    -   Live participant count

-   **Daily/Weekly Challenge Section**

    -   Today's daily challenge status
    -   Current weekly challenge progress
    -   Streak counter
    -   Time remaining

-   **One-on-One Challenges**

    -   Pending challenges received
    -   Active 1v1 matches
    -   Challenge history and record
    -   Quick challenge button

-   **Upcoming Games**

    -   List of scheduled public games
    -   Start times and details
    -   Category and difficulty filters
    -   Participation status

-   **Past Games**
    -   Game history (all modes)
    -   Personal scores
    -   Ranking in each game
    -   Option to review questions/answers

#### Statistics Panel

-   Total games played (by mode)
-   Total points earned
-   Average score
-   Best game performance
-   Current ranking (overall, daily, weekly)
-   Win/loss record in 1v1
-   Streak statistics
-   Category performance breakdown

### 13. Admin Dashboard

#### Overview Cards

-   Total users count
-   Active games count
-   Total questions in database
-   Recent activity summary

#### Game Management

-   Create new games
-   View all games (scheduled, active, completed)
-   Edit game settings
-   Assign questions to games
-   Schedule question display times
-   Cancel games
-   View game statistics

#### Question Management

-   Add single questions
-   Bulk upload via Excel
-   Edit questions
-   Delete questions (with safety checks)
-   View question usage in games
-   Search and filter

#### User Management

-   View all registered users
-   User statistics
-   Role assignment
-   Activity logs

#### Settings Management

-   Global game configuration
-   Default timing settings
-   System preferences
-   Feature toggles

---

## Technical Architecture

### Technology Stack

#### Frontend

-   **Framework**: Next.js 16 (App Router)
-   **Language**: TypeScript
-   **UI Library**: React 19
-   **Styling**: Tailwind CSS v4
-   **UI Components**: Radix UI primitives
-   **Form Handling**: React Hook Form + Zod validation
-   **State Management**: Zustand
-   **Data Fetching**: TanStack Query (React Query)
-   **Icons**: Lucide React
-   **Notifications**: Sonner (toast notifications)
-   **Charts**: Recharts (for analytics)

#### Backend

-   **Framework**: Next.js API Routes / Server Actions
-   **Runtime**: Node.js
-   **Authentication**: NextAuth.js v5 (beta)
-   **Database ORM**: Prisma 6.4.1
-   **Database**: PostgreSQL (Neon)
-   **File Processing**: XLSX (Excel import)
-   **AI Integration**: OpenAI API / Anthropic Claude API
-   **Real-time**: Polling / WebSocket (future)

#### Infrastructure

-   **Hosting**: Vercel (recommended)
-   **Database**: Neon PostgreSQL (serverless)
-   **Authentication Provider**: Google OAuth 2.0
-   **Analytics**: PostHog (optional)

### Database Schema

#### Core Models

1. **User**

    - Authentication data
    - Profile information (phone, profession, dateOfBirth, sex)
    - Role (ADMIN/PLAYER)
    - Relationships: accounts, sessions, responses, messages, sentChallenges, receivedChallenges

2. **Game**

    - Timing configuration
    - Status (SCHEDULED/ACTIVE/COMPLETED/CANCELLED)
    - Game type (PUBLIC/DAILY/WEEKLY/ONE_ON_ONE)
    - Category filter (optional)
    - Difficulty level (EASY/MEDIUM/HARD/EXPERT/MIXED)
    - Game settings (answer/result/interval times)
    - Relationships: gameQuestions, responses, messages

3. **Question**

    - Question text and options
    - Correct answer
    - Category (Sports, Science, History, etc.)
    - Difficulty level (Easy, Medium, Hard, Expert)
    - Source (HUMAN/AI_GENERATED)
    - AI metadata (if applicable)
    - Relationships: gameQuestions, responses

4. **GameQuestion**

    - Links questions to games
    - Display time scheduling
    - Question duration
    - Unique constraint: one question per game

5. **Response**

    - User answers
    - Time taken
    - Score calculation (with difficulty multiplier)
    - Unique constraint: one response per user per question per game

6. **Challenge** (New)

    - Challenger and opponent user IDs
    - Challenge status (PENDING/ACCEPTED/DECLINED/COMPLETED)
    - Game configuration (category, difficulty, question count)
    - Created timestamp
    - Expiry timestamp (24 hours)
    - Winner ID (after completion)
    - Relationships: challenger, opponent, game

7. **DailyChallenge** (New)

    - Date (unique per day)
    - Game reference
    - Category of the day
    - Difficulty
    - Participation count

8. **WeeklyChallenge** (New)

    - Week number and year
    - Game reference
    - Week start/end dates
    - Participation count

9. **Leaderboard** (New)

    - Type (OVERALL/DAILY/WEEKLY/AGE_GROUP/GENDER/CATEGORY)
    - Period identifier (date, week, month)
    - Rankings snapshot
    - Last updated timestamp

10. **ChatMessage**

    - Message content
    - Sender/recipient information
    - Game or challenge association
    - Timestamps

11. **GameSettings**

    - Global configuration
    - Default timing values
    - AI settings (API keys, model preferences)
    - System preferences

12. **AIQuestion** (New)
    - Generated question metadata
    - Model used
    - Generation timestamp
    - Approval status
    - Quality score
    - Admin who approved

#### Enums

-   **UserRole**: ADMIN, PLAYER
-   **GameStatus**: SCHEDULED, ACTIVE, COMPLETED, CANCELLED
-   **GameType**: PUBLIC, DAILY, WEEKLY, ONE_ON_ONE
-   **Difficulty**: EASY, MEDIUM, HARD, EXPERT, MIXED
-   **Category**: SPORTS, SCIENCE, HISTORY, GEOGRAPHY, ENTERTAINMENT, LITERATURE, TECHNOLOGY, ARTS, GENERAL
-   **Sex**: MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY
-   **ChallengeStatus**: PENDING, ACCEPTED, DECLINED, COMPLETED, EXPIRED
-   **QuestionSource**: HUMAN, AI_GENERATED

### Key Architectural Decisions

#### Server-Side Rendering (SSR)

-   Leverage Next.js App Router for SSR
-   Improve SEO and initial page load
-   Server Components for data fetching
-   Client Components for interactivity

#### Authentication Flow

-   NextAuth.js with Google Provider
-   JWT-based sessions
-   Middleware for route protection
-   Role-based authorization callbacks

#### Real-Time Updates

-   Server Actions for mutations
-   Polling for real-time game updates
-   Optimistic UI updates
-   Revalidation strategies

#### Scoring Algorithm

```typescript
function calculateScore(
	isCorrect: boolean,
	timeToAnswer: number,
	questionDuration: number
): number {
	if (!isCorrect) return 0;

	const baseScore = 10;
	const timeLeft = questionDuration - timeToAnswer;
	const timeBonus = Math.max(0, (timeLeft / questionDuration) * 10);

	return baseScore + timeBonus;
}
```

---

## User Flows

### 1. First-Time User Flow

```
1. User visits landing page
2. Clicks "Sign In with Google"
3. Authenticates with Google OAuth
4. Redirected to complete profile page
5. Enters phone number and profession
6. Submitted and redirected to dashboard
7. Views upcoming games and instructions
```

### 2. Joining and Playing a Game Flow

```
1. User logs into dashboard
2. Views active game or upcoming game
3. Clicks "Join Game" when game is active
4. Redirected to game interface
5. Waits for first question to appear
6. Question displays with countdown timer
7. Selects an answer
8. Submits answer
9. Views result (correct/incorrect + score)
10. Waits for next question
11. Repeats steps 6-10 for each question
12. Game ends, views final leaderboard
13. Can review game history
```

### 3. Admin Creating a Game Flow

```
1. Admin logs into admin dashboard
2. Navigates to "Games" section
3. Clicks "Create New Game"
4. Fills in game details:
   - Start date/time
   - End date/time
   - Answer time duration
   - Result time duration
   - Interval time between questions
5. Assigns questions to the game
6. Sets display time for each question
7. Reviews game configuration
8. Saves game (status: SCHEDULED)
9. Game appears in upcoming games list
```

### 4. Admin Managing Questions Flow

```
1. Admin navigates to "Questions" section
2. Options:
   a. Create Single Question:
      - Click "Add Question"
      - Enter question text
      - Add options (minimum 2)
      - Select correct answer
      - Save question

   b. Bulk Upload:
      - Click "Upload Excel"
      - Select formatted Excel file
      - System validates format
      - Questions imported
      - Confirmation message
3. Edit existing question:
   - Click question to view details
   - Click "Edit"
   - Modify fields
   - Save changes
4. Delete question:
   - Click question actions menu
   - Select "Delete"
   - Confirm deletion
   - System checks if used in games
   - Deletes if not in use
```

---

## Functional Requirements

### FR-1: Authentication

-   **FR-1.1**: System shall authenticate users via Google OAuth 2.0
-   **FR-1.2**: System shall create user accounts on first login
-   **FR-1.3**: System shall require profile completion (phone, profession)
-   **FR-1.4**: System shall maintain secure sessions using JWT
-   **FR-1.5**: System shall support role-based access (ADMIN/PLAYER)

### FR-2: Game Management

-   **FR-2.1**: Admins shall create games with custom timing configurations
-   **FR-2.2**: Admins shall assign questions to games
-   **FR-2.3**: System shall automatically transition games through lifecycle states
-   **FR-2.4**: System shall prevent game time overlaps
-   **FR-2.5**: Admins shall be able to cancel scheduled games
-   **FR-2.6**: System shall display game participant counts

### FR-3: Question Management

-   **FR-3.1**: Admins shall create questions with text, options, and correct answer
-   **FR-3.2**: System shall validate that correct answer is one of the options
-   **FR-3.3**: Admins shall bulk upload questions via Excel
-   **FR-3.4**: System shall prevent deletion of questions used in games
-   **FR-3.5**: Admins shall edit existing questions
-   **FR-3.6**: System shall display question usage statistics

### FR-4: Gameplay

-   **FR-4.1**: System shall display questions at scheduled times
-   **FR-4.2**: System shall enforce question time limits
-   **FR-4.3**: System shall calculate scores based on correctness and speed
-   **FR-4.4**: System shall prevent multiple answers to same question
-   **FR-4.5**: System shall display correct answers after submission
-   **FR-4.6**: System shall update leaderboards in real-time

### FR-5: Scoring

-   **FR-5.1**: Correct answers shall award 10 base points
-   **FR-5.2**: Speed bonus shall be calculated: (timeLeft/totalTime) × 10
-   **FR-5.3**: Incorrect answers shall award 0 points
-   **FR-5.4**: System shall track time-to-answer for each response
-   **FR-5.5**: System shall display score breakdown to users

### FR-6: Leaderboard

-   **FR-6.1**: System shall rank players by total score
-   **FR-6.2**: System shall update rankings after each question
-   **FR-6.3**: System shall display rank, name, avatar, and score
-   **FR-6.4**: System shall provide game-specific and global leaderboards
-   **FR-6.5**: System shall support time-based filtering (weekly, monthly, all-time)

### FR-7: Chat System

-   **FR-7.1**: Users shall send messages during active games
-   **FR-7.2**: System shall display sender name, avatar, and timestamp
-   **FR-7.3**: System shall persist chat messages in database
-   **FR-7.4**: System shall support real-time message delivery
-   **FR-7.5**: Users shall view chat history

### FR-8: Dashboard

-   **FR-8.1**: Players shall view active, upcoming, and past games
-   **FR-8.2**: Players shall view personal statistics
-   **FR-8.3**: Admins shall view system-wide statistics
-   **FR-8.4**: System shall display participation status
-   **FR-8.5**: Users shall access game history and results

### FR-9: Question Categories

-   **FR-9.1**: Questions shall be tagged with one or more categories
-   **FR-9.2**: System shall support 9+ predefined categories
-   **FR-9.3**: Players shall filter games by category
-   **FR-9.4**: System shall support mixed-category games
-   **FR-9.5**: Admin shall assign categories when creating questions
-   **FR-9.6**: System shall display category-specific leaderboards

### FR-10: Difficulty Levels

-   **FR-10.1**: Questions shall be assigned difficulty levels (Easy, Medium, Hard, Expert)
-   **FR-10.2**: Games shall support single or mixed difficulty
-   **FR-10.3**: Scoring shall apply difficulty multipliers (1.0x, 1.5x, 2.0x, 2.5x)
-   **FR-10.4**: Players shall filter games by difficulty
-   **FR-10.5**: System shall balance difficulty distribution in mixed games

### FR-11: One-on-One Challenges

-   **FR-11.1**: Players shall send challenges to other players
-   **FR-11.2**: Challenges shall include category, difficulty, and question count
-   **FR-11.3**: Challenges shall expire after 24 hours if not accepted
-   **FR-11.4**: System shall notify players of incoming challenges
-   **FR-11.5**: Both players shall answer identical questions simultaneously
-   **FR-11.6**: System shall determine winner by score, then time, then accuracy
-   **FR-11.7**: System shall track win/loss records for each player
-   **FR-11.8**: System shall support private chat during 1v1 matches

### FR-12: Daily & Weekly Challenges

-   **FR-12.1**: System shall create new daily challenge at midnight UTC
-   **FR-12.2**: System shall create new weekly challenge every Monday
-   **FR-12.3**: Daily challenges shall have 10 questions
-   **FR-12.4**: Weekly challenges shall have 50 questions
-   **FR-12.5**: System shall reset daily leaderboard at midnight
-   **FR-12.6**: System shall reset weekly leaderboard every Monday
-   **FR-12.7**: System shall track consecutive participation streaks
-   **FR-12.8**: System shall award bonus points for perfect scores
-   **FR-12.9**: Players shall have one attempt per challenge

### FR-13: User Demographics

-   **FR-13.1**: Users shall provide date of birth during profile completion
-   **FR-13.2**: Users shall select sex/gender during profile completion
-   **FR-13.3**: System shall calculate age from date of birth
-   **FR-13.4**: System shall group users into age brackets
-   **FR-13.5**: System shall provide age-group leaderboards
-   **FR-13.6**: System shall provide gender-based leaderboards (optional)
-   **FR-13.7**: Users shall be able to opt out of demographic leaderboards
-   **FR-13.8**: System shall protect birthdate privacy (only age displayed)

### FR-14: AI Question Generation

-   **FR-14.1**: System shall integrate with AI APIs (OpenAI/Claude)
-   **FR-14.2**: Admins shall generate questions via AI with category/difficulty parameters
-   **FR-14.3**: System shall validate AI-generated questions for accuracy
-   **FR-14.4**: System shall detect duplicate and near-duplicate questions
-   **FR-14.5**: AI questions shall require admin approval before use
-   **FR-14.6**: System shall track AI-generated vs human-created questions
-   **FR-14.7**: System shall learn from admin edits to improve generation
-   **FR-14.8**: System shall support bulk AI question generation
-   **FR-14.9**: System shall perform fact-checking on AI questions
-   **FR-14.10**: System shall flag inappropriate or biased content

---

## Non-Functional Requirements

### NFR-1: Performance

-   **NFR-1.1**: Page load time shall be < 3 seconds
-   **NFR-1.2**: API response time shall be < 500ms
-   **NFR-1.3**: Real-time updates shall occur within 2 seconds
-   **NFR-1.4**: System shall support 1000+ concurrent users
-   **NFR-1.5**: Database queries shall be optimized with proper indexing

### NFR-2: Security

-   **NFR-2.1**: All data transmission shall use HTTPS
-   **NFR-2.2**: User passwords shall not be stored (OAuth only)
-   **NFR-2.3**: JWT tokens shall expire after 30 days
-   **NFR-2.4**: API endpoints shall validate user authentication
-   **NFR-2.5**: Admin routes shall verify user role
-   **NFR-2.6**: SQL injection prevention via Prisma ORM

### NFR-3: Scalability

-   **NFR-3.1**: System shall support horizontal scaling
-   **NFR-3.2**: Database shall use connection pooling
-   **NFR-3.3**: Static assets shall be cached
-   **NFR-3.4**: System shall handle multiple concurrent games
-   **NFR-3.5**: Question database shall support 10,000+ questions

### NFR-4: Availability

-   **NFR-4.1**: System uptime shall be > 99.5%
-   **NFR-4.2**: Scheduled maintenance shall be during off-peak hours
-   **NFR-4.3**: System shall have automated health checks
-   **NFR-4.4**: Database backups shall occur daily
-   **NFR-4.5**: Error recovery shall be automatic where possible

### NFR-5: Usability

-   **NFR-5.1**: UI shall be responsive (mobile, tablet, desktop)
-   **NFR-5.2**: Interface shall follow accessibility standards (WCAG 2.1)
-   **NFR-5.3**: Error messages shall be clear and actionable
-   **NFR-5.4**: Navigation shall be intuitive
-   **NFR-5.5**: Loading states shall be clearly indicated

### NFR-6: Maintainability

-   **NFR-6.1**: Code shall follow TypeScript best practices
-   **NFR-6.2**: Components shall be reusable and modular
-   **NFR-6.3**: Database migrations shall be versioned
-   **NFR-6.4**: API shall be documented
-   **NFR-6.5**: Logging shall capture errors and important events

---

## Success Metrics

### User Engagement

-   **Daily Active Users (DAU)**: Target 100+ users/day
-   **Monthly Active Users (MAU)**: Target 500+ users/month
-   **Average Session Duration**: Target 15+ minutes
-   **Games per User per Week**: Target 5+ games (all modes combined)
-   **Daily Challenge Participation**: Target 60%+ of active users
-   **Weekly Challenge Participation**: Target 40%+ of active users
-   **1v1 Challenges Sent**: Target 2+ per active user per week
-   **Challenge Acceptance Rate**: Target 70%+
-   **Chat Messages per Game**: Target 20+ messages

### Game Performance

-   **Game Completion Rate**: Target 70%+ (all modes)
-   **Question Answer Rate**: Target 80%+
-   **Average Response Time**: Monitor < 30 seconds
-   **Concurrent Game Participation**: Track peak concurrent users
-   **Daily Challenge Completion**: Target 85%+
-   **Weekly Challenge Completion**: Target 60%+
-   **1v1 Match Completion**: Target 90%+

### Platform Health

-   **Page Load Time**: Monitor < 3 seconds
-   **API Response Time**: Monitor < 500ms
-   **AI Generation Success Rate**: Target 95%+
-   **AI Question Approval Rate**: Monitor quality trend
-   **Error Rate**: Target < 1%
-   **Uptime**: Target 99.5%+

### User Retention

-   **Day 1 Retention**: Target 60%+
-   **Week 1 Retention**: Target 40%+
-   **Month 1 Retention**: Target 25%+
-   **Daily Streak Retention**: Target 30%+ with 7+ day streaks
-   **Weekly Streak Retention**: Target 20%+ with 4+ week streaks

### Content Quality

-   **AI Questions Generated**: Track monthly volume
-   **AI Question Approval Rate**: Target 80%+
-   **Question Accuracy**: Target 98%+ (no factual errors reported)
-   **Category Distribution**: Monitor balance across all categories
-   **Difficulty Distribution**: Monitor balance across all levels

### Competitive Features

-   **1v1 Win Rate Distribution**: Monitor fairness (no player dominates)
-   **Leaderboard Churn**: Track top 10 changes daily/weekly
-   **Perfect Score Rate**: Monitor by difficulty level
-   **Category Preferences**: Track most popular categories
-   **Month 1 Retention**: Target 25%+

### Admin Efficiency

-   **Time to Create Game**: Target < 5 minutes
-   **Questions Created per Week**: Track trend
-   **Bulk Upload Success Rate**: Target 95%+

---

## Future Enhancements

### Phase 2 Features (Implemented in v2.0)

1. **✅ One-on-One Challenges** - IMPLEMENTED

    - Player vs player battles
    - Custom challenge configurations
    - Win/loss tracking

2. **✅ Daily & Weekly Challenges** - IMPLEMENTED

    - Recurring challenge modes
    - Dedicated leaderboards
    - Streak tracking

3. **✅ Question Categories** - IMPLEMENTED

    - 9+ topic categories
    - Category-based filtering
    - Mixed or specific category games

4. **✅ Difficulty Levels** - IMPLEMENTED

    - Easy, Medium, Hard, Expert
    - Difficulty-based scoring multipliers
    - Difficulty filtering

5. **✅ Enhanced Demographics** - IMPLEMENTED

    - Age and gender tracking
    - Demographic-based leaderboards
    - Privacy controls

6. **✅ AI Question Generation** - IMPLEMENTED
    - OpenAI/Claude integration
    - Automated question creation
    - Quality assurance and approval workflow

### Phase 3 Features

1. **Advanced AI Capabilities**

    - AI-powered question difficulty calibration
    - Personalized question recommendations
    - Adaptive learning based on player performance
    - Auto-generation of question variations

2. **Private Games**

    - Invite-only games
    - Custom participant lists
    - Private leaderboards
    - Corporate/team events

3. **Achievements & Badges**

    - 50+ milestone achievements
    - Rare badge collection
    - Achievement-based rewards
    - Profile showcase

4. **Social Features**

    - Friend system with requests
    - Private messaging between players
    - User profiles with detailed stats
    - Activity feeds
    - Player following

5. **Mobile Apps**
    - Native iOS application
    - Native Android application
    - Push notifications for challenges
    - Offline practice mode

### Phase 4 Features

1. **Team-Based Games**

    - Create teams (2-10 players)
    - Team vs team competitions
    - Team leaderboards
    - Team achievements

2. **Advanced Analytics**

    - Detailed player insights dashboard
    - Question performance analytics
    - Predictive difficulty modeling
    - Performance trends over time
    - Category strength analysis

3. **Tournament System**

    - Bracket-style tournaments
    - Swiss-system tournaments
    - Automatic tournament scheduling
    - Prize pools and rewards

4. **Monetization**

    - Premium subscriptions
    - Ad-free experience
    - Exclusive questions and categories
    - Early access to features
    - Custom profile themes

5. **Content Creation**

    - User-submitted questions
    - Community voting system
    - Question quality ratings
    - Creator rewards program

6. **Live Events**
    - Host-led live trivia
    - Video streaming integration
    - Live commentary
    - Special event games
    - Celebrity host features

### Phase 5 Features

1. **Internationalization**

    - Multi-language support (10+ languages)
    - Region-specific questions
    - Global time zone optimization
    - Currency localization
    - Cultural adaptations

2. **Enterprise Features**

    - White-label solutions
    - Corporate training integration
    - Custom branding
    - API access for integrations
    - Analytics exports

3. **Advanced Gamification**

    - Experience points (XP) system
    - Player levels and ranks
    - Seasonal rankings
    - Title unlocks
    - Cosmetic customizations

4. **Educational Integration**

    - School/university partnerships
    - Curriculum-aligned questions
    - Teacher admin panels
    - Student progress tracking
    - Educational certifications
    - Tournament brackets
    - Head-to-head challenges

5. **Monetization**

    - Premium subscriptions
    - Ad-free experience
    - Exclusive games

6. **Content Creation**

    - User-submitted questions
    - Community moderation
    - Question quality ratings

7. **Internationalization**
    - Multi-language support
    - Region-specific questions
    - Time zone optimization

### Phase 4 Features

1. **AI Integration**

    - AI-generated questions
    - Difficulty adjustment
    - Personalized recommendations

2. **Live Video**

    - Host-led games
    - Video announcements
    - Live commentary

3. **Integration APIs**
    - Third-party integrations
    - Embed widgets
    - External leaderboards

---

## Constraints & Assumptions

### Constraints

-   **Budget**: Limited initial budget requires cost-effective solutions
-   **Timeline**: MVP launch within 3 months
-   **Team Size**: Small development team (1-3 developers)
-   **Technology**: Must use Next.js and PostgreSQL
-   **Authentication**: Limited to Google OAuth initially

### Assumptions

-   Users have stable internet connections
-   Users access primarily via desktop/laptop browsers
-   Admin team is small (1-5 administrators)
-   Questions are primarily text-based
-   Games occur during peak hours (evenings/weekends)
-   Users are comfortable with Google authentication

---

## Risk Assessment

### Technical Risks

1. **Real-time Scaling**

    - Risk: High concurrent load during popular games
    - Mitigation: Load testing, CDN usage, database optimization

2. **Data Consistency**

    - Risk: Race conditions in scoring/leaderboards
    - Mitigation: Database transactions, unique constraints

3. **Third-Party Dependencies**
    - Risk: Google OAuth outages
    - Mitigation: Status monitoring, fallback messaging

### Product Risks

1. **User Adoption**

    - Risk: Low initial user engagement
    - Mitigation: Marketing strategy, beta testing, user feedback

2. **Content Quality**

    - Risk: Poor quality or duplicate questions
    - Mitigation: Review process, validation rules, admin training

3. **Timing Issues**
    - Risk: Time zone confusion for global users
    - Mitigation: Clear time displays, user timezone detection

---

## Glossary

-   **Game**: A scheduled trivia event with multiple questions
-   **Question**: A trivia item with multiple choice options
-   **Response**: A user's answer to a question
-   **GameQuestion**: The association between a question and a game
-   **Leaderboard**: Ranked list of player scores
-   **Speed Bonus**: Additional points awarded for quick answers
-   **Active Game**: A game currently in progress
-   **Scheduled Game**: A game planned for the future
-   **Completed Game**: A game that has finished
-   **Base Score**: Fixed points awarded for correct answer (10 points)

---

## Appendices

### A. Excel Upload Format

Questions can be bulk uploaded via Excel with the following structure:

| Column A | Column B | Column C | Column D | Column E | Column F |
| -------- | -------- | -------- | -------- | -------- | -------- |
| Question | Option1  | Option2  | Option3  | Option4  | Correct  |

**Example:**

```
What is the capital of France? | Paris | London | Berlin | Madrid | Paris
```

### B. API Endpoints (Reference)

Key server actions:

-   `createGame()` - Create new game
-   `updateGame()` - Update game details
-   `createQuestion()` - Create question
-   `updateQuestion()` - Update question
-   `deleteQuestion()` - Delete question
-   `getCurrentGame()` - Get active game
-   `submitAnswer()` - Submit response
-   `getLeaderboard()` - Get rankings

### C. Environment Variables

Required configuration:

```env
DATABASE_URL=postgresql://...
AUTH_URL=http://localhost:9754
NEXTAUTH_URL=http://localhost:9754
AUTH_SECRET=<random-secret>
NEXTAUTH_SECRET=<random-secret>
GOOGLE_CLIENT_ID=<google-oauth-id>
GOOGLE_CLIENT_SECRET=<google-oauth-secret>
```

---

## Document History

| Version | Date         | Author       | Changes                                                                                                                                                                    |
| ------- | ------------ | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.0     | Nov 17, 2025 | Product Team | Initial PRD creation                                                                                                                                                       |
| 2.0     | Nov 17, 2025 | Product Team | Major update: Added one-on-one challenges, daily/weekly challenges, question categories, difficulty levels, enhanced demographics, AI-powered question generation features |

---

## Approval

This document requires approval from:

-   [ ] Product Manager
-   [ ] Engineering Lead
-   [ ] Design Lead
-   [ ] Stakeholders

**Approved By:** **\*\*\*\***\_**\*\*\*\***
**Date:** **\*\*\*\***\_**\*\*\*\***

---

_End of Document_
