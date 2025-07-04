// src/utils/response.js

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status,
  });
}

export function htmlResponse(html, status = 200) {
  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
    status,
  });
}

export function errorResponse(message, status = 400) {
  return jsonResponse({ error: message }, status);
}
