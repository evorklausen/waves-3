import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

console.log('Starting server...');

const ax = axios.create({ maxRedirects: 0, timeout: 60000 });

const tryRequest = async (k, m, tries = 0) => {
  try {
    console.log('Sending request with message:', m[0].content);
    let r = await ax({
      method: 'post',
      url: 'https://api.llamaapi.com/api/generate',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': k,
      },
      data: {
        model: 'deepseek-v3',
        prompt: m[0].content,
        max_tokens: 800,
        temperature: 0.7,
        top_p: 0.95,
        n: 1,
        echo: false,
        stream: false
      },
    });
    console.log('Status:', r.status);
    console.log('Headers:', r.headers);
    console.log('Raw API Response:', JSON.stringify(r.data, null, 2));
    if (!r.data) return { content: "I didn't quite catch that, could you say that in a different way?" };
    if (r.data.choices && r.data.choices.length > 0) {
      return { content: r.data.choices[0].text.trim() };
    }
    if (r.data.generated_text) {
      return { content: r.data.generated_text.trim() };
    }
    return { content: "I didn't quite catch that, could you say that in a different way?" };
  } catch (e) {
    if (tries < 3 && (e.code === 'ECONNABORTED' || e.response?.status === 524)) {
      console.log(`Retry ${tries + 1}/3`);
      await new Promise(r => setTimeout(r, 1000));
      return tryRequest(k, m, tries + 1);
    }
    console.log('API Error:', e.response?.data || e.message);
    throw e;
  }
};

const doStuff = async (q, s) => {
  try {
    let k = q.headers.authorization;
    if (!k) throw new Error('No API key provided');
    k = k.replace('Bearer ', '');
    if (!k.startsWith('LA-')) k = 'LA-' + k;
    console.log('Got request with key format:', k.slice(0, 5) + '...');
    let r = await tryRequest(k, q.body.messages);
    return s.json(r);
  } catch (e) {
    console.log('Full error:', {
      status: e.response?.status,
      data: e.response?.data,
      message: e.message
    });
    if (e.response?.status === 401) {
      s.status(401).json({ error: 'Invalid API key' });
    } else if (e.response?.status === 429) {
      s.status(429).json({ error: 'Too many requests' });
    } else {
      s.status(500).json({
        error: e.message,
        details: JSON.stringify(e.response?.data) || 'Unknown error'
      });
    }
  }
};

function cleanResponse(content) {
  return content.replace(/```/g, '').trim();
}

// Simplified conversation history
const conversationHistories = new Map();
const MAX_HISTORY = 5;

function parseResponse(content, originalPrompt) {
  try {
    const codeMatch = content.match(/```(?:html|css|js|javascript)\n([\s\S]*?)```/i);
    let code = codeMatch ? codeMatch[1].trim() : '';
    
    const afterCodeText = content.split('```').pop().trim();
    
    const chatText = afterCodeText || `Here's the HTML code I generated based on your request: "${originalPrompt}". Let me know if you need any modifications!`;

    return {
      code: code,
      content: code,
      chatText: chatText
    };
  } catch (error) {
    console.error('Parse Response Error:', error);
    throw error;
  }
}

app.post('/api/chat', async (req, res) => {
  try {
    console.log('Received request:', req.body);
    const { prompt, lastCode, conversationId = Date.now().toString() } = req.body;
    const apiKey = process.env.LLAMA_API_KEY;
    
    if (!prompt) {
      return res.status(400).json({ 
        message: 'Prompt is required',
        content: '<div>No prompt provided</div>'
      });
    }

    let history = conversationHistories.get(conversationId) || [];
    console.log('Current history length:', history.length);

    const messages = [
      {
        role: 'system',
        content: `You are a helpful HTML code generator called Waves (made in estonia), and you model name is DeepSeek V3, a chinese chat model. Important rules:
1. ALWAYS wrap your code in \`\`\`html tags
2. For images, always use placeholder picsum images.
3. When modifying existing code, preserve the structure and only change what's needed
4. After the code block, explain what you changed or created
5. Make sure all HTML elements are properly closed and structured
6. ALWAYS make the html code as short as possible, with the same functionality as the original code, if it gets too long, remake the whole code.
7. ALWAYS make the website look MODERN, no matter what the user asks for.`
      }
    ];

    if (history.length > 0) {
      messages.push(...history.slice(-MAX_HISTORY * 2));
    }

    messages.push({
      role: 'user',
      content: lastCode 
        ? `Previous code:\n${lastCode}\n\nUser request: ${prompt}`
        : prompt
    });

    console.log('Sending request to API...');
    const response = await fetch('https://api.llama-api.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages,
        stream: false,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    console.log('Received API response');
    const data = await response.json();
    
    if (!data || !data.choices || !data.choices[0]) {
      console.error('Invalid API response:', data);
      throw new Error('Invalid API response structure');
    }

    history = [
      ...history,
      { role: 'user', content: prompt },
      { role: 'assistant', content: data.choices[0].message.content }
    ].slice(-MAX_HISTORY * 2);

    conversationHistories.set(conversationId, history);

    const parsedResponse = parseResponse(data.choices[0].message.content, prompt);
    console.log('Sending response to client');
    
    res.json({ 
      content: parsedResponse.code,
      chatText: parsedResponse.chatText,
      conversationId
    });

  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ 
      message: 'Error processing request',
      content: '<div>Error processing request</div>',
      chatText: 'Sorry, there was an error processing your request.'
    });
  }
});

async function processPrompt(prompt) {
  const lowerCasePrompt = prompt.toLowerCase().trim();

  if (lowerCasePrompt.startsWith('generate html code for')) {
    const content = lowerCasePrompt.replace('generate html code for', '').trim();

    // Example: Generate a heading if the content starts with "heading"
    if (content.startsWith('heading')) {
      const headingText = content.replace('heading', '').trim();
      return `<h1>${headingText}</h1>`;
    }

    // Example: Generate a list if the content starts with "list"
    if (content.startsWith('list')) {
      const items = content.replace('list', '').trim().split(',');
      const listItems = items.map(item => `<li>${item.trim()}</li>`).join('');
      return `<ul>${listItems}</ul>`;
    }

    // Default to paragraph if no specific command is found
    return `<p>${content}</p>`;
  }

  // If no specific command is found, return a default message
  return `<p>Unrecognized command: ${prompt}</p>`;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
process.on('uncaughtException', e => console.log('Oops: ' + e)); 
