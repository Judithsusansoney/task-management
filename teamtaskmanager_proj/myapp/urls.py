from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SignupView, CustomAuthToken, ProjectViewSet, TaskViewSet, DashboardView, UserViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'users', UserViewSet)

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('', include(router.urls)),
]
