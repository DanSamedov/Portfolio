# backend/api/views.py
from rest_framework import generics
from django.conf import settings
from .models import ContactMessage
from .serializers import ContactMessageSerializer
from .utils import EmailThread 

class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    def perform_create(self, serializer):
        instance = serializer.save()

        subject = f"Thanks for reaching out, {instance.name}!"
        message = f"Hi {instance.name} :),\n\nI received your message and will get back to you as fast as possible.\n\nBest regards,\nDanylo Samedov"
        recipient_list = [instance.email]

        EmailThread(subject, message, recipient_list).start()
        EmailThread(
            subject=f"New Contact: {instance.name}",
            message=f"Name: {instance.name}\nEmail: {instance.email}\n\nMessage:\n{instance.message}",
            recipient_list=[settings.EMAIL_HOST_USER]
        ).start()
