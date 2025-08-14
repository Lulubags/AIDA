# Aida AI Tutor - South African CAPS Curriculum Assistant

## Overview

Aida AI Tutor is a specialized educational platform designed for South African students following the CAPS (Curriculum and Assessment Policy Statement) curriculum. The application provides scaffolded learning assistance across multiple subjects for grades 1-12, with particular expertise in second language learning (Afrikaans). The system uses AI-powered conversation to guide students through discovery-based learning rather than providing direct answers, following Socratic teaching methodology.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack Query for server state and React hooks for local state
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript for type safety
- **API Design**: RESTful endpoints with proper error handling
- **File Processing**: Multer for handling curriculum document uploads
- **Session Management**: In-memory storage with database fallback support

### Database Strategy
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: PostgreSQL-compatible schema defined in shared directory
- **Tables**: Sessions, messages, and curriculum documents with proper relationships
- **Migrations**: Drizzle-kit for schema management

### AI Integration
- **Provider**: OpenAI GPT-4o for conversational AI
- **Teaching Methodology**: Scaffolded learning with Socratic questioning
- **Context Awareness**: Grade and subject-specific responses using uploaded curriculum documents
- **Media Support**: Vision capabilities for image analysis and educational content

### Payment Processing
- **Gateway**: PayFast integration for South African market
- **Currency**: ZAR (South African Rand) pricing
- **Plans**: Multiple subscription tiers with monthly/annual options
- **Security**: Signature verification and webhook handling for payment confirmation

### Theme System
- **Customization**: Dynamic CSS variable system for colors and typography
- **Presets**: Built-in theme options including South African-inspired color schemes
- **Persistence**: Local storage for user preferences
- **Responsive**: Mobile-first design with adaptive layouts

### Content Management
- **Curriculum Upload**: Support for PDF, DOC, DOCX, and TXT files
- **Text Extraction**: Automated content processing for AI integration
- **Media Handling**: Image and video upload with thumbnail generation
- **File Organization**: Grade and subject-based categorization

### Deployment Options
- **Development**: Local development with Vite dev server
- **Production**: Multiple deployment strategies (VPS, Vercel, Railway)
- **WordPress Integration**: Complete plugin system for website embedding
- **Environment Configuration**: Comprehensive environment variable management

## External Dependencies

### AI Services
- **OpenAI API**: GPT-4o model for conversational AI and image analysis
- **Usage**: Chat completion, curriculum-aware responses, media analysis

### Payment Gateway
- **PayFast**: South African payment processor
- **Integration**: Merchant account, API keys, webhook endpoints
- **Security**: Passphrase and signature verification

### Cloud Storage
- **Local Files**: Uploaded media and curriculum documents stored locally
- **File Processing**: Server-side text extraction and thumbnail generation

### Database
- **PostgreSQL**: Primary database for production (configurable via Drizzle)
- **Connection**: DATABASE_URL environment variable
- **Backup**: In-memory fallback for development

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production
- **Drizzle Kit**: Database schema management and migrations