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

/**
 * Bulk Email Cloud Function - HTTP endpoint version
 * Allows admins to send emails to multiple selected users from the admin panel
 */
export const sendBulkEmail = onRequest({
  secrets: ["SENDGRID_API_KEY"],
  cors: true,
}, async (req, res) => {

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).send({ error: 'Method not allowed, use POST' });
    return;
  }

  try {
    const { userEmails, subject, message, emailType = 'admin-bulk' } = req.body;

    // Input validation
    if (!userEmails || !Array.isArray(userEmails) || userEmails.length === 0) {
      res.status(400).send({ error: 'User emails array is required and cannot be empty' });
      return;
    }

    if (!subject || !message) {
      res.status(400).send({ error: 'Subject and message are required' });
      return;
    }

    // Limit batch size for safety
    const MAX_BATCH_SIZE = 50;
    if (userEmails.length > MAX_BATCH_SIZE) {
      res.status(400).send({ error: `Cannot send to more than ${MAX_BATCH_SIZE} users at once` });
      return;
    }

    // Manual authentication check - verify Firebase ID token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).send({ error: 'Authentication required' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).send({ error: 'Invalid authentication token' });
      return;
    }

    // Authorization check - only admins can send bulk emails
    const userEmail = decodedToken.email;
    if (!userEmail.includes('admin')) { // Replace with your actual admin check
      res.status(403).send({ error: 'Admin access required for bulk emails' });
      return;
    }

    // Configure SendGrid
    const sendGridApiKey = process.env.SENDGRID_API_KEY;
    console.log('Bulk Email API Key Debug - Raw length:', sendGridApiKey?.length);

    // THOROUGH cleaning
    const cleanApiKey = sendGridApiKey
      .replace(/\r/g, '')   // Remove carriage returns
      .replace(/\n/g, '')   // Remove newlines
      .replace(/\t/g, '')   // Remove tabs
      .trim();              // Remove spaces

    console.log('Bulk Email - Cleaned API key length:', cleanApiKey.length);

    // Validate key format
    if (!cleanApiKey.startsWith('SG.')) {
      console.error('Invalid API key format - does not start with SG.');
      res.status(500).send({ error: 'Invalid API key configuration' });
      return;
    }

    sgMail.setApiKey(cleanApiKey);

    const results = {
      successful: [],
      failed: [],
      total: userEmails.length
    };

    // Send emails in parallel with rate limiting
    const emailPromises = userEmails.map(async (email, index) => {
      // Small delay to avoid hitting rate limits (100ms between emails)
      await new Promise(resolve => setTimeout(resolve, index * 100));

      try {
        const msg = {
          to: email,
          from: 'jayxcats@gmail.com',
          subject: subject,
          text: message,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${subject}</h2>
              <div style="background: #f9f9f9; padding: 20px; border-radius: 5px; margin: 15px 0;">
                ${message.replace(/\n/g, '<br>')}
              </div>
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #666; font-size: 12px;">
                This email was sent from Inter Throw Organization Admin Panel.
                Please do not reply to this automated message.
              </p>
            </div>
          `,
          customArgs: {
            email_type: emailType,
            sent_by: userEmail,
            batch_id: Date.now().toString()
          }
        };

        await sgMail.send(msg);
        results.successful.push({
          email: email,
          status: 'sent'
        });

        console.log(`Bulk email sent successfully to: ${email}`);

      } catch (error) {
        console.error(`Failed to send bulk email to ${email}:`, error);
        results.failed.push({
          email: email,
          error: error.message,
          status: 'failed'
        });
      }
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    // Log the batch operation to Firestore
    const firestore = admin.firestore();
    await firestore.collection('emailLogs').add({
      sentBy: userEmail,
      subject: subject,
      recipientCount: userEmails.length,
      successfulCount: results.successful.length,
      failedCount: results.failed.length,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      emailType: emailType,
      messagePreview: message.substring(0, 100) + (message.length > 100 ? '...' : '')
    });

    console.log(`Bulk email operation completed: ${results.successful.length} successful, ${results.failed.length} failed`);

    // Return results in the exact format expected by AdminPage.vue
    res.status(200).json({
      success: true,
      results: results,
      summary: {
        totalSent: results.successful.length,
        totalFailed: results.failed.length,
        successRate: ((results.successful.length / userEmails.length) * 100).toFixed(1) + '%'
      }
    });

  } catch (error) {
    console.error('Bulk email function error:', error);

    // Return error in format expected by AdminPage.vue
    res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
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
