# Next.js Quiz App

A Next.js application for creating and managing quizzes. Users can log in, create quizzes, take quizzes, and see their results.

## Technologies

This app is built using the following technologies:
- **Next.js**: React framework for server-side rendering and static site generation.
- **Supabase**: Backend-as-a-Service (BaaS) for authentication and database management.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Font Awesome**: For icons.
- **React Context API**: For managing language translations across the app.

## Setup Instructions

1. **Clone the Repository**

   First, clone the repository to your local machine:

   ```bash
   git clone https://github.com/FairuzLQ/quiz-maker.git

2. **Clone the Repository**

   Navigate into the project directory and install the dependencies:

   ```bash
   cd next-quiz-app
   npm install
   
3. **Set Up Environment Variables**
   Set up a .env.local file for Supabase and other environment variables.

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=supabase-url //ATTACHED ON EMAIL
   NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase-anon-key //ATTACHED ON EMAIL

4. **Running the Application**
   Once everything is set up, you can run the app locally:

   ```bash
   npm run dev
