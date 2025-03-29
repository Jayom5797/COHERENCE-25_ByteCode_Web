from django.urls import path
from . import views

urlpatterns = [
    # ... your existing URL patterns ...
    path('send-emergency-sms/', views.send_emergency_sms, name='send_emergency_sms'),
] 