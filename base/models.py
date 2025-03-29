from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Create your models here.

class Profile(models.Model):
    ROLE_CHOICES = [
        ('citizen', 'Citizen'),
        ('government', 'Government Official'),
        ('admin', 'Administrator'),
    ]
    
    CITY_CHOICES = [
        ('noida', 'Noida'),
        ('mumbai', 'Mumbai'),
        ('bangalore', 'Bangalore'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='citizen')
    city = models.CharField(max_length=20, choices=CITY_CHOICES, default='noida')

    def __str__(self):
        return f"{self.user.email} - {self.role} ({self.city})"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.get_or_create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
