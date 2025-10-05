/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

/* eslint-env node */
/* global process */

import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import admin from "firebase-admin";
// cors middleware not used; handling CORS manually below
import sgMail from "@sendgrid/mail";

admin.initializeApp();

// Configure SendGrid API key from env (injected via Firebase secret)
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('SENDGRID_API_KEY is not set in environment. sendRegistrationEmail will fail without it.');
}

console.log('SENDGRID_API_KEY present:', !!process.env.SENDGRID_API_KEY);

// HTTP function to send registration confirmation emails via SendGrid.
export const sendRegistrationEmail = onRequest({ secrets: ["SENDGRID_API_KEY"] }, (req, res) => {
  // Dynamic CORS: echo back the request Origin when present (whitelistable)
  const origin = req.get('Origin') || req.get('origin') || '';
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173'
    // add more allowed origins here for staging/production
  ];

  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';
  res.set('Access-Control-Allow-Origin', allowOrigin);
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Credentials', 'true');
  res.set('Access-Control-Max-Age', '3600');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  (async () => {
    try {
      if (req.method !== 'POST') {
        res.status(405).send({ error: 'Method not allowed, use POST' });
        return;
      }

      const { name, email, program } = req.body || {};

      if (!name || !email || !program) {
        res.status(400).send({ error: 'Missing required fields: name, email, program' });
        return;
      }

      if (!process.env.SENDGRID_API_KEY) {
        res.status(500).send({ error: 'SendGrid API key not configured on server' });
        return;
      }

      const msg = {
        to: email,
        from: 'zxuu0176@student.monash.edu', // TODO: change to a verified sender
        subject: `Registration confirmed: ${program}`,
        text: `Hi ${name},\n\nThank you for registering for ${program}. We'll be in touch with more details soon.\n\nBest regards,\nProgram Team`,
        html: `<p>Hi ${name},</p><p>Thank you for registering for <strong>${program}</strong>. We'll be in touch with more details soon.</p><p>Best regards,<br/>Program Team</p>`
      };

  // Send email and capture SendGrid response for troubleshooting
  const responses = await sgMail.send(msg);
  // sgMail.send returns an array of responses; log and return the first
  const sgResp = Array.isArray(responses) && responses.length ? responses[0] : responses;
  console.log('SendGrid response headers:', sgResp && sgResp.headers ? sgResp.headers : sgResp);

  res.status(200).send({ success: true, sendgrid: sgResp && sgResp.headers ? sgResp.headers : null });
    } catch (error) {
      console.error('Error sending registration email:', error);
      res.status(500).send({ error: error.message || 'Error sending email' });
    }
  })();
});

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
