from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.models import User
from django.contrib import messages
from .forms import CustomUserRegistrationForm
from django.contrib.auth.decorators import login_required
from django.conf import settings

# Create your views here.

def home_view(request):
    return render(request, 'index.html')

def logout_view(request):
    logout(request)
    # messages.success(request, 'You have been successfully logged out.')
    return redirect('login')

@login_required
def citizen_dashboard(request):
    if request.user.profile.role != 'citizen':
        messages.error(request, 'Access Denied: You must be a citizen to view this page.')
        return redirect('home')
    return render(request, 'dashboards/citizen_dashboard.html')

@login_required
def government_dashboard(request):
    if request.user.profile.role != 'government':
        messages.error(request, 'Access Denied: You must be a government official to view this page.')
        return redirect('home')
    return render(request, 'dashboards/government_dashboard.html')

@login_required
def admin_dashboard(request):
    if request.user.profile.role != 'admin':
        messages.error(request, 'Access Denied: You must be an administrator to view this page.')
        return redirect('home')
    context = {
        'GOOGLE_MAPS_API_KEY': settings.GOOGLE_MAPS_API_KEY,
        'GOOGLE_MAPS_ID': settings.GOOGLE_MAPS_ID,  # We'll add this to settings.py
    }
    return render(request, 'dashboards/admin_dashboard.html', context)

@login_required
def complaints_dashboard(request):
    if request.user.profile.role != 'admin':
        return redirect('home')
    return render(request, 'dashboards/complaints.html')

@login_required
def analytics_dashboard(request):
    if request.user.profile.role != 'admin':
        return render(request, 'dashboards/analytics_dashboard.html')
    return render(request, 'dashboards/analytics_dashboard.html')

@login_required
def emergency_alerts_dashboard(request):
    if request.user.profile.role != 'admin':
        return render(request, 'dashboards/emergency.html')
    return render(request, 'dashboards/emergency.html')

@login_required
def citizens_dashboard(request):
    if request.user.profile.role != 'admin':
        return render(request, 'dashboards/citizen.html')
    return render(request, 'dashboards/citizen.html')

@login_required
def events_dashboard(request):
    if request.user.profile.role != 'admin':
        # messages.error(request, 'Access Denied: You must be an administrator to view this page.')
        return render(request, 'dashboards/events.html')
    return render(request, 'dashboards/events.html')

@login_required
def schedule_dashboard(request):
    if request.user.profile.role != 'admin':
        return render(request, 'dashboards/schedule.html')
    return render(request, 'dashboards/schedule.html')

@login_required
def equipment_dashboard(request):
    if request.user.profile.role != 'admin':
        return render(request, 'dashboards/equipment_dashboard.html')
    return render(request, 'dashboards/equipment_dashboard.html')

@login_required
def performance_dashboard(request):
    if request.user.profile.role != 'admin':

        return render(request, 'dashboards/performance.html')
    return render(request, 'dashboards/performance.html')

@login_required
def settings_dashboard(request):
    if request.user.profile.role != 'admin':
        return render(request, 'dashboards/settings.html')
    return render(request, 'dashboards/settings.html')

def login_view(request):
    # Get the next URL from query parameters
    next_url = request.GET.get('next', None)
    
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            # messages.success(request, 'Login successful!')
            
            # If there's a next URL, redirect there
            if next_url:
                return redirect(next_url)
            
            # Otherwise, redirect based on user role
            role = user.profile.role
            if role == 'citizen':
                return redirect('citizen_dashboard')
            elif role == 'government':
                return redirect('government_dashboard')
            elif role == 'admin':
                return redirect('admin_dashboard')
            else:
                return redirect('home')
        else:
            messages.error(request, 'Invalid email or password.')
    
    return render(request, 'login.html')

def signup_view(request):
    if request.method == 'POST':
        form = CustomUserRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            messages.success(request, 'Account created successfully! Please log in.')
            return redirect('login')
        else:
            for error in form.errors.values():
                messages.error(request, error)
    else:
        form = CustomUserRegistrationForm()
    
    return render(request, 'signup.html', {'form': form})
