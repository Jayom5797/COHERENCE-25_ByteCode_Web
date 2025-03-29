from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from .twilio_utils import send_bulk_sms
import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

@csrf_exempt
@require_POST
def send_emergency_sms(request):
    try:
        data = json.loads(request.body)
        title = data.get('title')
        message = data.get('message')
        priority = data.get('priority')
        area = data.get('area')
        
        # Format the message
        formatted_message = f"🚨 EMERGENCY ALERT 🚨\n\nTitle: {title}\nPriority: {priority.upper()}\nArea: {area}\n\nMessage: {message}"
        
        # List of recipients with properly formatted phone numbers
        recipients = [
            "7208579251",  # Remove +91 prefix, it will be added in twilio_utils.py
            "9619290827"
        ]
        
        logger.debug(f"Attempting to send emergency alert to {len(recipients)} recipients")
        logger.debug(f"Message content: {formatted_message}")
        logger.debug(f"Using Twilio number: {settings.TWILIO_PHONE_NUMBER}")
        
        # Send SMS
        results = send_bulk_sms(recipients, formatted_message)
        
        # Count successes and failures
        success_count = sum(1 for r in results if r['status'] == 'success')
        failure_count = sum(1 for r in results if r['status'] == 'error')
        
        # Log detailed results
        for result in results:
            if result['status'] == 'success':
                logger.info(f"Successfully sent SMS to {result['recipient']}")
            else:
                logger.error(f"Failed to send SMS to {result['recipient']}: {result['error_message']}")
                if 'error_details' in result:
                    logger.error(f"Error details: {result['error_details']}")
        
        return JsonResponse({
            'status': 'success',
            'message': f'SMS sent to {success_count} recipients. {failure_count} failed.',
            'details': results,
            'debug_info': {
                'twilio_number': settings.TWILIO_PHONE_NUMBER,
                'message_length': len(formatted_message),
                'recipients': recipients
            }
        })
        
    except Exception as e:
        logger.error(f"Error in send_emergency_sms: {str(e)}")
        return JsonResponse({
            'status': 'error',
            'message': str(e),
            'debug_info': {
                'twilio_number': settings.TWILIO_PHONE_NUMBER
            }
        }, status=500) 