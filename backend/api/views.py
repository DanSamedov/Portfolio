from rest_framework import generics
from rest_framework.throttling import ScopedRateThrottle
from .models import ContactMessage
from .serializers import ContactMessageSerializer

class ContactCreateView(generics.CreateAPIView):
    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer
    
    throttle_classes = [ScopedRateThrottle]
    
    throttle_scope = 'contact_email'