from django.urls import path
from .views import CompetitorPageListAPIView, CompetitorPageDetailAPIView

urlpatterns = [
    path('', CompetitorPageListAPIView.as_view(), name='competitor-list'),
    path('<int:pk>/', CompetitorPageDetailAPIView.as_view(), name='competitor-detail'),
]
