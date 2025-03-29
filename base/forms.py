from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Profile

class CustomUserRegistrationForm(UserCreationForm):
    CITY_CHOICES = [
        ('noida', 'Noida'),
        ('mumbai', 'Mumbai'),
        ('bangalore', 'Bangalore'),
    ]
    
    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('government', 'Government Official'),
        ('admin', 'Administrator'),
    ]

    name = forms.CharField(max_length=100, required=True)
    email = forms.EmailField(required=True)
    city = forms.ChoiceField(choices=CITY_CHOICES, required=True)
    role = forms.ChoiceField(choices=ROLE_CHOICES, required=True)

    class Meta:
        model = User
        fields = ('name', 'email', 'password1', 'password2', 'city', 'role')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.username = self.cleaned_data['email']  # Use email as username
        user.email = self.cleaned_data['email']
        user.first_name = self.cleaned_data['name']

        if commit:
            user.save()
            # Update the profile instead of creating a new one
            profile, created = Profile.objects.get_or_create(user=user)
            profile.role = self.cleaned_data['role']
            profile.city = self.cleaned_data['city']
            profile.save()

        return user 