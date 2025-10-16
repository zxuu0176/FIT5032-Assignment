<template>
  <div class="about-page">
    <div class="container py-4">
      <div class="row">
        <div class="col-12">
          <div class="text-center mb-4">
            <h1 class="h3 mb-2">About Our Basketball Programs</h1>
            <p class="text-muted">
              Professional basketball training for international students
            </p>
          </div>

          <!-- AI Assistant Section -->
          <div class="card mb-4">
            <div class="card-header bg-light">
              <h5 class="mb-0">&#129302; Program Assistant</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <label class="form-label small text-muted">Ask about our programs:</label>
                <textarea
                  v-model="userQuestion"
                  class="form-control form-control-sm"
                  rows="2"
                  placeholder="What program is best for beginners? What's included in the fees?"
                  :disabled="loading"
                ></textarea>
              </div>

              <div class="d-flex gap-2 mb-3">
                <button
                  @click="askGemini"
                  class="btn btn-primary btn-sm"
                  :disabled="!userQuestion.trim() || loading"
                >
                  {{ loading ? '...' : 'Ask' }}
                </button>
                <button
                  @click="clearChat"
                  class="btn btn-outline-secondary btn-sm"
                  :disabled="loading"
                >
                  Clear
                </button>
              </div>

              <!-- Quick Questions -->
              <div class="mb-3">
                <small class="text-muted">Quick questions:</small>
                <div class="d-flex flex-wrap gap-1 mt-1">
                  <button
                    v-for="question in quickQuestions"
                    :key="question"
                    @click="setQuickQuestion(question)"
                    class="btn btn-outline-primary btn-xs"
                    :disabled="loading"
                  >
                    {{ question }}
                  </button>
                </div>
              </div>

              <!-- AI Response -->
              <div v-if="aiResponse" class="ai-response p-3 bg-light rounded small">
                <strong class="text-primary">Response:</strong>
                <div class="mt-1" v-html="formatResponse(aiResponse)"></div>
                <small class="text-muted mt-2 d-block">
                  AI-generated response
                </small>
              </div>

              <!-- Loading Indicator -->
              <div v-if="loading" class="text-center py-2">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
                <small class="text-muted d-block mt-1">Thinking...</small>
              </div>
            </div>
          </div>

          <!-- Program Information -->
          <div class="row mb-4">
            <div class="col-md-6 mb-3">
              <div class="card h-100">
                <div class="card-body">
                  <h6 class="card-title">Our Mission</h6>
                  <p class="card-text small">
                    Provide quality basketball training while fostering cultural exchange
                    and building friendships through sports.
                  </p>
                </div>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="card h-100">
                <div class="card-body">
                  <h6 class="card-title">Program Features</h6>
                  <ul class="list-unstyled small mb-0">
                    <li class="mb-1">&#10004; Professional coaching</li>
                    <li class="mb-1">&#10004; Multi-level programs</li>
                    <li class="mb-1">&#10004; Cultural activities</li>
                    <li class="mb-1">&#10004; Equipment provided</li>
                    <li>&#10004; Flexible scheduling</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Features Grid -->
          <div class="card">
            <div class="card-body">
              <h6 class="text-center mb-3">Program Benefits</h6>
              <div class="row">
                <div class="col-md-4 text-center mb-3">
                  <div class="feature-icon">&#127936;</div>
                  <h6 class="small">Skill Development</h6>
                  <p class="text-muted small mb-0">Basics to advanced techniques</p>
                </div>
                <div class="col-md-4 text-center mb-3">
                  <div class="feature-icon">&#127757;</div>
                  <h6 class="small">Cultural Exchange</h6>
                  <p class="text-muted small mb-0">Global student community</p>
                </div>
                <div class="col-md-4 text-center mb-3">
                  <div class="feature-icon">&#9202;</div>
                  <h6 class="small">Flexible Schedule</h6>
                  <p class="text-muted small mb-0">Fit your timetable</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Gemini API configuration
const GEMINI_API_KEY = 'AIzaSyCeuH3OjlSUjA9N0YyHPU4yLA7LVHqCLeg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// Reactive data
const userQuestion = ref('');
const aiResponse = ref('');
const loading = ref(false);
const error = ref('');

// Quick questions for users
const quickQuestions = ref([
  "Beginner program?",
  "Program costs?",
  "Required equipment?",
  "Age requirements?",
  "No experience needed?"
]);

// Context for the AI to understand our programs
const systemContext = `
You are a helpful assistant for a basketball program designed for international students.
Our programs include:

1. Beginner International League - $150 for 12 weeks, Saturdays 10AM-12PM
2. Intermediate Skills Program - $220 for 16 weeks, Tues/Thurs 6PM-8PM
3. Competitive League - $350 for 6 months, 3 times per week
4. Cultural Exchange Program - $120 for 8 weeks, Sundays 2PM-4PM

All programs include equipment and are located at University facilities.
Coaches are professional and experienced with international students.

Provide friendly, helpful responses and encourage students to join our programs.
If you don't know something, suggest they contact us for more details.
`;

// Ask Gemini AI
const askGemini = async () => {
  if (!userQuestion.value.trim()) return;

  loading.value = true;
  error.value = '';
  aiResponse.value = '';

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `${systemContext}\n\nUser Question: ${userQuestion.value}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      aiResponse.value = data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Unexpected response format from API');
    }

  } catch (err) {
    console.error('Gemini API error:', err);
    error.value = `Sorry, I encountered an error: ${err.message}. Please try again later.`;
  } finally {
    loading.value = false;
  }
};

// Set quick question
const setQuickQuestion = (question) => {
  userQuestion.value = question;
};

// Clear chat
const clearChat = () => {
  userQuestion.value = '';
  aiResponse.value = '';
  error.value = '';
};

// Format response with basic formatting
const formatResponse = (text) => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
};
</script>

<style scoped>
.about-page {
  background-color: #f8f9fa;
  min-height: 100vh;
}

.card {
  border: 1px solid #dee2e6;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa !important;
  border-bottom: 1px solid #dee2e6;
}

.feature-icon {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.btn-xs {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.ai-response {
  border-left: 3px solid #007bff;
  background-color: #f8f9fa;
}

.form-control-sm {
  font-size: 0.875rem;
}

.small {
  font-size: 0.875rem;
}

.text-muted {
  color: #6c757d !important;
}

.bg-light {
  background-color: #f8f9fa !important;
}
</style>
