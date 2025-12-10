from rest_framework import serializers
from .models import ContactMessage

class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        # These are the fields the frontend is allowed to send
        fields = ['name', 'email', 'message']