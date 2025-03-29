from twilio.rest import Client
from django.conf import settings
from concurrent.futures import ThreadPoolExecutor
import logging
from twilio.base.exceptions import TwilioRestException

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Twilio API credentials - These should be in your Django settings
ACCOUNT_SID = settings.TWILIO_ACCOUNT_SID
AUTH_TOKEN = settings.TWILIO_AUTH_TOKEN
TWILIO_PHONE_NUMBER = settings.TWILIO_PHONE_NUMBER

def send_single_sms(client, recipient, message):
    """Send a single SMS message."""
    try:
        # Clean the phone number (remove spaces and any non-numeric characters)
        recipient = ''.join(filter(str.isdigit, recipient))
        if not recipient.startswith('91'):
            recipient = '91' + recipient
        recipient = '+' + recipient
        
        logger.debug(f"Attempting to send SMS to {recipient}")
        logger.debug(f"Using Twilio number: {TWILIO_PHONE_NUMBER}")
        logger.debug(f"Message content: {message}")
        
        # Try to send the message directly without verification check
        try:
            message_instance = client.messages.create(
                body=message,
                from_=TWILIO_PHONE_NUMBER,
                to=recipient
            )
            
            logger.debug(f"Successfully sent SMS to {recipient}. SID: {message_instance.sid}")
            return {
                'recipient': recipient,
                'status': 'success',
                'message_sid': message_instance.sid
            }
        except TwilioRestException as e:
            logger.error(f"Twilio API Error: Code {e.code}, Message: {e.msg}")
            logger.error(f"Error details: {e.details}")
            
            # Handle specific error codes
            if e.code == 63038:  # Daily message limit exceeded
                error_msg = "Daily message limit exceeded. Please upgrade your Twilio account."
            elif e.code == 21614:  # Number not verified
                error_msg = "Phone number not verified. Please verify it in the Twilio console."
            elif e.code == 21211:  # Invalid phone number
                error_msg = "Invalid phone number format. Please check the number."
            else:
                error_msg = f"Twilio Error: {e.code} - {e.msg}"
            
            return {
                'recipient': recipient,
                'status': 'error',
                'error_message': error_msg,
                'error_code': e.code,
                'error_details': e.details
            }
            
    except Exception as e:
        error_msg = f"General Error: {str(e)}"
        logger.error(f"Failed to send SMS to {recipient}: {error_msg}")
        return {
            'recipient': recipient,
            'status': 'error',
            'error_message': error_msg
        }

def send_bulk_sms(recipients, message):
    """Send SMS messages to multiple recipients efficiently."""
    try:
        logger.debug(f"Initializing Twilio client with SID: {ACCOUNT_SID}")
        client = Client(ACCOUNT_SID, AUTH_TOKEN)
        results = []
        
        # Create a ThreadPoolExecutor for parallel processing
        with ThreadPoolExecutor(max_workers=5) as executor:
            # Create tasks for each recipient
            tasks = [
                executor.submit(send_single_sms, client, recipient, message)
                for recipient in recipients
            ]
            
            # Collect results as they complete
            for future in tasks:
                result = future.result()
                results.append(result)
        
        return results
    except Exception as e:
        logger.error(f"Error in send_bulk_sms: {str(e)}")
        raise 