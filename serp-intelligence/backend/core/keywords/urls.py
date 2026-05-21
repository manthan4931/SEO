from django.urls import path
from .views import KeywordListCreateAPIView, KeywordDetailAPIView, KeywordLogsAPIView
from .brainstorm import KeywordBrainstormAPIView

urlpatterns = [
    path('', KeywordListCreateAPIView.as_view(), name='keyword-list-create'),
    path('<int:pk>/', KeywordDetailAPIView.as_view(), name='keyword-detail'),
    path('<int:pk>/logs/', KeywordLogsAPIView.as_view(), name='keyword-logs'),
    path('brainstorm/', KeywordBrainstormAPIView.as_view(), name='keyword-brainstorm'),
]
