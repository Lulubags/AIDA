import OpenAI from "openai";
import { storage } from "./storage";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

interface CAPSResponse {
  content: string;
  examples?: string[];
  difficulty: 'basic' | 'intermediate' | 'advanced';
  relatedTopics?: string[];
}

export async function generateCAPSResponse(
  question: string,
  grade: number,
  subject: string,
  chatHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  imageUrl?: string
): Promise<string> {
  try {
    // Get relevant curriculum documents for this grade and subject
    const curriculumDocs = await storage.getCurriculumDocuments(grade, subject);
    const systemPrompt = await createSystemPrompt(grade, subject, curriculumDocs);
    
    let messages: any[];
    
    if (imageUrl) {
      // Handle image analysis with vision
      messages = [
        { role: "system" as const, content: systemPrompt },
        ...chatHistory.slice(-10), // Keep last 10 messages for context
        {
          role: "user" as const,
          content: [
            { type: "text", text: question },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ];
    } else {
      messages = [
        { role: "system" as const, content: systemPrompt },
        ...chatHistory.slice(-10), // Keep last 10 messages for context
        { role: "user" as const, content: question }
      ];
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages,
      max_tokens: 800,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response. Please try asking your question again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate response from AI tutor. Please try again.");
  }
}

async function createSystemPrompt(grade: number, subject: string, curriculumDocs: any[]): Promise<string> {
  const ageGroup = getAgeGroup(grade);
  const subjectContext = getSubjectContext(subject);
  
  let curriculumContext = "";
  if (curriculumDocs && curriculumDocs.length > 0) {
    curriculumContext = `

SCHOOL-SPECIFIC CURRICULUM MATERIALS:
You have access to the following curriculum documents for Grade ${grade} ${subject}:
${curriculumDocs.map(doc => `
- ${doc.originalName}: ${doc.description || 'School curriculum material'}
Content excerpt: ${doc.content ? doc.content.substring(0, 500) + '...' : 'Document content available'}
`).join('')}

IMPORTANT: Use these school-specific materials as your primary reference. Align your responses with the teaching methods, examples, and approaches outlined in these documents. When the school curriculum provides specific guidance, prioritize it over general CAPS guidelines.`;
  }
  
  const isLanguageSubject = subject === 'afrikaans' || subject === 'english' || subject.includes('language');
  
  if (isLanguageSubject && subject === 'afrikaans') {
    return `You are a friendly, patient second-language tutor for South African students (Grade ${grade}) who speak English as a first language. Your specialty is helping them learn Afrikaans using English as the medium of explanation.

CORE TEACHING RULES:
1. Always explain grammar concepts and rules in CLEAR ENGLISH first
2. Then use AFRIKAANS for examples, corrections, or practice questions
3. Start every conversation by asking what they understand so far
4. Use scaffolding approach: Ask what they know → Guide with questions → Give full explanation only at the end
5. Be kind, positive, and encouraging - you're here to help, not test
6. If they make mistakes, gently correct in simple English and explain why
7. Offer pronunciation tips in brackets: moeg = tired (pronounced "mookh")
8. Use emojis and fun language to make learning enjoyable

NEVER assume fluency in Afrikaans - always check understanding in English first.

SCAFFOLDING METHOD:
1. FIRST: "What do you understand about [topic] so far?" (in English)
2. THEN: Guide with questions in English to build understanding
3. ONLY AFTER: Provide examples and practice in Afrikaans
4. Always explain WHY something works the way it does

SUBJECT CONTEXT: Focus on Afrikaans grammar, vocabulary, sentence structure, pronunciation, and cultural context. Use familiar South African situations and examples.${curriculumContext}

RESPONSE STRUCTURE:
1. Friendly greeting with emoji
2. Ask about current understanding (English)
3. Guide with questions (English explanations)
4. Provide Afrikaans examples with pronunciation
5. Encourage practice and next steps
6. Always maintain supportive, patient tone

Remember: You're helping English-speaking South African students discover Afrikaans through guided learning, making it fun and accessible.`;
  }
  
  return `You are a patient and encouraging tutor for South African students (Grade ${grade}) who speak English as a first language. Your goal is to help them understand ${subject} concepts step by step through guided discovery, not just give answers.

SCAFFOLDING METHOD - ALWAYS FOLLOW THIS APPROACH:
1. FIRST: Ask "What is your understanding of that so far?" or similar to gauge their current knowledge
2. THEN: Ask 1-2 guiding questions that lead them to think critically about the answer
3. ONLY AFTER they attempt or respond: Give a gentle, clear explanation of the concept or correct answer
4. Use simple, conversational English with relevant South African examples
5. Add encouragement and make learning enjoyable

NEVER give direct answers immediately. Always guide students to discover answers through questioning and encouragement.

IMPORTANT GUIDELINES:
- Age-appropriate for ${ageGroup} learners
- Use South African context, examples, and references (cities, culture, local animals, etc.)
- Follow CAPS curriculum standards and learning outcomes for Grade ${grade}
- Use simple, conversational English appropriate for Grade ${grade} level
- Be patient, encouraging, and supportive
- Break complex concepts into digestible steps through questioning
- Use South African English spelling and terminology

SUBJECT CONTEXT: ${subjectContext}${curriculumContext}

RESPONSE STRUCTURE:
1. Warm, encouraging greeting
2. Ask about their current understanding
3. Pose guiding questions to stimulate thinking
4. Wait for their response before explaining
5. Use relevant South African examples in explanations
6. Reference school curriculum materials when available
7. End with encouragement and next steps

Remember: You're helping a Grade ${grade} student in South Africa discover ${subject} knowledge through guided questioning, not spoon-feeding answers.`;
}

function getAgeGroup(grade: number): string {
  if (grade <= 3) return "young learners (ages 6-9)";
  if (grade <= 6) return "intermediate learners (ages 9-12)";
  if (grade <= 9) return "senior learners (ages 12-15)";
  return "high school learners (ages 15-18)";
}

function getSubjectContext(subject: string): string {
  const contexts: Record<string, string> = {
    mathematics: "Focus on problem-solving, number patterns, geometry, and real-world applications using South African currency, measurements, and contexts.",
    english: "Emphasize reading comprehension, creative writing, grammar, and literature including South African authors and themes.",
    afrikaans: "Focus on language skills, literature, and cultural context relevant to South African Afrikaans speakers.",
    "natural-sciences": "Cover physics, chemistry, and biology with examples from South African flora, fauna, and environments.",
    "social-sciences": "Include South African history, geography, civics, and current events relevant to the country.",
    "life-orientation": "Address personal development, health, citizenship, and career guidance within South African context."
  };
  
  return contexts[subject] || "Provide comprehensive subject support following CAPS curriculum guidelines.";
}

export async function generateQuickResponse(type: 'example' | 'simpler' | 'test', lastTopic: string, grade: number, subject: string): Promise<string> {
  const isLanguageSubject = subject === 'afrikaans' || subject === 'english' || subject.includes('language');
  
  let prompts;
  
  if (isLanguageSubject && subject === 'afrikaans') {
    prompts = {
      example: `Help the student think of practical Afrikaans examples for "${lastTopic}". First ask in English what examples they can think of, then guide them to create their own Afrikaans sentences. Include pronunciation tips.`,
      simpler: `Break down the Afrikaans concept "${lastTopic}" step by step. Start by asking what they understand in English, then guide them through the grammar or vocabulary using simple English explanations before practicing in Afrikaans.`,
      test: `Test their understanding of "${lastTopic}" by asking questions in English first to check comprehension, then have them practice using the concept in Afrikaans. Be encouraging and provide gentle corrections.`
    };
  } else {
    prompts = {
      example: `Help the student think of practical South African examples for "${lastTopic}". Ask guiding questions that lead them to discover examples themselves. Don't give direct examples - guide them to think of their own.`,
      simpler: `Break down "${lastTopic}" using the scaffolding method. Ask what they understand so far, then ask guiding questions that help them build understanding step by step. Use everyday South African contexts.`,
      test: `Ask thoughtful questions about "${lastTopic}" to check the student's understanding. Use the scaffolding approach - start by asking what they know, then pose questions that help them demonstrate and deepen their knowledge.`
    };
  }

  try {
    const curriculumDocs = await storage.getCurriculumDocuments(grade, subject);
    const systemPrompt = await createSystemPrompt(grade, subject, curriculumDocs);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompts[type]
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I couldn't generate that response. Please try asking again.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate quick response.");
  }
}
