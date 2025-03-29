from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('signup/', views.signup_view, name='signup'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('dashboard/citizen/', views.citizen_dashboard, name='citizen_dashboard'),
    path('dashboard/government/', views.government_dashboard, name='government_dashboard'),
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/complaints/', views.complaints_dashboard, name='complaints_dashboard'),
    path('dashboard/analytics_dashboard/', views.analytics_dashboard, name='analytics_dashboard'),
    path('dashboard/emergency/', views.emergency_alerts_dashboard, name='emergency_alerts_dashboard'),
    path('dashboard/citizens/', views.citizens_dashboard, name='citizens_dashboard'),
    path('dashboard/events/', views.events_dashboard, name='events_dashboard'),
    path('dashboard/schedule/', views.schedule_dashboard, name='schedule_dashboard'),
    path('dashboard/equipment_dashboard/', views.equipment_dashboard, name='equipment_dashboard'),
    path('dashboard/performance/', views.performance_dashboard, name='performance_dashboard'),
    path('dashboard/settings/', views.settings_dashboard, name='settings_dashboard'),
]
