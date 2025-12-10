from django.urls import path
from .views import ContactCreateView

urlpatterns = [
    # The endpoint will be: http://localhost:8000/api/contact/
    path('contact/', ContactCreateView.as_view(), name='contact_create'),
]