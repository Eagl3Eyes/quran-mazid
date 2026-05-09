# Quran Mazid

Quran Mazid is a modern, high-performance web application for reading, studying, and listening to the Holy Quran. Built with Next.js 15, React 19, and Express.

## Features

- **Read Quran**: Beautifully rendered Arabic text with English translations.
- **Listen**: High-quality audio recitations by various world-renowned reciters.
- **Search**: Fast and accurate search functionality across the entire Quran.
- **Responsive Design**: Optimized for mobile, tablet, and desktop viewing.
- **Dark Mode**: Eye-friendly dark mode support.
- **Navigation**: Easy navigation by Surah, Juz, or Page.

## Tech Stack

### Frontend
- **Next.js 15**: React framework for production.
- **React 19**: Modern UI library.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Framer Motion**: For smooth animations and transitions.
- **Lucide React**: For beautiful iconography.

### Backend
- **Node.js & Express**: Fast and minimalist web framework for the API.
- **Axios**: For making external API requests to Quran.com and Quranpedia.

## Getting Started

### Prerequisites
- Node.js (v18 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone [<repository-url>](https://github.com/Eagl3Eyes/quran-mazid.git)
   cd quranmazid
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

### Running the Application

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```

3. Open [http://localhost:5000](http://localhost:5000) in your browser to see the application.

## Project Structure

```text
├── backend/            # Express API server
│   ├── server.js       # Main server entry point
│   └── ...
├── frontend/           # Next.js application
│   ├── app/            # App router pages and layouts
│   ├── components/     # React components
│   ├── public/         # Static assets
│   └── ...
└── README.md           # Project documentation
```