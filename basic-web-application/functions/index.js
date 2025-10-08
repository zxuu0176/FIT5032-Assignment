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
import sgMail from "@sendgrid/mail";

admin.initializeApp();

export const sendRegistrationEmail = onRequest({
  secrets: ["SENDGRID_API_KEY"],
  cors: true,
}, async (req, res) => {

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

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

    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    console.log('API Key Debug:');
    console.log('Raw length:', sendGridApiKey?.length);

    // THOROUGH cleaning
    const cleanApiKey = sendGridApiKey
      .replace(/\r/g, '')   // Remove carriage returns
      .replace(/\n/g, '')   // Remove newlines
      .replace(/\t/g, '')   // Remove tabs
      .trim();              // Remove spaces

    console.log('Cleaned API key length:', cleanApiKey.length);

    // Validate key format
    if (!cleanApiKey.startsWith('SG.')) {
      console.error('Invalid API key format - does not start with SG.');
      res.status(500).send({ error: 'Invalid API key configuration' });
      return;
    }

    sgMail.setApiKey(cleanApiKey);

    const msg = {
      to: email,
      from: 'jayxcats@gmail.com',
      subject: `Registration confirmed: ${program}`,
      text: `Hi ${name},\n\nThank you for registering for ${program}.`,
      html: `<p>Hi ${name},</p><p>Thank you for registering for <strong>${program}</strong>.</p>`
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', email);
    res.status(200).send({ success: true });

  } catch (error) {
    console.error('SendGrid error:', error);
    res.status(500).send({ error: 'Failed to send email' });
  }
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
