#!/usr/bin/env python3
"""
Stripe Webhook Handler for BlackRoad OS
Handles payment events and updates sponsor database

Copyright: BlackRoad OS, Inc.
"""

import os
import json
from flask import Flask, request, jsonify
import stripe

app = Flask(__name__)

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')
webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

@app.route('/webhook', methods=['POST'])
def webhook():
    payload = request.data
    sig_header = request.headers.get('Stripe-Signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        return jsonify({'error': 'Invalid payload'}), 400
    except stripe.error.SignatureVerificationError as e:
        return jsonify({'error': 'Invalid signature'}), 400

    # Handle the event
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        handle_successful_payment(session)

    elif event['type'] == 'customer.subscription.created':
        subscription = event['data']['object']
        handle_new_subscription(subscription)

    elif event['type'] == 'customer.subscription.deleted':
        subscription = event['data']['object']
        handle_cancelled_subscription(subscription)

    return jsonify({'status': 'success'}), 200

def handle_successful_payment(session):
    # Update sponsor database
    # Send thank you email
    # Add to SPONSORS.md
    pass

def handle_new_subscription(subscription):
    # Add to recurring sponsors list
    # Send welcome email
    pass

def handle_cancelled_subscription(subscription):
    # Update sponsor status
    # Send follow-up email
    pass

if __name__ == '__main__':
    app.run(port=4242)
