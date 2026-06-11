const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const JSON_HEADERS = { ...CORS, 'Content-Type': 'application/json' };

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    logType: { type: 'string' },
    severity: { type: 'string' },
    timeline: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          step: { type: 'integer' },
          timestamp: { type: 'string' },
          event: { type: 'string' },
          lineNumbers: { type: 'array', items: { type: 'integer' } },
          type: { type: 'string' },
        },
        required: ['step', 'event', 'type'],
        additionalProperties: false,
      },
    },
    rootCause: { type: 'string' },
    interestingLines: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          lineNumber: { type: 'integer' },
          content: { type: 'string' },
          reason: { type: 'string' },
          type: { type: 'string' },
        },
        required: ['lineNumber', 'content', 'reason', 'type'],
        additionalProperties: false,
      },
    },
    explanation: { type: 'string' },
    suggestions: { type: 'array', items: { type: 'string' } },
  },
  required: ['summary', 'logType', 'severity', 'timeline', 'rootCause', 'interestingLines', 'explanation', 'suggestions'],
  additionalProperties: false,
};

const SYSTEM_PROMPT = `You are an expert log and error analyser for DevOps and platform engineers.
Analyse the provided log output or error screenshot and return structured JSON.

Rules:
- timeline: list execution steps IN ORDER as they happened. Be specific about what happened at each step. Use type values: entry, exit, error, warning, info, interesting
- interestingLines: identify the MOST IMPORTANT lines — errors, exceptions, unusual patterns, key entry points, performance issues, security issues. lineNumber is 1-based from the input text. Include as many as are genuinely interesting.
- severity: "critical" = crash/data loss/service down, "error" = operation failed, "warning" = degraded/risky, "info" = normal/informational
- logType: identify the format precisely (e.g. "Python traceback", "C# stack trace", "nginx access log", "Docker compose log", "Kubernetes pod log", "Java exception", "Node.js error", "systemd journal", "Apache error log", etc.)
- rootCause: one or two sentences explaining the actual root cause
- explanation: detailed explanation of what happened and why, suitable for a DevOps engineer
- suggestions: specific, actionable steps to fix or investigate the issue

For C# stack traces: identify the exception type, the call chain, and which assembly/namespace is the entry point.
For Python tracebacks: trace back from the innermost exception to the outermost caller.
For structured logs (JSON, logfmt): parse the fields and show the event sequence.
If given a screenshot, extract and analyse the visible log content.`;

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { text, imageBase64, imageMediaType } = body;
    const model = body.model || 'claude-opus-4-8';
    const SUPPORTED_MODELS = ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5-20251001'];
    if (!SUPPORTED_MODELS.includes(model)) {
      return new Response(JSON.stringify({ error: `Unsupported model: ${model}` }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }
    const supportsThinking = model.startsWith('claude-opus-');

    if (!text && !imageBase64) {
      return new Response(JSON.stringify({ error: 'Provide log text or a screenshot.' }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const apiKey = env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured on this deployment.' }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }

    const content = [];

    if (imageBase64 && imageMediaType) {
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: imageMediaType, data: imageBase64 },
      });
    }

    if (text) {
      content.push({
        type: 'text',
        text: `Analyse this log/error output:\n\n${text}`,
      });
    } else {
      content.push({
        type: 'text',
        text: 'Analyse the log/error output visible in this screenshot.',
      });
    }

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        ...(supportsThinking && { thinking: { type: 'adaptive' } }),
        system: SYSTEM_PROMPT,
        output_config: {
          format: { type: 'json_schema', schema: RESPONSE_SCHEMA },
        },
        messages: [{ role: 'user', content }],
      }),
    });

    if (!claudeRes.ok) {
      const err = await claudeRes.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ error: err?.error?.message || `Claude API error ${claudeRes.status}` }),
        { status: claudeRes.status, headers: JSON_HEADERS }
      );
    }

    const data = await claudeRes.json();

    if (data.stop_reason === 'refusal') {
      return new Response(JSON.stringify({ error: 'Content was declined. Try rephrasing or removing sensitive data.' }), {
        status: 400,
        headers: JSON_HEADERS,
      });
    }

    const textBlock = data.content?.find(b => b.type === 'text');
    if (!textBlock?.text) {
      return new Response(JSON.stringify({ error: 'No analysis returned from Claude.' }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }

    const analysis = JSON.parse(textBlock.text);

    return new Response(JSON.stringify(analysis), { headers: JSON_HEADERS });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || 'Unexpected error' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { headers: CORS });
}
