# Generated by Django 5.1.7 on 2025-03-28 10:09

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('citizen', 'Citizen'), ('government', 'Government Official'), ('service', 'Service Provider'), ('business', 'Business Owner')], default='citizen', max_length=20)),
                ('city', models.CharField(choices=[('noida', 'Noida'), ('mumbai', 'Mumbai'), ('bangalore', 'Bangalore')], default='delhi', max_length=20)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
